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
  let option_a = 0,
    option_b = 0,
    option_c = 0,
    option_d = 0;
  let userName;

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

  function fetchQuestionsAndStartChat() {
    let questionsRef = firebase.database().ref("questions");

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
                    <button class="option-button" data-option="${key}">${option}</button>
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
                `<div class="msg user">${currentQuestion.options[selectedOption]}</div>` +
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
          console.log("help");
          let userInput = document.getElementById("userResponse");
          userInput.classList.remove("disabled");
          userInput.placeholder = "Enter response here";
          userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent form submission
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

    function handleResponse(userInput, questionKey, question) {
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
        if (userInput === "a") {
          option_a++;
        } else if (userInput === "b") {
          option_b++;
        } else if (userInput === "c") {
          option_c++;
        } else if (userInput === "d") {
          option_d++;
        }

        let responseLog =
          "A: " +
          option_a +
          " B: " +
          option_b +
          " C: " +
          option_c +
          " D: " +
          option_d;

        console.log(responseLog);
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
        let highestChoice = [
          { val: option_a, variableName: "A" },
          { val: option_b, variableName: "B" },
          { val: option_c, variableName: "C" },
          { val: option_d, variableName: "D" },
        ];
        let sortedChoices = highestChoice.sort((a, b) => a[val] - b[val]);
        console.log(sortedChoices[3]["variableName"]);

        dataDisplay.prepend(
          '<div class="msg bot">Thank you for completing the chat! Your results are being calculated. Please proceed to the printer to receive your diagnosis.</div>'
        );
      }
    }

    // Start with the first question
    displayQuestion();
  }

  setTimeout(function () {
    type("Hi! I'm JIMB-bot.");
    setTimeout(function () {
      type(
        "I am an advanced chatbot that evaluates your time optimization aptitude and present perception diagnosis.",
        1200
      );
      setTimeout(function () {
        type("Let's work together to optimize your productivity!", 1200);
      }, 2900);
    }, 2300);
  }, 500);

  setTimeout(function () {
    fetchQuestionsAndStartChat();
  }, 8400);
});
