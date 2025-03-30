document.addEventListener("DOMContentLoaded", function () {
const firebaseConfig = {
  apiKey: "AIzaSyBsdDjdE_Ztdx39NgkKuOjg1HGPtaLfHSA",
  authDomain: "jimb-bot.firebaseapp.com",
  projectId: "jimb-bot",
  storageBucket: "jimb-bot.firebasestorage.app",
  messagingSenderId: "679102203764",
  appId: "1:679102203764:web:93ab530ca00da5a5de8e21",
  measurementId: "G-VDHM6CD91N",
};

firebase.initializeApp(firebaseConfig);

function loadLeaderboard() {
  let leaderboardTable = document.querySelector("#leaderboard tbody");
  leaderboardTable.innerHTML = "";

  let resultsRef = firebase.database().ref(`results`);
  let responsesRef = firebase.database().ref(`responses`);

  Promise.all([resultsRef.once("value"), responsesRef.once("value")])
      .then(([resultsSnapshot, responsesSnapshot]) => {
        if (resultsSnapshot.exists() && responsesSnapshot.exists()) {
          let resultsData = resultsSnapshot.val();
          let responsesData = responsesSnapshot.val();

          // Map and sort users by score
          let leaderboard = Object.keys(resultsData).map((userID) => {
            let name = responsesData[userID]
              ? Object.values(responsesData[userID])[0].userResponse
              : "Unknown";
            let score = resultsData[userID].finalResult || "No Score";

            return { name, score: parseFloat(score) || 0 }; // Ensure score is a number
          });
          leaderboard.sort((a, b) => b.score - a.score);
          leaderboard.forEach((user, index) => {
            let row = document.createElement("tr");
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${user.name}</td>
              <td>${user.score}</td>
            `;
            leaderboardTable.appendChild(row);
          });
    } else {
      console.error("No results found for this user.");
    }
  }) .catch((error) => {
    console.error("Error loading data from Firebase:", error);
  });

}

loadLeaderboard();
});
