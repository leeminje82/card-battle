import { describe, it, expect } from 'vitest'
import { resolveBattle, type Combatant } from './battle'
import { TEMPLATE_BY_TYPE, makeCard, START_HP } from '../data/cards'
import type { Debuff } from '../types'

const noDebuff = (): Debuff => ({ attackSealed: false })
const sealed = (): Debuff => ({ attackSealed: true })

// 카드 종류로 Combatant 생성
function c(type: string, hp = START_HP, debuff: Debuff = noDebuff()): Combatant {
  return { card: makeCard(TEMPLATE_BY_TYPE[type], 0), hp, debuff }
}

describe('resolveBattle', () => {
  it('파이어볼(7) vs 철벽(9): 막혀서 피해 없음', () => {
    const r = resolveBattle(c('fireball'), c('wall'))
    expect(r.p1Hp).toBe(START_HP)
    expect(r.p2Hp).toBe(START_HP) // 7 - 9 < 0 → 0 피해
  })

  it('파이어볼(7) vs 자연(방5): 2 피해', () => {
    const r = resolveBattle(c('fireball'), c('nature'))
    expect(r.p2Hp).toBe(START_HP - 2)
    // 자연도 공격력 4 → p1 방어 0 → p1 4 피해
    expect(r.p1Hp).toBe(START_HP - 4)
  })

  it('관통(번개5) vs 철벽(9): 방어 무시하고 5 피해', () => {
    const r = resolveBattle(c('lightning'), c('wall'))
    expect(r.p2Hp).toBe(START_HP - 5)
  })

  it('회복의 빛: HP +8 (상한 없음, 단순 합산)', () => {
    const r = resolveBattle(c('heal', 10), c('wall'))
    expect(r.p1Hp).toBe(18)
  })

  it('대검(11) 반동: 피해 입히면 자신도 3 피해', () => {
    const r = resolveBattle(c('greatsword'), c('fireball'))
    // p2는 방어 0 → 11 피해, p1은 fireball 7 피해 + 반동은 없음(p1만 대검)
    expect(r.p2Hp).toBe(START_HP - 11)
    expect(r.p1Hp).toBe(START_HP - 7 - 3) // fireball 7 + 반동 3
  })

  it('대검 반동: 공격이 막히면(피해 0) 반동 없음', () => {
    // 대검 11 vs 철벽 9 → 2 피해(>=1)라 반동 발생. 막히는 경우를 위해 봉인 사용.
    const r = resolveBattle(c('greatsword', START_HP, sealed()), c('wall'))
    // 봉인으로 대검 공격 0 → 피해 0 → 반동 없음
    expect(r.p1Hp).toBe(START_HP)
    expect(r.p2Hp).toBe(START_HP)
  })

  it('얼음화살: 상대 다음 라운드 공격 봉인', () => {
    const r = resolveBattle(c('ice'), c('fireball'))
    expect(r.p2NextDebuff.attackSealed).toBe(true)
    expect(r.p1NextDebuff.attackSealed).toBe(false)
  })

  it('봉인 소비: 이미 봉인된 플레이어는 공격 0, 다음엔 풀림', () => {
    const r = resolveBattle(c('fireball', START_HP, sealed()), c('wall'))
    expect(r.p2Hp).toBe(START_HP) // 봉인되어 공격 0
    expect(r.p1NextDebuff.attackSealed).toBe(false) // 봉인 소비됨
  })

  it('반사방패(방4) vs 파이어볼(7): 막은 4의 절반(2) 반사', () => {
    const r = resolveBattle(c('mirror'), c('fireball'))
    // p1 막은 피해 = min(7,4)=4 → 반사 2 → p2 2 피해
    expect(r.p2Hp).toBe(START_HP - 2)
    // p1은 7-4=3 피해
    expect(r.p1Hp).toBe(START_HP - 3)
  })

  it('반사 vs 관통: 관통이면 막은 게 없어 반사도 0', () => {
    const r = resolveBattle(c('mirror'), c('lightning'))
    // 관통 → p1 방어 0 → 5 피해, 막은 것 0 → 반사 0
    expect(r.p1Hp).toBe(START_HP - 5)
    expect(r.p2Hp).toBe(START_HP)
  })

  it('동시 사망 → 무승부', () => {
    const r = resolveBattle(c('fireball', 5), c('greatsword', 5))
    // p1 fireball 7 → p2 -2 사망, p2 greatsword 11 → p1 사망
    expect(r.winner).toBe('draw')
  })

  it('한쪽만 사망 → 상대 승', () => {
    // 둘 다 파이어볼(7). p1은 hp3 → 사망, p2는 hp25 → 생존
    const r = resolveBattle(c('fireball', 3), c('fireball', 25))
    expect(r.p1Hp).toBeLessThanOrEqual(0)
    expect(r.winner).toBe('p2')
  })

  it('승부 안 남 → winner null', () => {
    const r = resolveBattle(c('nature'), c('nature'))
    expect(r.winner).toBe(null)
  })
})
