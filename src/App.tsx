import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Card, GameState, PlayerId } from './types'
import {
  createRoom,
  joinRoom,
  subscribeRoom,
  selectCard,
  resolveIfReady,
  advanceRound,
  restartGame,
  markPresence,
  leaveRoom,
} from './firebase/game'
import { MenuScreen } from './screens/MenuScreen'
import { LobbyScreen } from './screens/LobbyScreen'
import { GameScreen } from './screens/GameScreen'
import { GameOverScreen } from './screens/GameOverScreen'

interface Session {
  roomId: string
  myId: PlayerId
}

const SESSION_KEY = 'card-battle-session'
const REVEAL_MS = 3500

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [state, setState] = useState<GameState | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 세션 저장/복원
  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  // 실시간 구독
  useEffect(() => {
    if (!session) {
      setState(null)
      return
    }
    markPresence(session.roomId, session.myId).catch(() => {})
    const unsub = subscribeRoom(session.roomId, setState)
    return () => unsub()
  }, [session])

  // 호스트(p1) 전용 게임 진행 로직
  useEffect(() => {
    if (!session || !state || session.myId !== 'p1') return
    if (state.status !== 'playing') return

    // 1) 양쪽 ready & 아직 미처리 → 전투 계산
    if (state.p1.ready && state.p2.ready && state.resolvedRound < state.round) {
      resolveIfReady(session.roomId).catch(() => {})
      return
    }
    // 2) 결과 공개 상태 → 잠시 후 다음 라운드로
    //    advanceRound 는 resolvedRound===round 락으로 멱등하므로 중복 호출돼도 안전.
    if (state.resolvedRound === state.round && state.lastResult) {
      const t = setTimeout(() => {
        advanceRound(session.roomId).catch(() => {})
      }, REVEAL_MS)
      return () => clearTimeout(t)
    }
  }, [session, state])

  const handleCreate = useCallback(async (name: string) => {
    setBusy(true)
    setError(null)
    try {
      const roomId = await createRoom(name)
      setSession({ roomId, myId: 'p1' })
    } catch (e) {
      setError('방 생성 실패. Firebase 설정(.env)을 확인하세요.')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }, [])

  const handleJoin = useCallback(async (name: string, code: string) => {
    setBusy(true)
    setError(null)
    try {
      const ok = await joinRoom(code, name)
      if (ok) setSession({ roomId: code, myId: 'p2' })
      else setError('방을 찾을 수 없거나 이미 시작된 방입니다.')
    } catch (e) {
      setError('참가 실패. 코드와 Firebase 설정을 확인하세요.')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }, [])

  const handleSelect = useCallback(
    (card: Card) => {
      if (session) selectCard(session.roomId, session.myId, card).catch(console.error)
    },
    [session],
  )

  const handleRestart = useCallback(() => {
    if (session) restartGame(session.roomId).catch(console.error)
  }, [session])

  const handleExit = useCallback(() => {
    if (session) leaveRoom(session.roomId, session.myId).catch(() => {})
    setSession(null)
    setState(null)
  }, [session])

  // ---- 화면 분기 ----
  if (!session) {
    return <MenuScreen busy={busy} error={error} onCreate={handleCreate} onJoin={handleJoin} />
  }
  if (!state) {
    return <Centered>연결 중...</Centered>
  }
  if (state.status === 'waiting') {
    return <LobbyScreen roomId={session.roomId} onCancel={handleExit} />
  }
  if (state.status === 'finished') {
    return (
      <GameOverScreen
        state={state}
        myId={session.myId}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    )
  }
  return (
    <GameScreen
      state={state}
      myId={session.myId}
      onSelect={handleSelect}
      onExit={handleExit}
    />
  )
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center text-slate-400">{children}</div>
  )
}
