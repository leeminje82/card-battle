import {
  ref,
  set,
  get,
  onValue,
  runTransaction,
  onDisconnect,
  type Unsubscribe,
} from 'firebase/database'
import { getDb, ensureAuth } from './config'
import type { Card, GameState, Player, PlayerId } from '../types'
import { createDeck, shuffle, draw } from '../utils/deck'
import { resolveBattle } from '../utils/battle'
import { START_HAND, START_HP } from '../data/cards'

const roomRef = (roomId: string) => ref(getDb(), `rooms/${roomId}`)

// 4자리 방 코드 (헷갈리는 0/O/1/I 제외)
function makeRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function newPlayer(name: string, hand: Card[]): Player {
  return {
    name,
    hp: START_HP,
    hand,
    selected: null,
    ready: false,
    debuff: { attackSealed: false },
  }
}

// 방 생성 — 방장(p1). 덱을 섞고 p1에게 5장 배분. status = waiting.
export async function createRoom(name: string): Promise<string> {
  await ensureAuth()
  const deck = shuffle(createDeck())
  const p1Hand = deck.splice(0, START_HAND)

  // 코드 충돌 회피 (최대 5회 시도)
  let roomId = makeRoomCode()
  for (let i = 0; i < 5; i++) {
    const snap = await get(roomRef(roomId))
    if (!snap.exists()) break
    roomId = makeRoomCode()
  }

  const state: GameState = {
    status: 'waiting',
    round: 1,
    winner: null,
    host: 'p1',
    resolvedRound: 0,
    p1: newPlayer(name, p1Hand),
    p2: newPlayer('', []),
    deck,
    discard: [],
    lastResult: null,
  }
  await set(roomRef(roomId), state)
  return roomId
}

// 방 참가 — p2. 덱에서 5장 배분, status = playing.
export async function joinRoom(roomId: string, name: string): Promise<boolean> {
  await ensureAuth()
  const result = await runTransaction(roomRef(roomId), (room: GameState | null) => {
    if (!room) return room // 방 없음 → 그대로 (실패)
    if (room.status !== 'waiting') return // 이미 시작/종료된 방 → 중단
    const deck = room.deck ?? []
    const p2Hand = deck.splice(0, START_HAND)
    room.p2 = newPlayer(name, p2Hand)
    room.deck = deck
    room.status = 'playing'
    return room
  })
  return result.committed && result.snapshot.exists() && result.snapshot.val()?.p2?.name === name
}

// 실시간 구독
export function subscribeRoom(
  roomId: string,
  cb: (state: GameState | null) => void,
): Unsubscribe {
  return onValue(roomRef(roomId), (snap) => {
    cb(snap.exists() ? (snap.val() as GameState) : null)
  })
}

// 상대 이탈 감지용: 내 연결 노드 등록 (MVP — 끊기면 표시)
export async function markPresence(roomId: string, pid: PlayerId): Promise<void> {
  const presence = ref(getDb(), `rooms/${roomId}/${pid}/online`)
  await set(presence, true)
  onDisconnect(presence).set(false)
}

// 방 나가기 — 내 접속 상태를 false 로 표시 (상대가 즉시 인지)
export async function leaveRoom(roomId: string, pid: PlayerId): Promise<void> {
  try {
    await set(ref(getDb(), `rooms/${roomId}/${pid}/online`), false)
  } catch {
    // 네트워크 문제 등은 무시 — 어차피 로컬에서는 메뉴로 나간다
  }
}

// 카드 선택 + 준비 완료
export async function selectCard(
  roomId: string,
  pid: PlayerId,
  card: Card,
): Promise<void> {
  await runTransaction(roomRef(roomId), (room: GameState | null) => {
    if (!room) return room
    if (room.status !== 'playing') return
    const p = room[pid]
    if (!p || p.ready) return // 이미 선택했으면 중단
    p.selected = card
    p.ready = true
    return room
  })
}

// 양쪽 ready 감지 시 전투 계산 — 반드시 host(p1) 만 호출.
// transaction + resolvedRound 락으로 단 한 번만 처리.
export async function resolveIfReady(roomId: string): Promise<void> {
  await runTransaction(roomRef(roomId), (room: GameState | null) => {
    if (!room) return room
    if (room.status !== 'playing') return
    if (!room.p1?.ready || !room.p2?.ready) return
    if (!room.p1.selected || !room.p2.selected) return
    if (room.resolvedRound >= room.round) return // 이미 처리됨 (락)

    const out = resolveBattle(
      { card: room.p1.selected, hp: room.p1.hp, debuff: room.p1.debuff },
      { card: room.p2.selected, hp: room.p2.hp, debuff: room.p2.debuff },
    )
    room.p1.hp = out.p1Hp
    room.p2.hp = out.p2Hp
    room.p1.debuff = out.p1NextDebuff
    room.p2.debuff = out.p2NextDebuff
    room.lastResult = {
      logs: out.logs,
      p1card: room.p1.selected,
      p2card: room.p2.selected,
      p1Hp: out.p1Hp,
      p2Hp: out.p2Hp,
    }
    room.resolvedRound = room.round
    room.winner = out.winner
    if (out.winner) room.status = 'finished'
    return room
  })
}

// 결과 공개 후 다음 라운드로 — 반드시 host(p1) 만 호출.
// 사용 카드를 버린 더미로 옮기고 각자 1장 드로우, selected/ready 초기화, round+1.
export async function advanceRound(roomId: string): Promise<void> {
  await runTransaction(roomRef(roomId), (room: GameState | null) => {
    if (!room) return room
    if (room.status !== 'playing') return
    if (room.resolvedRound !== room.round) return // 공개 상태가 아니면 중단(중복 방지)

    let deck = room.deck ?? []
    let discard = room.discard ?? []

    for (const pid of ['p1', 'p2'] as PlayerId[]) {
      const p = room[pid]
      const used = p.selected
      if (used) {
        p.hand = (p.hand ?? []).filter((c) => c.id !== used.id)
        discard.push(used)
        const dr = draw(deck, discard)
        deck = dr.deck
        discard = dr.discard
        if (dr.card) p.hand.push(dr.card)
      }
      p.selected = null
      p.ready = false
    }

    room.deck = deck
    room.discard = discard
    room.round = room.round + 1
    return room
  })
}

// 다시 하기 — 덱 재생성, HP/손패 리셋, round 1, status playing.
export async function restartGame(roomId: string): Promise<void> {
  await runTransaction(roomRef(roomId), (room: GameState | null) => {
    if (!room) return room
    const deck = shuffle(createDeck())
    const p1Hand = deck.splice(0, START_HAND)
    const p2Hand = deck.splice(0, START_HAND)
    room.p1 = { ...newPlayer(room.p1?.name ?? '아빠', p1Hand) }
    room.p2 = { ...newPlayer(room.p2?.name ?? '아들', p2Hand) }
    room.deck = deck
    room.discard = []
    room.round = 1
    room.resolvedRound = 0
    room.winner = null
    room.lastResult = null
    room.status = 'playing'
    return room
  })
}
