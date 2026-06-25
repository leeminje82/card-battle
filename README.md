# 🃏 카드 배틀 (Card Battle)

아빠 vs 아들 1:1 실시간 전략 카드게임 (하스스톤 풍). React + Vite + TypeScript + Tailwind + Firebase Realtime Database 기반 PWA.

## 빠른 시작

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm test         # 게임 로직 단위 테스트 (Firebase 불필요)
npm run build    # 타입체크 + 프로덕션 빌드
```

> `.env` 없이도 메뉴 화면은 뜹니다. "방 만들기/참가"를 누르면 Firebase 설정 안내가 나옵니다.

## Firebase 설정 (멀티플레이에 필수)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. **Realtime Database** 활성화
3. **Authentication > 로그인 방법 > 익명**을 켜기
4. `database.rules.json` 내용을 데이터베이스 규칙으로 배포
5. `.env.example`을 복사해 `.env`로 만들고 콘솔의 앱 설정값 채우기

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

## 게임 규칙

- 시작 HP 25, 손패 5장. 매 라운드 카드 1장을 동시에 제출.
- 피해 = `max(0, 상대 공격력 − 내 방어력)`. 먼저 HP 0이 되면 패배(동시 사망은 무승부).
- 특수효과: 관통(방어 무시) / 회복(+8) / 반동(자해 3) / 봉인(다음 턴 상대 공격 0) / 반사(막은 피해 절반 반격).
- 전투 계산 순서는 [`src/utils/battle.ts`](src/utils/battle.ts) `resolveBattle` 한 곳에 결정적으로 모음.

## 구조

```
src/
  types/index.ts        타입 정의
  data/cards.ts         카드 8종
  utils/deck.ts         덱 생성/셔플/드로우(재셔플 포함)
  utils/battle.ts       전투 계산 순수 함수 (+ *.test.ts)
  firebase/config.ts    지연 초기화 + 익명 인증
  firebase/game.ts      방 생성/참가, 구독, transaction 전투 트리거
  components/           HPBar, CardComponent, BattleLog
  screens/              Menu, Lobby, Game, GameOver
  App.tsx               화면 전환 + 호스트 전용 진행 로직
```

전투 중복 처리는 **호스트(p1)만 계산** + `resolvedRound` 락 + `runTransaction`으로 방지합니다.

## 배포 (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Vercel 프로젝트 환경변수에 위 `VITE_FIREBASE_*` 값을 등록하세요.
