import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
} from 'firebase/auth'

// .env 의 VITE_FIREBASE_* 값으로 초기화 (값은 .env.example 참고)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isConfigured(): boolean {
  return Boolean(firebaseConfig.databaseURL && firebaseConfig.apiKey)
}

// 지연 초기화 — .env 가 없어도 import 단계에서 크래시하지 않게 한다.
// (메뉴 화면은 항상 뜨고, 방 생성/참가 시점에만 친절한 에러를 던진다.)
let app: FirebaseApp | null = null
let dbInstance: Database | null = null
let authInstance: Auth | null = null

function init() {
  if (app) return
  if (!isConfigured()) {
    throw new Error('Firebase 가 설정되지 않았습니다. .env 파일을 만들어 주세요.')
  }
  app = initializeApp(firebaseConfig)
  dbInstance = getDatabase(app)
  authInstance = getAuth(app)
}

export function getDb(): Database {
  init()
  return dbInstance!
}

// 익명 로그인 보장 — 보안 규칙에서 auth != null 을 요구할 수 있으므로
// 방 생성/참가 전에 await 한다.
let authReady: Promise<string> | null = null
export function ensureAuth(): Promise<string> {
  if (authReady) return authReady
  init()
  const auth = authInstance!
  authReady = new Promise<string>((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user.uid)
    })
    signInAnonymously(auth).catch(reject)
  })
  return authReady
}
