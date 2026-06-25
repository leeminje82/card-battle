import type { Card, CardCategory, Effect } from '../types'

// 카드 한 종류의 정의 (id 는 덱 생성 시 부여)
export interface CardTemplate {
  type: string
  name: string
  emoji: string
  attack: number
  defense: number
  effect: Effect
  category: CardCategory
  desc: string
}

// 카드 8종 (각 4장씩 = 총 32장 덱)
export const CARD_TEMPLATES: CardTemplate[] = [
  {
    type: 'fireball',
    name: '파이어볼',
    emoji: '🔥',
    attack: 7,
    defense: 0,
    effect: 'basic',
    category: 'attack',
    desc: '강력한 화염을 발사해 적에게 피해를 입힌다.',
  },
  {
    type: 'wall',
    name: '철벽 방어',
    emoji: '🛡️',
    attack: 0,
    defense: 9,
    effect: 'basic',
    category: 'defense',
    desc: '강력한 방어막을 생성해 모든 공격을 막아낸다.',
  },
  {
    type: 'lightning',
    name: '번개 강타',
    emoji: '⚡',
    attack: 5,
    defense: 0,
    effect: 'pierce',
    category: 'attack',
    desc: '하늘의 번개가 내리쳐 방어를 완전히 무시한다.',
  },
  {
    type: 'heal',
    name: '회복의 빛',
    emoji: '💚',
    attack: 0,
    defense: 0,
    effect: 'heal',
    category: 'special',
    desc: '신성한 빛이 상처를 치유해 HP를 8 회복한다.',
  },
  {
    type: 'greatsword',
    name: '대검 강습',
    emoji: '⚔️',
    attack: 11,
    defense: 0,
    effect: 'recoil',
    category: 'attack',
    desc: '강력한 일격! 하지만 반동으로 자신도 3의 피해를 받는다.',
  },
  {
    type: 'nature',
    name: '자연의 힘',
    emoji: '🍃',
    attack: 4,
    defense: 5,
    effect: 'basic',
    category: 'balanced',
    desc: '대지의 기운으로 공격과 방어를 동시에 수행한다.',
  },
  {
    type: 'ice',
    name: '얼음 화살',
    emoji: '❄️',
    attack: 4,
    defense: 0,
    effect: 'seal',
    category: 'special',
    desc: '차가운 얼음이 상대를 얼려 다음 공격을 봉인한다.',
  },
  {
    type: 'mirror',
    name: '반사 방패',
    emoji: '🔮',
    attack: 0,
    defense: 4,
    effect: 'reflect',
    category: 'defense',
    desc: '마법 방패가 받은 공격의 절반을 상대에게 반사시킨다.',
  },
]

export const COPIES_PER_CARD = 4 // 종류당 장수
export const START_HAND = 5 // 시작 손패
export const START_HP = 25 // 시작 HP

// 카드 종류 -> 템플릿 빠른 조회
export const TEMPLATE_BY_TYPE: Record<string, CardTemplate> = Object.fromEntries(
  CARD_TEMPLATES.map((t) => [t.type, t]),
)

// 템플릿으로부터 실제 카드 인스턴스 생성
export function makeCard(template: CardTemplate, copyIndex: number): Card {
  return {
    id: `${template.type}#${copyIndex}`,
    type: template.type,
    name: template.name,
    emoji: template.emoji,
    attack: template.attack,
    defense: template.defense,
    effect: template.effect,
    category: template.category,
    desc: template.desc,
  }
}
