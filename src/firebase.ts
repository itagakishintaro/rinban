import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Firebase Webアプリの設定値は公開情報(アクセス制御はfirestore.rulesで行う)
const firebaseConfig = import.meta.env.DEV
  ? { projectId: 'demo-rinban', apiKey: 'demo', appId: 'demo' }
  : {
      projectId: 'rinban-app',
      apiKey: 'AIzaSyCZTrdTW1L2m0ooFRTxLPTIBEJYWVNf2gU',
      appId: '1:511997293103:web:330d3c847a6f30f804ccda',
      authDomain: 'rinban-app.firebaseapp.com',
    }

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
