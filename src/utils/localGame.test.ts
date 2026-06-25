import { describe, it, expect } from 'vitest'
import { createLocalGame, playLocalRound, advanceLocalRound } from './localGame'
import { aiChooseCard } from './ai'

describe('localGame', () => {
  it('새 게임은 양쪽 5장, 25 HP, deck 22장', () => {
    const g = createLocalGame('아빠')
    expect(g.p1.hand).toHaveLength(5)
    expect(g.p2.hand).toHaveLength(5)
    expect(g.p1.hp).toBe(25)
    expect(g.p2.hp).toBe(25)
    expect(g.deck).toHaveLength(22)
    expect(g.status).toBe('playing')
  })

  it('한 라운드: AI도 카드를 내고 결과가 공개된다', () => {
    const g = createLocalGame('아빠')
    const after = playLocalRound(g, g.p1.hand[0])
    expect(after.p1.ready).toBe(true)
    expect(after.p2.ready).toBe(true)
    expect(after.p2.selected).not.toBeNull()
    expect(after.resolvedRound).toBe(1)
    expect(after.lastResult).not.toBeNull()
  })

  it('전체 게임이 크래시 없이 승부로 끝난다', () => {
    let g = createLocalGame('아빠')
    let rounds = 0
    while (g.status === 'playing' && rounds < 500) {
      g = playLocalRound(g, g.p1.hand[0])
      if (g.status === 'finished') break
      g = advanceLocalRound(g)
      // 항상 손패 5장 유지, HP 숫자 유효
      expect(g.p1.hand.length).toBe(5)
      expect(g.p2.hand.length).toBe(5)
      expect(Number.isFinite(g.p1.hp)).toBe(true)
      rounds++
    }
    expect(g.status).toBe('finished')
    expect(['p1', 'p2', 'draw']).toContain(g.winner)
  })

  it('aiChooseCard는 손패 안의 카드를 반환', () => {
    const g = createLocalGame('아빠')
    const pick = aiChooseCard(g.p2.hand, g.p2, g.p1)
    expect(g.p2.hand.map((c) => c.id)).toContain(pick.id)
  })
})
