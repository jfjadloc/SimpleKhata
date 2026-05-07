import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace these with your actual Firebase project credentials
// You can get these from the Firebase Console (Settings > Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyCe2e0E-JQOvdU_iyXtu8KzXh1IfuRg5h0",
  authDomain: "simple-khata-61810.firebaseapp.com",
  projectId: "simple-khata-61810",
  storageBucket: "simple-khata-61810.firebasestorage.app",
  messagingSenderId: "693034923614",
  appId: "1:693034923614:web:2ab1c21100fdcb8018e6cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so your hooks and components can use them
export const auth = getAuth(app);
export const db = getFirestore(app);