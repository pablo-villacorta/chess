$(document).ready(function() {
  $.get("/userInfo", function(res) {
    $("#username").html(res.username);
  });
  $(".play-btn").click(function() {
    window.location.href = "game.html";
  });
});
