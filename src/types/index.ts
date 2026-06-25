// 카드 특수효과 종류
export type Effect =
  | 'basic' // 특수효과 없음
  | 'pierce' // 관통: 상대 방어력 무시
  | 'heal' // 회복: 자신 HP +8
  | 'recoil' // 반동: 공격 성공 시 자신도 피해
  | 'seal' // 봉인: 다음 라운드 상대 공격력 0
  | 'reflect' // 반사: 막은 피해의 절반을 상대에게

// 카드 프레임 시각 카테고리 (색상/글로우 결정)
export type CardCategory = 'attack' | 'defense' | 'special' | 'balanced'

export interface Card {
  id: string // 카드 식별자 (덱/손패에서 unique, 예: "fireball#2")
  type: string // 카드 종류 (예: "fireball")
  name: string
  emoji: string
  attack: number
  defense: number
  effect: Effect
  category: CardCategory // 프레임 디자인 색상 그룹
  desc: string // UI에 표시할 효과 설명(플레이버 텍스트)
}

export interface Debuff {
  attackSealed: boolean // 이번 라운드 공격이 봉인됨
}

export interface Player {
  name: string
  hp: number
  hand: Card[]
  selected: Card | null // 이번 라운드 선택한 카드
  ready: boolean
  debuff: Debuff
  online?: boolean // 접속 상태 (onDisconnect 로 갱신)
}

export type Winner = 'p1' | 'p2' | 'draw' | null
export type PlayerId = 'p1' | 'p2'
export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface BattleResult {
  logs: string[]
  p1card: Card
  p2card: Card
  p1Hp: number
  p2Hp: number
}

export interface GameState {
  status: GameStatus
  round: number
  winner: Winner
  host: PlayerId
  resolvedRound: number // 마지막으로 처리 완료된 라운드 (중복 처리 방지 락)
  p1: Player
  p2: Player
  deck: Card[]
  discard: Card[]
  lastResult: BattleResult | null
}

// resolveBattle 의 출력 (순수 계산 결과)
export interface ResolveOutput {
  p1Hp: number
  p2Hp: number
  p1NextDebuff: Debuff
  p2NextDebuff: Debuff
  logs: string[]
  winner: Winner
}
