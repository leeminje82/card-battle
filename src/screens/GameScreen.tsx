import { useEffect, useState } from 'react'
import type { Card, GameState, PlayerId } from '../types'
import { HPBar } from '../components/HPBar'
import { CardComponent, CardBack } from '../components/CardComponent'
import { BattleLog } from '../components/BattleLog'

interface Props {
  state: GameState
  myId: PlayerId
  onSelect: (card: Card) => void
  onExit: () => void
}

export function GameScreen({ state, myId, onSelect, onExit }: Props) {
  const oppId: PlayerId = myId === 'p1' ? 'p2' : 'p1'
  const me = state[myId]
  const opp = state[oppId]
  const [picked, setPicked] = useState<Card | null>(null)

  const revealing = state.resolvedRound === state.round && !!state.lastResult
  const myReady = me.ready
  const oppHand = opp.hand ?? []
  const oppOffline = opp.online === false // 명시적으로 끊긴 경우만

  // 새 라운드 시작되면 로컬 선택 초기화
  useEffect(() => {
    if (!myReady) setPicked(null)
  }, [state.round, myReady])

  return (
    <div className="min-h-full flex flex-col max-w-md mx-auto p-3 gap-2">
      {/* 상단 바: 나가기 */}
      <div className="flex justify-end">
        <button
          className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1"
          onClick={() => {
            if (confirm('게임에서 나가시겠어요?')) onExit()
          }}
        >
          나가기 ✕
        </button>
      </div>

      {/* 상대 연결 끊김 배너 */}
      {oppOffline && (
        <div className="rounded-lg bg-rose-900/60 border border-rose-700 text-rose-200 text-sm text-center py-2 px-3">
          ⚠️ 상대방 연결이 끊겼습니다. 다시 들어오길 기다리거나 나가기를 눌러주세요.
        </div>
      )}

      {/* 상대 영역 */}
      <div className="rounded-xl bg-slate-800/60 p-3">
        <HPBar name={opp.name} hp={opp.hp} align="right" />
        <div className="flex gap-1 justify-center mt-2">
          {oppHand.map((_, i) => (
            <CardBack key={i} />
          ))}
        </div>
        <p className="text-center text-xs mt-1 text-slate-400">
          {oppOffline ? '🔌 연결 끊김' : opp.ready ? '✅ 선택 완료' : '카드 선택 중...'}
        </p>
      </div>

      {/* 가운데 상태 */}
      <div className="text-center py-2">
        <div className="text-amber-400 font-bold">라운드 {state.round}</div>
        <div className="text-sm text-slate-300">
          {myReady ? '상대를 기다리는 중...' : '카드를 선택하세요!'}
        </div>
      </div>

      {/* 내 영역 */}
      <div className="mt-auto rounded-xl bg-slate-800/60 p-3">
        <HPBar name={me.name + ' (나)'} hp={me.hp} />
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 px-1 snap-x">
          {(me.hand ?? []).map((card) => (
            <div key={card.id} className="snap-center">
              <CardComponent
                card={card}
                size="sm"
                selected={picked?.id === card.id}
                disabled={myReady || revealing}
                onClick={() => setPicked(card)}
              />
            </div>
          ))}
        </div>
        <button
          className="w-full mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-900 font-bold py-3 transition"
          disabled={!picked || myReady || revealing}
          onClick={() => picked && onSelect(picked)}
        >
          {myReady
            ? '대기 중...'
            : picked
              ? `${picked.emoji} ${picked.name} 사용하기!`
              : '카드를 선택하세요'}
        </button>
      </div>

      {/* 결과 공개 오버레이 */}
      {revealing && state.lastResult && (
        <RevealOverlay state={state} myId={myId} />
      )}
    </div>
  )
}

function RevealOverlay({ state, myId }: { state: GameState; myId: PlayerId }) {
  const r = state.lastResult!
  const myCard = myId === 'p1' ? r.p1card : r.p2card
  const oppCard = myId === 'p1' ? r.p2card : r.p1card
  return (
    <div className="fixed inset-0 z-20 bg-slate-950/85 flex flex-col items-center justify-center p-6 gap-5">
      <h2 className="text-xl font-bold text-amber-400">⚔️ 라운드 {state.round} 결과</h2>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <CardComponent card={myCard} />
          <p className="text-xs mt-1 text-slate-300">나</p>
        </div>
        <span className="text-2xl text-slate-500">VS</span>
        <div className="text-center">
          <CardComponent card={oppCard} />
          <p className="text-xs mt-1 text-slate-300">상대</p>
        </div>
      </div>
      <div className="rounded-lg bg-slate-800 p-4 w-full max-w-sm">
        <BattleLog logs={r.logs} p1Name={state.p1.name} p2Name={state.p2.name} />
      </div>
      <p className="text-slate-400 text-sm animate-pulse">다음 라운드 준비 중...</p>
    </div>
  )
}
