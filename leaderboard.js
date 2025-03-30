// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase Config - Replace with your project details
const firebaseConfig = {
  apiKey: "AIzaSyBsdDjdE_Ztdx39NgkKuOjg1HGPtaLfHSA",
  authDomain: "jimb-bot.firebaseapp.com",
  projectId: "jimb-bot",
  storageBucket: "jimb-bot.firebasestorage.app",
  messagingSenderId: "679102203764",
  appId: "1:679102203764:web:93ab530ca00da5a5de8e21",
  measurementId: "G-VDHM6CD91N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function loadLeaderboard() {
  const leaderboardTable = document.querySelector("#leaderboard tbody");
  leaderboardTable.innerHTML = "";

  const snapshot = await get(ref(db, "/results"));
  const responsesSnapshot = await get(ref(db, "/responses"));

  if (!snapshot.exists() || !responsesSnapshot.exists()) return;

  const results = snapshot.val();
  const responses = responsesSnapshot.val();

  // Map and sort users by score
  const leaderboard = Object.keys(results).map((userID) => {
    const name = responses[userID]
      ? Object.values(responses[userID])[0].userResponse
      : "Unknown";
    const score = results[userID].finalResult || "No Score";

    return { name, score };
  });

  leaderboard.sort((a, b) => a.score.localeCompare(b.score));

  leaderboard.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.score}</td>
    `;
    leaderboardTable.appendChild(row);
  });
}

loadLeaderboard();
