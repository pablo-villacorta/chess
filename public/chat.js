let textInput, chatbox;

function sendMessage() {
  let txt = textInput.value;
  socket.emit("chat", {text: txt});
  addLocalMessage(txt);
  chatbox.scrollTop = chatbox.scrollHeight;
  textInput.value = "";
}

function keyPressed() {
  var key = window.event.keyCode;

    // If the user has pressed enter
    if (key === 13) {
        sendMessage();
        return false;
    }
}

function addLocalMessage(text) {
  let nt = "<div class='cb-sent-msg'><p>"+text+"</p></div>";
  chatbox.innerHTML = chatbox.innerHTML + nt;
}

function addRemoteMessage(text) {
  let nt = "<div class='cb-received-msg'><p>"+text+"</p></div>";
  chatbox.innerHTML = chatbox.innerHTML + nt;
  chatbox.scrollTop = chatbox.scrollHeight;
  textInput.value = "";
}
