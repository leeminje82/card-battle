interface Props {
  logs: string[]
  p1Name: string
  p2Name: string
}

// 로그의 'p1'/'p2' 접두어를 실제 이름으로 치환
export function BattleLog({ logs, p1Name, p2Name }: Props) {
  return (
    <ul className="space-y-1 text-sm">
      {logs.map((line, i) => (
        <li key={i} className="text-slate-200">
          {line.replace(/^p1/, p1Name || '아빠').replace(/^p2/, p2Name || '아들')}
        </li>
      ))}
    </ul>
  )
}
