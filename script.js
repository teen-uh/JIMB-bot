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
    subordination: 0,
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
            }, 3200);
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
        // generatePrintableDocument(resultData);
      } else {
        console.error("No results found for this user.");
      }
    });
  }

  window.fetchUserResults = fetchUserResults;
  // window.generatePrintableDocument = generatePrintableDocument;

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
      let randomNum = Math.random();
      randomNum = parseFloat(randomNum.toFixed(2));
      let score = value + randomNum;
      return score;
    }

    function categorize(score) {
      if (score >= 0 && score <= 6) return "Low";
      if (score >= 7 && score <= 13) return "Medium";
      return "High"; // 14–20
    }

    function processFinalResult() {
      let categorizedScores = {
        subordination: categorize(scores.subordination),
        productivity: categorize(scores.productivity),
        conformity: categorize(scores.conformity),
        selfPolicing: categorize(scores.selfPolicing),
        timeAwareness: categorize(scores.timeAwareness),
      };
      let classifiedScores = {
        subordination: classifyScore(scores.subordination),
        productivity: classifyScore(scores.productivity),
        conformity: classifyScore(scores.conformity),
        selfPolicing: classifyScore(scores.selfPolicing),
        timeAwareness: classifyScore(scores.timeAwareness),
      };
      let finalScore =
        classifiedScores.subordination +
        classifiedScores.productivity +
        classifiedScores.conformity +
        classifiedScores.selfPolicing +
        classifiedScores.timeAwareness;
      finalScore = parseFloat(finalScore.toFixed(2));

      let finalResult = "";
      let description = "";
      if (
        categorizedScores.productivity === "High" &&
        categorizedScores.timeAwareness === "High" &&
        categorizedScores.selfPolicing === "High"
      ) {
        finalResult = "Overperforming at Unsustainable Rates";
        description =
          "You’re working at full speed, and while your efficiency is impressive, remember that a sustainable pace is key. Pushing too hard can lead to burnout—and that’s when you're no longer useful. Keep up the hard work, but don't break the machine.";
      } else if (
        categorizedScores.subordination === "High" &&
        categorizedScores.conformity === "High" &&
        categorizedScores.productivity === "High" &&
        (categorizedScores.timeAwareness === "Low" ||
          categorizedScores.timeAwareness === "Medium")
      ) {
        finalResult = "Reliable and Replaceable";
        description =
          "You’re the perfect employee—efficient, punctual, predictable. The system thrives on you, but remember, cogs are replaceable when they stop fitting in.";
      } else if (
        categorizedScores.timeAwareness === "High" &&
        categorizedScores.subordination === "High" &&
        categorizedScores.productivity === "Low"
      ) {
        finalResult = "High Awareness, Low Output";
        description =
          "You track every moment but fail to convert awareness into value. While others progress, you perfect inefficiency with precision.";
      } else if (
        categorizedScores.conformity === "High" &&
        categorizedScores.selfPolicing === "High" &&
        categorizedScores.productivity === "Low"
      ) {
        finalResult = "Compliance with Minimal Yield";
        description =
          "You comply without question. But impact, not compliance, drives retention. It’s hard to tell if you’re contributing or just filling space.";
      } else if (
        categorizedScores.subordination === "Low" &&
        categorizedScores.conformity === "Low" &&
        categorizedScores.timeAwareness === "Low" &&
        (categorizedScores.productivity === "Low" ||
          categorizedScores.productivity === "Medium")
      ) {
        finalResult = "Low Engagement Risk Factor";
        description =
          "You resist structure and avoid output. Refusing to engage doesn’t make you a rebel—it makes you irrelevant.";
      } else if (
        Object.values(categorizedScores).every((score) => score === "High")
      ) {
        finalResult = "System-Aligned Productivity Asset";
        description =
          "You meet every benchmark and internalize every expectation. Your work is appreciated but remember to keep working hard because further optimization could deem you obsolete.";
      } else if (
        Object.values(categorizedScores).every((score) => score === "Medium")
      ) {
        finalResult = "Consistently Unremarkable";
        description =
          "You do just enough to get by, barely resisting but barely engaging. The system doesn’t reward half-hearted efforts, it rewards commitment, which you lack.";
      } else if (
        Object.values(categorizedScores).every((score) => score === "Low")
      ) {
        finalResult = "Noncompliant and Unaligned";
        description =
          "You’ve completely unplugged from the system, but that’s a choice with consequences. This does not make you unique—just flagged for termination.";
      } else if (
        categorizedScores.selfPolicing === "High" &&
        categorizedScores.timeAwareness === "High" &&
        (categorizedScores.productivity === "Medium" ||
          categorizedScores.productivity === "High") &&
        categorizedScores.subordination !== "High"
      ) {
        finalResult = "Self-Disciplined, Underperforming";
        description =
          "You enforce control over yourself without producing commensurate results. Oversight without output is inefficiency.";
      } else if (
        categorizedScores.productivity === "Medium" &&
        categorizedScores.timeAwareness === "Medium" &&
        categorizedScores.subordination === "Medium" &&
        categorizedScores.conformity === "Low" &&
        categorizedScores.selfPolicing === "Low"
      ) {
        finalResult = "Adaptive Non-Essential";
        description =
          "You exhibit flexibility in navigating expectations, but without driving measurable outcomes. Your presence maintains stability, but offers no strategic value. You are useful—until optimization requires otherwise.";
      } else {
        finalResult = "Temporally Unclassified";
        description =
          "Your behavior and time management fall outside established norms. You resist fitting into any useful category. Anomalies are flagged for review—and eventually, termination.";
      }

      let resultData = {
        userID: userID,
        finalScore: finalScore,
        classifiedScores: classifiedScores,
        finalResult: finalResult,
        description: description,
        timestamp: new Date().toISOString(),
      };

      let resultsRef = firebase.database().ref(`results/${userID}`);
      resultsRef.set(resultData);
      type(
        `You have now completed the assessment. I enjoyed talking with you!
        `
      );
      setTimeout(function () {
        type(
          `Please proceed to the printer to receive your final result and diagnosis. Also, don't forget to check the scoreboard to see how you rank among the top employees!
        `
        );
      }, 2000);
      setTimeout(function () {
        type(
          `The system will now reset.
        `
        );
      }, 4200);
      setTimeout(function () {
        window.location.replace("index.html");
      }, 8000);
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

      // Handle response for the last question
      if (currentQuestionIndex >= questionKeys.length - 1) {
        // If it's the last question, process the response first
        let typingWrapper = document.createElement("div");
        typingWrapper.innerHTML = `
      <div class="flex">
        <div id="bot-pfp"></div>
        <div class="msg bot" id="typing${typingID}">
          <div class="typing">
            <div class="dot" style="--delay: 200ms"></div>
            <div class="dot" style="--delay: 400ms"></div>
            <div class="dot" style="--delay: 600ms"></div>
          </div>
        </div>
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
        console.log(typingID);
        currentQuestionIndex++;

        // After displaying the response, process the final result
        setTimeout(processFinalResult, 3200); // Wait a little before final result

        return; // Prevent further question display
      }

      // Normal question flow for non-last questions
      let typingWrapper = document.createElement("div");
      typingWrapper.innerHTML = `
    <div class="flex">
      <div id="bot-pfp"></div>
      <div class="msg bot" id="typing${typingID}">
        <div class="typing">
          <div class="dot" style="--delay: 200ms"></div>
          <div class="dot" style="--delay: 400ms"></div>
          <div class="dot" style="--delay: 600ms"></div>
        </div>
      </div>
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
      console.log(typingID);
      currentQuestionIndex++;

      // Display the next question after response is shown
      setTimeout(displayQuestion, 3200);
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
