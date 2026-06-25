interface Props {
  roomId: string
  onCancel: () => void
}

export function LobbyScreen({ roomId, onCancel }: Props) {
  const shareUrl = `${location.origin}${location.pathname}?room=${roomId}`
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 text-center">
      <h2 className="text-xl text-slate-300">상대방을 기다리는 중...</h2>
      <div>
        <p className="text-slate-400 text-sm mb-2">방 코드</p>
        <div className="text-6xl font-black tracking-[0.3em] text-amber-400">{roomId}</div>
      </div>
      <div className="animate-pulse text-slate-500">● ● ●</div>
      <button
        className="text-sm text-slate-300 underline"
        onClick={() => navigator.clipboard?.writeText(shareUrl)}
      >
        초대 링크 복사
      </button>
      <button className="text-sm text-rose-400 mt-4" onClick={onCancel}>
        나가기
      </button>
    </div>
  )
}
