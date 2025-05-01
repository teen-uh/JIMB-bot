document.addEventListener("DOMContentLoaded", function () {
  let inputEmail = document.getElementById("email-input");
  let form = document.getElementById("email-form");

  let users = {
    "teenuh@jimbbot.com": "Tina",
    "emp-4721x@nexacorp.com": "Employee EMP-4721X",
    "sta-839jq@nexacorp.com": "Employee STA-839JQ",
    "idt-6249b@nexacorp.com": "Employee IDT-6249B",
    "ops-9157z@nexacorp.com": "Employee OPS-9157Z",
    "usr-380kl@nexacorp.com": "Employee USR-380KL",
    "ily-thia@idasl.com": "Eilythia",
    "angie@idasl.com": "Angie",
    "boycifer@bestbrawler.com": "Joyce",
    "uli@zap.inc": "Uli",
    "biki@zap.inc": "Nikia",
    "dajah@zap.inc": "Dajah",
    "katie@zap.inc": "Katie",
    "johans@zap.inc": "Johans",
    "karla@zap.inc": "Karla",
    "kaitlin@zap.inc": "Kaitlin",
    "emi@zap.inc": "Emi",
    "ficho@ilovemap.com": "Fiona",
    "ashwe@ilovemap.com": "Ashley",
    "coleto@ilovemap.com": "Cole",
    "wife@aca-bitches.com": "Amy",
    "gyuunchie@ilovemap.com": "Sachie",
    "avana@ilovemap.com": "Avana",
    "cueann@ilovemap.com": "Quan",
    "abbee@ilovemap.com": "Abby",
    "nico@iml444.com": "Nico",
    "darcy@iml444.com": "Darcy",
    "elzbth@thankyoufaculty.com": "Elizabeth",
    "dj@thankyoufaculty.com": "DJ",
    "sonia@bestadvisor.com": "Sonia",
    "dave@thankyoustaff.com": "Dave",
    "stacy@thankyoustaff.com": "Stacy",
    "bodies@thankyoufaculty.com": "Bodie",
    "evan@thankyoufaculty.com": "Evan",
    "virginia@thankyoufaculty.com": "Virginia",
    "jay@escaperoombuddy.com": "Jay",
    "hrvy@ilovetd.com": "Harvey",
    "val@ilovemap.com": "Val",
    "marco@fckice.com": "Marco",
    "nancy@fckice.com": "Nancy",
    "isanh@fckice.com": "Isannah",
    "sophia@fckice.com": "Sophia",
    "claire@todd.com": "Claire",
    "emhu@homie.com": "Emily",
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
