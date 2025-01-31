document.addEventListener("DOMContentLoaded", function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBsdDjdE_Ztdx39NgkKuOjg1HGPtaLfHSA",
        authDomain: "jimb-bot.firebaseapp.com",
        projectId: "jimb-bot",
        storageBucket: "jimb-bot.firebasestorage.app",
        messagingSenderId: "679102203764",
        appId: "1:679102203764:web:93ab530ca00da5a5de8e21",
        measurementId: "G-VDHM6CD91N"
    };


    firebase.initializeApp(firebaseConfig);

    // Create a unique user ID for each session
    function generateUserID() {
        let timestamp = Date.now();
        let randomPart = Math.floor(Math.random() * 1000000);
    return `user_${timestamp}_${randomPart}`;
    }

    const userID = generateUserID();

    // Fetch questions from Firebase and initialize the chatbot
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

    // Function to start the chatbot
    function startChatbot(questions, userID) {
        
    const questionKeys = Object.keys(questions); // Get all question IDs
    let currentQuestionIndex = 0;

    // Function to display a question
    function displayQuestion() {
        const currentQuestionKey = questionKeys[currentQuestionIndex];
        const currentQuestion = questions[currentQuestionKey];

        const questionContainer = document.getElementById("chat");
        questionContainer.innerHTML = `
        <div>
            <h2>${currentQuestion.text}</h2>
            ${Object.entries(currentQuestion.options)
            .map(
                ([key, option]) => `
            <button class="option-button" data-option="${key}">${option}</button>
            `
            )
            .join("")}
        </div>
        `;

        // Add click handlers for options
        const optionButtons = document.querySelectorAll(".option-button");
        optionButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const selectedOption = e.target.getAttribute("data-option");
            handleResponse(selectedOption, currentQuestionKey, currentQuestion);
        });
        });
    }

    // Function to handle user response
    function handleResponse(selectedOption, questionKey, question) {
             
    let userResponsesRef = firebase.database().ref(`responses/${userID}`);
        const responseData = {
        questionKey: questionKey,
        questionText: question.text,
        selectedOption: selectedOption,
        optionText: question.options[selectedOption],
        };
        userResponsesRef.set({
            response: responseData,
          });

        // Display bot's response
        const responseContainer = document.getElementById("response-container");
        console.log(question.responses[selectedOption])
        responseContainer.innerHTML = `<p>${question.responses[selectedOption]}</p>`;

        // Move to the next question or finish
        currentQuestionIndex++;
        if (currentQuestionIndex < questionKeys.length) {
        setTimeout(displayQuestion, 2000); // Wait before showing the next question
        } else {
        responseContainer.innerHTML += `
            <p>Thank you for completing the chat! Reflect on your answers.</p>
        `;
        }
    }

    // Start with the first question
    displayQuestion();
    }
    fetchQuestionsAndStartChat();

    // // Initialize the chatbot when the page loads
    // document.addEventListener("DOMContentLoaded", () => {
    // fetchQuestionsAndStartChat();
    // });
});