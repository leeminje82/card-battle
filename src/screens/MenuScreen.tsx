import { useState } from 'react'
import { CARD_TEMPLATES } from '../data/cards'

interface Props {
  busy: boolean
  error: string | null
  onCreate: (name: string) => void
  onJoin: (name: string, code: string) => void
}

export function MenuScreen({ busy, error, onCreate, onJoin }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const canStart = name.trim().length > 0 && !busy

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🃏 카드 배틀</h1>
        <p className="text-slate-400 mt-1">아빠 vs 아들 1:1 실시간 카드게임</p>
      </div>

      <input
        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-center text-lg focus:border-amber-400 outline-none"
        placeholder="닉네임 입력"
        maxLength={12}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-900 font-bold py-3 text-lg transition"
        disabled={!canStart}
        onClick={() => onCreate(name.trim())}
      >
        방 만들기 (방장)
      </button>

      <div className="w-full flex gap-2">
        <input
          className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-center text-lg uppercase tracking-widest focus:border-amber-400 outline-none"
          placeholder="방 코드"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-bold px-5 transition"
          disabled={!canStart || code.trim().length < 4}
          onClick={() => onJoin(name.trim(), code.trim())}
        >
          참가
        </button>
      </div>

      {/* 버튼이 왜 비활성인지 안내 */}
      {name.trim().length === 0 ? (
        <p className="text-amber-400/90 text-sm -mt-3">👆 먼저 닉네임을 입력해주세요</p>
      ) : code.trim().length > 0 && code.trim().length < 4 ? (
        <p className="text-amber-400/90 text-sm -mt-3">방 코드는 4자리예요</p>
      ) : null}

      {error && <p className="text-rose-400 text-sm">{error}</p>}

      <details className="w-full text-sm text-slate-400">
        <summary className="cursor-pointer text-slate-300">게임 방법 / 카드 보기</summary>
        <p className="mt-2">
          매 라운드 카드 1장을 동시에 내고, 공격력 − 상대 방어력만큼 피해를 줍니다. 먼저 HP를 0으로
          만들면 승리!
        </p>
        <ul className="mt-2 space-y-2">
          {CARD_TEMPLATES.map((c) => (
            <li key={c.type}>
              <span>
                {c.emoji} <b className="text-slate-200">{c.name}</b>{' '}
                {c.attack > 0 && <span className="text-rose-400">⚔{c.attack}</span>}{' '}
                {c.defense > 0 && <span className="text-sky-400">🛡{c.defense}</span>}
              </span>
              <br />
              <span className="text-slate-500">{c.desc}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
