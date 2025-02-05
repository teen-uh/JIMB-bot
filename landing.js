$(document).ready(function () {
  $(window).on("load", function () {
    $("#loading-gif").delay(4000).fadeOut(500);
    $("#icon").delay(5000).animate({ opacity: 1 }, 1200);
    $("#icon-text").delay(5000).animate({ opacity: 1 }, 1200);
    $("#start").delay(5500).animate({ opacity: 1 }, 1200);
  });
});
