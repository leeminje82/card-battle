import type { Card, Debuff, ResolveOutput, Winner } from '../types'

// 전투에 참가하는 한 명의 상태 (선택한 카드 + 현재 HP + 현재 디버프)
export interface Combatant {
  card: Card
  hp: number
  debuff: Debuff
}

const HEAL_AMOUNT = 8
const RECOIL_DAMAGE = 3

/**
 * 전투 1라운드를 결정적으로 계산하는 순수 함수.
 * 부수효과 없음 — Firebase 없이 단위 테스트 가능.
 * 계산 순서는 계획서 §1-B 9단계를 그대로 따른다.
 */
export function resolveBattle(p1: Combatant, p2: Combatant): ResolveOutput {
  const logs: string[] = []

  // 1) 봉인 적용 — 봉인된 플레이어는 이번 라운드 유효공격 0
  const effAtk1 = p1.debuff.attackSealed ? 0 : p1.card.attack
  const effAtk2 = p2.debuff.attackSealed ? 0 : p2.card.attack
  if (p1.debuff.attackSealed) logs.push('p1은 봉인되어 공격할 수 없다!')
  if (p2.debuff.attackSealed) logs.push('p2는 봉인되어 공격할 수 없다!')

  // 2) 유효방어 — 상대가 관통이면 내 방어는 0으로 계산
  const effDef1 = p2.card.effect === 'pierce' ? 0 : p1.card.defense
  const effDef2 = p1.card.effect === 'pierce' ? 0 : p2.card.defense

  // 3) 원피해 (양방향)
  const dmgTo2 = Math.max(0, effAtk1 - effDef2)
  const dmgTo1 = Math.max(0, effAtk2 - effDef1)

  // 4) 반사 — 내가 막은 피해의 절반을 상대에게
  const blockedBy1 = Math.min(effAtk2, effDef1)
  const blockedBy2 = Math.min(effAtk1, effDef2)
  const reflectFrom1 = p1.card.effect === 'reflect' ? Math.floor(blockedBy1 / 2) : 0
  const reflectFrom2 = p2.card.effect === 'reflect' ? Math.floor(blockedBy2 / 2) : 0

  // 5) 회복
  const heal1 = p1.card.effect === 'heal' ? HEAL_AMOUNT : 0
  const heal2 = p2.card.effect === 'heal' ? HEAL_AMOUNT : 0

  // 6) HP 합산 (양쪽 동시 적용)
  let p1Hp = p1.hp - dmgTo1 - reflectFrom2 + heal1
  let p2Hp = p2.hp - dmgTo2 - reflectFrom1 + heal2

  // 7) 반동 — 공격이 실제로 피해를 입혔으면 사용자도 피해
  if (p1.card.effect === 'recoil' && dmgTo2 >= 1) p1Hp -= RECOIL_DAMAGE
  if (p2.card.effect === 'recoil' && dmgTo1 >= 1) p2Hp -= RECOIL_DAMAGE

  // 8) 봉인 부여 — 얼음화살 사용자는 상대의 다음 라운드 공격을 봉인
  //    (현재 라운드의 봉인은 위에서 소비되었으므로 기본값 false 로 리셋)
  const p1NextDebuff: Debuff = { attackSealed: p2.card.effect === 'seal' }
  const p2NextDebuff: Debuff = { attackSealed: p1.card.effect === 'seal' }

  // 로그 구성
  buildLogs(logs, 'p1', p1, dmgTo2, reflectFrom1, heal1)
  buildLogs(logs, 'p2', p2, dmgTo1, reflectFrom2, heal2)

  // 9) 승패 판정
  const winner = decideWinner(p1Hp, p2Hp)

  return { p1Hp, p2Hp, p1NextDebuff, p2NextDebuff, logs, winner }
}

function buildLogs(
  logs: string[],
  who: string,
  c: Combatant,
  dmgDealt: number,
  reflected: number,
  healed: number,
): void {
  const card = c.card
  if (card.effect === 'heal') {
    logs.push(`${who}: ${card.emoji} ${card.name} → HP ${healed} 회복`)
    return
  }
  if (dmgDealt > 0) {
    const pierce = card.effect === 'pierce' ? ' (관통)' : ''
    logs.push(`${who}: ${card.emoji} ${card.name} → 상대에게 ${dmgDealt} 피해${pierce}`)
  } else if (card.attack > 0) {
    logs.push(`${who}: ${card.emoji} ${card.name} → 막혔다! 피해 없음`)
  } else {
    logs.push(`${who}: ${card.emoji} ${card.name} → 방어 태세`)
  }
  if (reflected > 0) logs.push(`${who}: 🔮 반사로 상대에게 ${reflected} 피해`)
  if (card.effect === 'seal') logs.push(`${who}: ❄️ 상대를 봉인! (다음 라운드 공격 0)`)
}

function decideWinner(p1Hp: number, p2Hp: number): Winner {
  const p1Dead = p1Hp <= 0
  const p2Dead = p2Hp <= 0
  if (p1Dead && p2Dead) return 'draw'
  if (p1Dead) return 'p2'
  if (p2Dead) return 'p1'
  return null
}
