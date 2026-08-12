// ======================================
// Firebase Configuration
// Learn With Siam
// ======================================
//
// 🔴 এখানে তোমার নিজের Firebase Project এর config বসাও।
// Firebase Console → Project Settings → General → Your apps (Web app)
// থেকে এই অবজেক্টটা কপি করে নিচেরটা রিপ্লেস করে দাও।

const firebaseConfig = {
  apiKey: "AIzaSyD865zAWvYKYBfe1srfcPzco_KJlU0kwXI",
  authDomain: "learn-with-siam.firebaseapp.com",
  projectId: "learn-with-siam",
  storageBucket: "learn-with-siam.firebasestorage.app",
  messagingSenderId: "309261512654",
  appId: "1:309261512654:web:05e02ad5b8f727f943c59f"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
