import type { Card, Player } from '../types'

// AI가 손패에서 카드 한 장을 고른다 (휴리스틱 + 약간의 무작위성).
// self: AI 자신, opponent: 사람 플레이어.
export function aiChooseCard(hand: Card[], self: Player, opponent: Player): Card {
  let best = hand[0]
  let bestScore = -Infinity
  for (const card of hand) {
    const score = scoreCard(card, self, opponent) + Math.random() * 2
    if (score > bestScore) {
      bestScore = score
      best = card
    }
  }
  return best
}

function scoreCard(card: Card, self: Player, opp: Player): number {
  const sealed = self.debuff?.attackSealed === true
  let s = 0

  // 공격 가치 (봉인 상태면 공격은 무의미)
  if (card.attack > 0 && !sealed) {
    let dmg = card.attack
    if (card.effect === 'pierce') dmg += 2 // 관통: 방어 무시 보너스
    s += dmg
    if (opp.hp <= card.attack) s += 6 // 마무리 일격
    if (card.effect === 'recoil') {
      s += 2 // 높은 공격 보너스
      if (self.hp <= 5) s -= 8 // 내 HP 낮으면 반동 위험
    }
  }

  // 방어 가치
  if (card.defense > 0) {
    s += card.defense * 0.7
    if (card.effect === 'reflect') s += 2
  }

  // 회복: HP 낮을수록 가치 급상승
  if (card.effect === 'heal') {
    if (self.hp <= 10) s += 10
    else if (self.hp <= 17) s += 4
    else s += 0.5
  }

  // 봉인: 상대 다음 공격을 막음
  if (card.effect === 'seal' && !sealed) s += 3

  return s
}
