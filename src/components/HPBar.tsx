import { START_HP } from '../data/cards'

interface Props {
  name: string
  hp: number
  align?: 'left' | 'right'
}

export function HPBar({ name, hp, align = 'left' }: Props) {
  const pct = Math.max(0, Math.min(100, (hp / START_HP) * 100))
  const color = hp > 15 ? 'bg-emerald-500' : hp > 7 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="flex items-center justify-between text-sm font-semibold mb-1">
        <span className="truncate max-w-[60%]">{name || '...'}</span>
        <span className="tabular-nums">{Math.max(0, hp)} / {START_HP}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
