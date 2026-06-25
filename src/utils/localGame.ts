import type { Card, GameState, Player } from '../types'
import { createDeck, shuffle, draw } from './deck'
import { resolveBattle } from './battle'
import { aiChooseCard } from './ai'
import { START_HAND, START_HP } from '../data/cards'

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

// 싱글플레이용 새 게임 (Firebase 없이 로컬 상태)
export function createLocalGame(playerName: string): GameState {
  const deck = shuffle(createDeck())
  const p1Hand = deck.splice(0, START_HAND)
  const p2Hand = deck.splice(0, START_HAND)
  return {
    status: 'playing',
    round: 1,
    winner: null,
    host: 'p1',
    resolvedRound: 0,
    p1: newPlayer(playerName || '나', p1Hand),
    p2: newPlayer('AI 🤖', p2Hand),
    deck,
    discard: [],
    lastResult: null,
  }
}

// 사람이 카드를 내면 AI도 즉시 선택하고 전투를 계산해 공개 상태로 만든다.
export function playLocalRound(state: GameState, playerCard: Card): GameState {
  const aiCard = aiChooseCard(state.p2.hand, state.p2, state.p1)
  const out = resolveBattle(
    { card: playerCard, hp: state.p1.hp, debuff: state.p1.debuff },
    { card: aiCard, hp: state.p2.hp, debuff: state.p2.debuff },
  )
  return {
    ...state,
    p1: { ...state.p1, selected: playerCard, ready: true, hp: out.p1Hp, debuff: out.p1NextDebuff },
    p2: { ...state.p2, selected: aiCard, ready: true, hp: out.p2Hp, debuff: out.p2NextDebuff },
    lastResult: {
      logs: out.logs,
      p1card: playerCard,
      p2card: aiCard,
      p1Hp: out.p1Hp,
      p2Hp: out.p2Hp,
    },
    resolvedRound: state.round,
    winner: out.winner,
    status: out.winner ? 'finished' : 'playing',
  }
}

// 결과 공개 후 다음 라운드 (사용 카드 버리고 1장씩 드로우, 초기화, round+1)
export function advanceLocalRound(state: GameState): GameState {
  let deck = state.deck
  let discard = state.discard

  const advance = (p: Player): Player => {
    let hand = p.hand
    if (p.selected) {
      hand = hand.filter((c) => c.id !== p.selected!.id)
      discard = [...discard, p.selected]
      const dr = draw(deck, discard)
      deck = dr.deck
      discard = dr.discard
      if (dr.card) hand = [...hand, dr.card]
    }
    return { ...p, hand, selected: null, ready: false }
  }

  const p1 = advance(state.p1)
  const p2 = advance(state.p2)
  return { ...state, p1, p2, deck, discard, round: state.round + 1 }
}
