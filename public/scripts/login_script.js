$(document).ready(function() {
  $("#login-btn").click(function() {
    let username = $("#username-input").val();
    let pass = $("#password-input").val();

    let obj = {
      username: username,
      password: pass
    };
    console.log(obj);
    $.post("/login", obj, function(res) {
      alert(res);
      if (res == "done") {
        window.location.href = "/home";
      } else if (res == "wrong") {
        alert("Wrong username and/or password");
      } else {
        //error
        alert("An internal error happened")
      }
    });

  });
});
