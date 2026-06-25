import type { Card, CardCategory, Effect } from '../types'

// 카테고리별 프레임 색상 (사용자 디자인)
const FRAME: Record<
  CardCategory,
  { main: string; glow: string; bg: string; art: string; gem: string; gemGlow: string }
> = {
  attack: {
    main: '#C41E3A',
    glow: 'rgba(196,30,58,0.7)',
    bg: 'linear-gradient(160deg,#2d0808,#1a0303)',
    art: 'linear-gradient(160deg,#4a0000,#8b0000)',
    gem: '#ff4444',
    gemGlow: 'rgba(255,68,68,0.8)',
  },
  defense: {
    main: '#1E5BC4',
    glow: 'rgba(30,91,196,0.7)',
    bg: 'linear-gradient(160deg,#080d2d,#03051a)',
    art: 'linear-gradient(160deg,#00004a,#00008b)',
    gem: '#4488ff',
    gemGlow: 'rgba(68,136,255,0.8)',
  },
  special: {
    main: '#8B1EC4',
    glow: 'rgba(139,30,196,0.7)',
    bg: 'linear-gradient(160deg,#160828,#0b0319)',
    art: 'linear-gradient(160deg,#2d0050,#6600aa)',
    gem: '#bb55ff',
    gemGlow: 'rgba(187,85,255,0.8)',
  },
  balanced: {
    main: '#1E8B4A',
    glow: 'rgba(30,139,74,0.7)',
    bg: 'linear-gradient(160deg,#081a0d,#031a08)',
    art: 'linear-gradient(160deg,#003318,#006633)',
    gem: '#44cc77',
    gemGlow: 'rgba(68,204,119,0.8)',
  },
}

// 특수효과 짧은 라벨
const EFFECT_LABEL: Record<Effect, string | null> = {
  basic: null,
  pierce: '관통',
  heal: '회복',
  recoil: '반동',
  seal: '봉인',
  reflect: '반사',
}

interface Props {
  card: Card
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function CardComponent({ card, selected, disabled, onClick, size = 'md' }: Props) {
  const f = FRAME[card.category]
  const sm = size === 'sm'
  const W = sm ? 100 : 158
  const H = sm ? 140 : 222
  const label = EFFECT_LABEL[card.effect]

  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: W,
        height: H,
        borderRadius: sm ? 8 : 12,
        background: f.bg,
        border: `${sm ? 2 : 3}px solid ${selected ? '#FFD700' : f.main}`,
        boxShadow: selected
          ? `0 0 30px #FFD700, 0 0 60px rgba(255,215,0,0.25), inset 0 0 20px rgba(0,0,0,0.6)`
          : `0 0 14px ${f.glow}, 0 6px 20px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)`,
        cursor: disabled ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        transform: selected ? 'scale(1.06) translateY(-8px)' : 'scale(1)',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        opacity: disabled && !selected ? 0.55 : 1,
      }}
    >
      {/* 안쪽 금색 테두리 */}
      <div
        style={{
          position: 'absolute',
          inset: sm ? 2 : 3,
          borderRadius: sm ? 6 : 9,
          border: `1px solid ${selected ? 'rgba(255,215,0,0.7)' : 'rgba(255,215,0,0.2)'}`,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* 아트 영역 */}
      <div
        style={{
          height: '50%',
          background: f.art,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sm ? 32 : 50,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.08) 0%, transparent 65%)',
          }}
        />
        {card.emoji}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '35%',
            background: 'linear-gradient(transparent, #0a0a0a)',
          }}
        />
      </div>

      {/* 이름 리본 */}
      <div
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.1), rgba(0,0,0,0.85), rgba(0,0,0,0.1))',
          borderTop: `1px solid ${f.main}99`,
          borderBottom: `1px solid ${f.main}99`,
          padding: sm ? '2px 6px' : '4px 8px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <span
          style={{
            color: '#FFD700',
            fontWeight: 'bold',
            fontSize: sm ? 10 : 12,
            letterSpacing: sm ? 0.2 : 0.6,
            textShadow: '0 0 10px rgba(255,215,0,0.9)',
            fontFamily: 'Georgia, serif',
            position: 'relative',
            whiteSpace: 'nowrap',
          }}
        >
          {card.name}
        </span>
      </div>

      {/* 설명 텍스트 (큰 카드에서만) */}
      {!sm && (
        <div
          style={{
            flex: 1,
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            position: 'relative',
          }}
        >
          {label && (
            <div
              style={{
                position: 'absolute',
                top: 3,
                right: 4,
                background: f.main,
                color: 'white',
                fontSize: 8,
                padding: '1px 5px',
                borderRadius: 3,
                fontWeight: 'bold',
                boxShadow: `0 0 8px ${f.gem}`,
              }}
            >
              {label}
            </div>
          )}
          <p
            style={{
              color: '#e8d5a3',
              fontSize: 9.5,
              textAlign: 'center',
              lineHeight: 1.5,
              margin: 0,
              fontFamily: 'Georgia, serif',
            }}
          >
            {card.desc}
          </p>
        </div>
      )}

      {/* 작은 카드: 특수 라벨만 코너에 */}
      {sm && label && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 3,
            transform: 'translateY(2px)',
            background: f.main,
            color: 'white',
            fontSize: 7,
            padding: '1px 4px',
            borderRadius: 3,
            fontWeight: 'bold',
            zIndex: 11,
            boxShadow: `0 0 8px ${f.gem}`,
          }}
        >
          {label}
        </div>
      )}

      {/* 스탯 바닥 */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: sm ? '2px 5px' : '4px 7px',
          background: 'rgba(0,0,0,0.65)',
          borderTop: `1px solid ${f.main}44`,
        }}
      >
        <StatGem value={card.attack} color="#ff4444" glow="rgba(255,68,68,0.7)" inactive={card.attack === 0} small={sm} />
        <div
          style={{
            width: sm ? 5 : 7,
            height: sm ? 5 : 7,
            borderRadius: '50%',
            background: f.gem,
            boxShadow: `0 0 8px ${f.gemGlow}`,
          }}
        />
        <StatGem value={card.defense} color="#4488ff" glow="rgba(68,136,255,0.7)" inactive={card.defense === 0} small={sm} />
      </div>
    </div>
  )
}

function StatGem({
  value,
  color,
  glow,
  inactive,
  small,
}: {
  value: number
  color: string
  glow: string
  inactive: boolean
  small: boolean
}) {
  const size = small ? 18 : 28
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: inactive
          ? 'rgba(20,20,20,0.6)'
          : `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
        border: `${small ? 1 : 2}px solid ${inactive ? '#2a2a2a' : color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: inactive ? '#333' : 'white',
        fontWeight: 'bold',
        fontSize: small ? 9 : 13,
        boxShadow: inactive ? 'none' : `0 0 10px ${glow}, inset 0 1px 2px rgba(255,255,255,0.2)`,
        fontFamily: 'Georgia, serif',
        textShadow: inactive ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
      }}
    >
      {inactive ? '—' : value}
    </div>
  )
}

// 상대 손패 (뒷면) — 사용자 디자인 톤에 맞춤
export function CardBack({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sm = size === 'sm'
  return (
    <div
      style={{
        width: sm ? 44 : 66,
        height: sm ? 62 : 92,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #1e3a5f, #1a2a4a)',
        border: '2px solid #2d4a7a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: sm ? 18 : 22,
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
      }}
    >
      🃏
    </div>
  )
}
