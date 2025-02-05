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

  function generateUserID() {
    let timestamp = Date.now();
    let randomPart = Math.floor(Math.random() * 1000000);
    return `user_${timestamp}_${randomPart}`;
  }

  const userID = generateUserID();

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
    const questionKeys = Object.keys(questions);
    let currentQuestionIndex = 0;

    function displayQuestion() {
      const currentQuestionKey = questionKeys[currentQuestionIndex];
      const currentQuestion = questions[currentQuestionKey];

      dataDisplay.innerHTML =
        `
        <div class="option-wrapper">
          ${Object.entries(currentQuestion.options)
            .map(
              ([key, option]) => `
                <button class="option-button" data-option="${key}">${option}</button>
              `
            )
            .join("")}
        </div>
                <div class="flex"><div id="bot-pfp"></div><p class="msg bot">${
                  currentQuestion.text
                }</p></div>
      ` + dataDisplay.innerHTML;

      document.querySelectorAll(".option-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          const selectedOption = e.target.getAttribute("data-option");
          dataDisplay.innerHTML =
            `<div class="msg user">${currentQuestion.options[selectedOption]}</div>` +
            dataDisplay.innerHTML;
          setTimeout(function () {
            handleResponse(selectedOption, currentQuestionKey, currentQuestion);
          }, 1500);
        });
      });
    }

    function handleResponse(selectedOption, questionKey, question) {
      let userResponsesRef = firebase.database().ref(`responses/${userID}`);
      const responseData = {
        questionKey: questionKey,
        questionText: question.text,
        selectedOption: selectedOption,
        optionText: question.options[selectedOption],
      };
      userResponsesRef.push(responseData);

      console.log(question.responses[selectedOption]);
      dataDisplay.innerHTML =
        `<div class="flex"><div id="bot-pfp"></div><p class="msg bot">${
          question.responses[selectedOption] || "Interesting choice!"
        }</p></div>` + dataDisplay.innerHTML;

      // Move to the next question or finish
      currentQuestionIndex++;
      if (currentQuestionIndex < questionKeys.length) {
        setTimeout(displayQuestion, 2200); // Wait before showing the next question
      } else {
        dataDisplay.innerHTML +=
          `
                <p class="msg bot">Thank you for completing the chat! Reflect on your answers.</p>
              ` + dataDisplay.innerHTML;
      }
    }

    // Start with the first question
    displayQuestion();
  }

  setTimeout(function () {
    fetchQuestionsAndStartChat();
  }, 1500);

  // // Initialize the chatbot when the page loads
  // document.addEventListener("DOMContentLoaded", () => {
  // fetchQuestionsAndStartChat();
  // });
});
