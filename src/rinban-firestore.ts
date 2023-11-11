// Initialize Firestore through Firebase
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCeK9n-NulffW-YVjzgz8OESEQ3soSJ73E',
  authDomain: 'rinban.firebaseapp.com',
  projectId: 'rinban',
  storageBucket: 'rinban.appspot.com',
  messagingSenderId: '171451589704',
  appId: '1:171451589704:web:96e7160cda914dc614a47d',
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore();
