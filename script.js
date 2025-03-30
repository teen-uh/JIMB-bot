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
  let dataDisplay = document.getElementById("chat");
  dataDisplay.innerHTML = "";
  let typingID = 1;
  let userName;
  let scores = {
    autonomy: 0,
    productivity: 0,
    conformity: 0,
    selfPolicing: 0,
    timeAwareness: 0,
  };
  let questionsRef = firebase.database().ref("questions");

  function generateUserID() {
    let timestamp = Date.now();
    let randomPart = Math.floor(Math.random() * 1000000);
    return `user_${timestamp}_${randomPart}`;
  }

  const userID = generateUserID();

  function type(text, timeout = 1200) {
    let typingWrapper = document.createElement("div");
    typingWrapper.innerHTML = `
        <div class="flex">
         <div id="bot-pfp"></div>
        <div class="msg bot" id="typing${typingID}">
          <div class="typing">
              <div class="dot" style="--delay: 200ms"></div>
              <div class="dot" style="--delay: 400ms"></div>
              <div class="dot" style="--delay: 600ms"></div>
        </div></div>
        </div>`;

    dataDisplay.prepend(typingWrapper);

    let typingReplace = document.getElementById("typing" + typingID);
    typingID++;

    setTimeout(function () {
      typingReplace.innerHTML = text;
    }, timeout);
  }

  function firstQuestions() {
    let typingWrapper = document.createElement("div");
    typingWrapper.innerHTML = `
        <div class="flex">
         <div id="bot-pfp"></div>
        <div class="msg bot" id="typing${typingID}">
          <div class="typing">
              <div class="dot" style="--delay: 200ms"></div>
              <div class="dot" style="--delay: 400ms"></div>
              <div class="dot" style="--delay: 600ms"></div>
        </div></div>
        </div>`;

    dataDisplay.prepend(typingWrapper);
    let typingReplace = document.getElementById("typing" + typingID);
    typingID++;

    setTimeout(function () {
      typingReplace.innerHTML =
        "Do you accept the terms and conditions of using this service?";

      let botMessage = `
          <div class="option-wrapper">
            <button class="option-button" data-option="Yes">Yes</button>
            <button class="option-button" data-option="No">No</button>
          </div>
        `;

      dataDisplay.innerHTML = botMessage + dataDisplay.innerHTML;

      document.querySelectorAll(".option-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          let selectedOption = e.target.getAttribute("data-option");
          dataDisplay.innerHTML =
            `<div class="msg user">${selectedOption}</div>` +
            dataDisplay.innerHTML;
          if (selectedOption === "Yes") {
            type("Response recorded. Your consent is appreciated!");
            setTimeout(function () {
              fetchQuestionsAndStartChat();
            }, 2500);
          } else if (selectedOption === "No") {
            type(
              "Response recorded. I hope that you will find me of use next time!"
            );
            setTimeout(function () {
              window.location.replace("index.html");
            }, 1200);
          }
        });
      });
    }, 500);
  }

  function fetchUserResults(userID) {
    let resultsRef = firebase.database().ref(`results/${userID}`);

    resultsRef.once("value").then((snapshot) => {
      if (snapshot.exists()) {
        let resultData = snapshot.val();
        generatePrintableDocument(resultData);
      } else {
        console.error("No results found for this user.");
      }
    });
  }

  function generatePrintableDocument(resultData) {
    let printableContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .section { margin-bottom: 20px; }
            .result { font-size: 18px; font-weight: bold; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>Time Perception Test Results</h1>
          <p><strong>User ID:</strong> ${resultData.userID}</p>
  
          <div class="section">
            <h2>Score Breakdown:</h2>
            <p>Autonomy: ${resultData.categorizedScores.autonomy}</p>
            <p>Productivity: ${resultData.categorizedScores.productivity}</p>
            <p>Conformity: ${resultData.categorizedScores.conformity}</p>
            <p>Self-Policing: ${resultData.categorizedScores.selfPolicing}</p>
            <p>Time Awareness: ${resultData.categorizedScores.timeAwareness}</p>
          </div>
  
          <div class="result">
            <h2>Final Diagnosis: ${resultData.finalResult}</h2>
          </div>
        </body>
      </html>
    `;

    let newWindow = window.open("", "_blank");
    newWindow.document.write(printableContent);
    newWindow.document.close();
    newWindow.print();
  }

  function fetchQuestionsAndStartChat() {
    questionsRef.once("value").then((snapshot) => {
      const questions = snapshot.val();
      if (questions) {
        startChatbot(questions, userID);
      } else {
        console.error("No questions found in Firebase!");
      }
    });
  }

  function startChatbot(questions, userID) {
    let questionKeys = Object.keys(questions);
    let currentQuestionIndex = 0;

    function displayQuestion() {
      let currentQuestionKey = questionKeys[currentQuestionIndex];
      let currentQuestion = questions[currentQuestionKey];
      let typingWrapper = document.createElement("div");
      typingWrapper.innerHTML = `
        <div class="flex">
         <div id="bot-pfp"></div>
        <div class="msg bot" id="typing${typingID}">
          <div class="typing">
              <div class="dot" style="--delay: 200ms"></div>
              <div class="dot" style="--delay: 400ms"></div>
              <div class="dot" style="--delay: 600ms"></div>
        </div></div>
        </div>`;

      dataDisplay.prepend(typingWrapper);
      let typingReplace = document.getElementById("typing" + typingID);

      setTimeout(function () {
        typingReplace.innerHTML = currentQuestion.text;

        if (currentQuestion.type === "multiple-choice") {
          let botMessage = `
            <div class="option-wrapper">
              ${Object.entries(currentQuestion.options)
                .map(
                  ([key, option]) => `
                    <button class="option-button" data-option="${key}">${option.text}</button>
                  `
                )
                .join("")}
            </div>
          `;

          dataDisplay.innerHTML = botMessage + dataDisplay.innerHTML;

          document.querySelectorAll(".option-button").forEach((button) => {
            button.addEventListener("click", (e) => {
              let selectedOption = e.target.getAttribute("data-option");

              dataDisplay.innerHTML =
                `<div class="msg user">${currentQuestion.options[selectedOption]["text"]}</div>` +
                dataDisplay.innerHTML;
              setTimeout(function () {
                handleResponse(
                  selectedOption,
                  currentQuestionKey,
                  currentQuestion
                );
              }, 1500);
            });
          });
        } else if (currentQuestion.type === "user-input") {
          let userInput = document.getElementById("userResponse");

          // Remove any previous event listeners before adding a new one
          userInput.replaceWith(userInput.cloneNode(true));
          userInput = document.getElementById("userResponse"); // Get the fresh element

          userInput.classList.remove("disabled");
          userInput.placeholder = "Enter response here";

          userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              let userAnswer = userInput.value.trim();
              if (userAnswer !== "") {
                dataDisplay.innerHTML =
                  `<div class="msg user">${userAnswer}</div>` +
                  dataDisplay.innerHTML;
                userInput.value = "";
                userInput.classList.add("disabled");
                userInput.placeholder = "";
                setTimeout(function () {
                  handleResponse(
                    userAnswer,
                    currentQuestionKey,
                    currentQuestion
                  );
                }, 1500);
              }
            }
          });
        }
      }, 2500);
    }

    function classifyScore(value) {
      if (value <= 2) return "Low";
      if (value <= 4) return "Mid";
      return "High";
    }

    function calculateFinalScore(
      autonomy,
      productivity,
      conformity,
      selfPolicing,
      timeAwareness
    ) {
      let a = autonomy * 2 * -1;
      let p = productivity * 2;
      let c = conformity * 2;
      let t = timeAwareness;
      let s = selfPolicing;
      let score = a + p + c + t + s;
      return score;
    }

    function processFinalResult() {
      let categorizedScores = {
        autonomy: classifyScore(scores.autonomy),
        productivity: classifyScore(scores.productivity),
        conformity: classifyScore(scores.conformity),
        selfPolicing: classifyScore(scores.selfPolicing),
        timeAwareness: classifyScore(scores.timeAwareness),
      };
      let finalScore = calculateFinalScore(
        scores.autonomy,
        scores.productivity,
        scores.conformity,
        scores.selfPolicing,
        scores.timeAwareness
      );
      let finalResult;

      if (
        categorizedScores.productivity === "High" &&
        categorizedScores.timeAwareness === "High"
      ) {
        finalResult = "Highly Efficient Time Manager";
      } else if (
        categorizedScores.selfPolicing === "High" ||
        categorizedScores.conformity === "High"
      ) {
        finalResult = "Structured but Overly Critical";
      } else {
        finalResult = "Balanced but Needs Improvement";
      }

      let resultData = {
        userID: userID,
        categorizedScores: categorizedScores,
        finalResult: finalResult,
        finalScore: finalScore,
        timestamp: new Date().toISOString(),
      };

      let resultsRef = firebase.database().ref(`results/${userID}`);
      resultsRef.set(resultData);

      let resultsDiv = document.createElement("div");
      resultsDiv.innerHTML = `
      <div class="flex">
       <div id="bot-pfp"></div>
      <div class="msg bot">Your categorized scores:<br>
        Autonomy: <strong>${categorizedScores.autonomy}</strong><br>
        Productivity: <strong>${categorizedScores.productivity}</strong><br>
        Conformity: <strong>${categorizedScores.conformity}</strong><br>
        Self-Policing: <strong>${categorizedScores.selfPolicing}</strong><br>
        Time Awareness: <strong>${categorizedScores.timeAwareness}</strong>
      </div>
      <div class="msg bot">Your final result: <strong>${finalResult}</strong>. Click below to print your result.</div>
      <button onclick="fetchUserResults('${userID}')">Print My Results</button>
      </div>`;

      dataDisplay.prepend(resultsDiv);
    }

    function handleResponse(userInput, questionKey, question) {
      console.log(questionKey);
      let userResponsesRef = firebase.database().ref(`responses/${userID}`);
      let currentQuestion = questions[questionKey];
      const responseData = {
        questionKey: questionKey,
        questionText: question.text,
        userResponse: userInput,
      };
      let responseKey;
      userResponsesRef.push(responseData);

      let typingWrapper = document.createElement("div");
      typingWrapper.innerHTML = `
        <div class="flex">
         <div id="bot-pfp"></div>
        <div class="msg bot" id="typing${typingID}">
          <div class="typing">
              <div class="dot" style="--delay: 200ms"></div>
              <div class="dot" style="--delay: 400ms"></div>
              <div class="dot" style="--delay: 600ms"></div>
        </div></div>
        </div>`;

      dataDisplay.prepend(typingWrapper);

      let typingReplace = document.getElementById("typing" + typingID);
      if (currentQuestion.type === "user-input") {
        responseKey = "default";
      } else if (currentQuestion.type === "multiple-choice") {
        let optionScores = question.options[userInput].scores;
        for (let key in optionScores) {
          if (scores.hasOwnProperty(key)) {
            scores[key] += optionScores[key];
          }
        }
        console.log("Updated Scores:", scores);
        responseKey = userInput;
      }

      setTimeout(function () {
        typingReplace.innerHTML =
          question.responses[responseKey] || "Response recorded.";
      }, 2200);

      typingID++;
      currentQuestionIndex++;
      if (currentQuestionIndex < questionKeys.length) {
        setTimeout(displayQuestion, 3200);
      } else if (currentQuestionIndex >= questionKeys.length) {
        processFinalResult();
      }
    }

    // Start with the first question
    displayQuestion();
  }

  setTimeout(function () {
    type("Hi! I'm JIMB-bot.", 600);
    setTimeout(function () {
      type(
        "I am an advanced chatbot designed to evaluate your time optimization aptitude and present perception diagnosis.",
        2000
      );
      setTimeout(function () {
        type(
          "Your employer has outsourced us to assess your productivity levels and time use profile. Your responses and results will be recorded, processed, and sent to your employer for review. JIMB-bot is not liable for any changes to your employment status that may result after the conclusion of this assessment.",
          5500
        );
        setTimeout(function () {
          firstQuestions();
        }, 7500);
      }, 3500);
    }, 2300);
  }, 500);
});
