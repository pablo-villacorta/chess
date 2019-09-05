$(document).ready(function() {
  $.get("/userInfo", function(res) {
    //show username
    $("#username").html("@"+res.username);

    //game history
    let games = res.games;
    let t = "<tr>";
    t += "<th>White</th>";
    t += "<th>Black</th>";
    t += "<th>Date</th>";
    t += "<th>Reason</th>";
    t += "<th>Moves</th>";
    t += "</tr>"
    for(let i = 0; i < games.length; i++) {
      t = t + "<tr>";

      if(games[i].winner == games[i].white) {
        t += "<td><b>@" + games[i].white + "</b></td>";
        t += "<td>@" + games[i].black + "</td>";
      } else if(games[i].winner == games[i].black) {
        t += "<td>@" + games[i].white + "</td>";
        t += "<td><b>@" + games[i].black + "</b></td>";
      } else {
        //draw
        t += "<td>@" + games[i].white + "</td>";
        t += "<td>@" + games[i].black + "</td>";
      }
      t += "<td>" + games[i].date.split("T")[0] + "</td>";
      t += "<td id='table-reason'>" + games[i].endReason + "</td>";
      t += "<td>" + games[i].totalMoves + "</td>";

      t = t + "</tr>";
    }

    $("#game-history").html(t);

    $("#played-games").html("Games played: "+res.totalGames);

    let wr, dr, lr;
    if(res.totalGames != 0) {
      wr = Math.floor(100*res.wins/res.totalGames);
      lr = Math.floor(100*res.losses/res.totalGames);
      dr = Math.floor(100 - wr - lr);
    } else {
      wr = lr = dr = 0;
    }
    console.log(res);
    $("#rates").html("Win: "+wr+"% - Draw: "+dr+"% - Loss: "+lr+"%");
  });
  $("#play-btn").click(function() {
    window.location.href = "game.html";
  });
  $(".profile-indicator").click(function() {
    window.location.href = "/logout";
  });
});
