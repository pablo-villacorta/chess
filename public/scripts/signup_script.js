$(document).ready(function() {
  $("#signup-btn").click(function() {
    let name = $("#name-input").val();
    let username = $("#username-input").val();
    let pass1 = $("#password1-input").val();
    let pass2 = $("#password2-input").val();

    if(pass1 != pass2) {
      alert("The passwords do not match.");
    } else {
      let obj = {
        name: name,
        username: username,
        password: pass1
      };
      console.log(obj);
      $.post("/signup", obj, function(res) {
        alert(res);
        if(res == "already exists") {
          alert("The username you have chosen already exists. Please pick another one.");
        } else if(res == "done") {
          window.location.href = "/home";
        } else {
          //error
          alert("An internal error happened")
        }
      });
    }
  });
});
