import type { GameState, PlayerId } from '../types'

interface Props {
  state: GameState
  myId: PlayerId
  onRestart: () => void
  onExit: () => void
}

export function GameOverScreen({ state, myId, onRestart, onExit }: Props) {
  const result =
    state.winner === 'draw' ? 'draw' : state.winner === myId ? 'win' : 'lose'
  const title =
    result === 'win' ? '🎉 승리!' : result === 'lose' ? '😢 패배...' : '🤝 무승부'
  const color =
    result === 'win' ? 'text-amber-400' : result === 'lose' ? 'text-rose-400' : 'text-slate-300'

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 text-center">
      <h1 className={`text-5xl font-black ${color}`}>{title}</h1>
      <div className="text-lg space-y-1">
        <p>
          {state.p1.name || '아빠'}: <b>{Math.max(0, state.p1.hp)}</b> HP
        </p>
        <p>
          {state.p2.name || '아들'}: <b>{Math.max(0, state.p2.hp)}</b> HP
        </p>
        <p className="text-slate-400 text-sm">총 {state.round} 라운드</p>
      </div>
      <button
        className="w-full max-w-xs rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 transition"
        onClick={onRestart}
      >
        다시 하기
      </button>
      <button className="text-sm text-slate-400" onClick={onExit}>
        메뉴로 나가기
      </button>
    </div>
  )
}
