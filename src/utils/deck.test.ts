import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, draw } from './deck'

describe('deck', () => {
  it('32장 덱 생성 (8종 × 4장)', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(32)
    const types = new Set(deck.map((c) => c.type))
    expect(types.size).toBe(8)
  })

  it('카드 id는 모두 고유', () => {
    const ids = createDeck().map((c) => c.id)
    expect(new Set(ids).size).toBe(32)
  })

  it('셔플은 원본을 바꾸지 않고 같은 원소를 유지', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck, () => 0.5)
    expect(shuffled).toHaveLength(32)
    expect(deck).toHaveLength(32)
    expect(new Set(shuffled.map((c) => c.id))).toEqual(new Set(deck.map((c) => c.id)))
  })

  it('draw: 덱에서 한 장 뽑으면 덱이 1 줄어듦', () => {
    const deck = createDeck()
    const r = draw(deck, [])
    expect(r.card).not.toBeNull()
    expect(r.deck).toHaveLength(31)
  })

  it('draw: 덱이 비면 버린 더미를 셔플해 재활용', () => {
    const discard = createDeck()
    const r = draw([], discard, () => 0)
    expect(r.card).not.toBeNull()
    expect(r.deck).toHaveLength(31)
    expect(r.discard).toHaveLength(0)
  })

  it('draw: 덱과 버린 더미가 모두 비면 null', () => {
    const r = draw([], [])
    expect(r.card).toBeNull()
  })
})
