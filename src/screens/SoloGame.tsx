import { useCallback, useEffect, useState } from 'react'
import type { Card, GameState } from '../types'
import { createLocalGame, playLocalRound, advanceLocalRound } from '../utils/localGame'
import { GameScreen } from './GameScreen'
import { GameOverScreen } from './GameOverScreen'

const REVEAL_MS = 3500

interface Props {
  playerName: string
  onExit: () => void
}

export function SoloGame({ playerName, onExit }: Props) {
  const [state, setState] = useState<GameState>(() => createLocalGame(playerName))

  const handleSelect = useCallback((card: Card) => {
    setState((prev) => {
      // 이미 이번 라운드를 처리했으면 무시
      if (prev.p1.ready || prev.resolvedRound === prev.round) return prev
      return playLocalRound(prev, card)
    })
  }, [])

  // 결과 공개 후 자동으로 다음 라운드로
  useEffect(() => {
    if (state.status === 'playing' && state.resolvedRound === state.round && state.lastResult) {
      const t = setTimeout(() => setState((prev) => advanceLocalRound(prev)), REVEAL_MS)
      return () => clearTimeout(t)
    }
  }, [state])

  const handleRestart = useCallback(() => {
    setState(createLocalGame(playerName))
  }, [playerName])

  if (state.status === 'finished') {
    return (
      <GameOverScreen state={state} myId="p1" onRestart={handleRestart} onExit={onExit} />
    )
  }
  return <GameScreen state={state} myId="p1" onSelect={handleSelect} onExit={onExit} />
}
