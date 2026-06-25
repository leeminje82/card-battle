import type { Card } from '../types'
import { CARD_TEMPLATES, COPIES_PER_CARD, makeCard } from '../data/cards'

// 32장 덱 생성 (8종 × 4장)
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const template of CARD_TEMPLATES) {
    for (let i = 0; i < COPIES_PER_CARD; i++) {
      deck.push(makeCard(template, i))
    }
  }
  return deck
}

// Fisher–Yates 셔플 (새 배열 반환, 원본 불변)
// rng 주입 가능 → 테스트에서 결정적 셔플 가능
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface DrawResult {
  card: Card | null // 뽑은 카드 (덱+버린더미 모두 비면 null)
  deck: Card[]
  discard: Card[]
}

// 덱에서 카드 1장 드로우. 덱이 비면 버린 더미를 셔플해 재활용.
export function draw(
  deck: Card[],
  discard: Card[],
  rng: () => number = Math.random,
): DrawResult {
  let nextDeck = [...deck]
  let nextDiscard = [...discard]

  if (nextDeck.length === 0) {
    if (nextDiscard.length === 0) {
      // 뽑을 카드가 전혀 없음
      return { card: null, deck: nextDeck, discard: nextDiscard }
    }
    // 버린 더미를 셔플해 덱으로 재활용
    nextDeck = shuffle(nextDiscard, rng)
    nextDiscard = []
  }

  const card = nextDeck.shift() ?? null
  return { card, deck: nextDeck, discard: nextDiscard }
}
