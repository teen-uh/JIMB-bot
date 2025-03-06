document.addEventListener("DOMContentLoaded", function () {
  let inputEmail = document.getElementById("email-input");
  let form = document.getElementById("email-form");

  let users = {
    "tina@jimbbot.com": "Tina",
    "eilythia@iml444.com": "Eilythia",
    "elizabeth@iml444.com": "Elizabeth",
    "darcy@iml444.com": "Darcy",
    "katie@iml444.com": "Katie",
    "nico@iml444.com": "Nico",
    "johans@iml444.com": "Johans",
  };
  //   console.log(userEmail);

  function logSubmit(event) {
    event.preventDefault();
    let userEmail = inputEmail.value.trim();
    console.log(userEmail);

    if (users.hasOwnProperty(userEmail)) {
      let userName = users[userEmail];
      console.log("Name:", userName);

      alert("Email verified. Welcome, " + userName + "!");
      window.location.replace("landing.html");
    } else {
      alert("Error: email not accepted.");
    }
  }

  form.addEventListener("submit", logSubmit);
});
