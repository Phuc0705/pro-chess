import {initializeApp} from 'firebase/app';
import {getDatabase} from 'firebase/database';
import{getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC-rPr_u-7sydjkpcL3F4cAaUzidIgGTsw",
  authDomain: "upnhac-f60ca.firebaseapp.com",
  databaseURL:
    "https://upnhac-f60ca-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "upnhac-f60ca",
  storageBucket: "upnhac-f60ca.appspot.com",
  messagingSenderId: "191684149330",
  appId: "1:191684149330:web:b5e865dbedb704757cdf8b"
};

export const app =initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);