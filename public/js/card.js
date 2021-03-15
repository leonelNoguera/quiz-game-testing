var cardStatus = 'front';
function flip(next, showBtn = true)
{
  if ((next == 'back') && (userPlay))
  {
    $('#card').toggleClass('flipped');

    if (showBtn)
    {
      socket.emit('area3Card', JSON.stringify({
        "userName" : userName, 
        "userSurname" : userSurname, 
        "teamName" : teamName, 
        "text" : text, 
        "score" : score, 
        "roomCode" : roomCode
      }));
      document.getElementById('back').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
      document.getElementById('back').innerHTML += '<div id="nextBtnDivArea3" style="padding-left: 90%; padding-bottom: 1%;"></div>';
      nextStep = 'showSpinner';
      document.getElementById('nextBtnDivArea3').style.display = 'block';
      document.getElementById('nextBtnDivArea3').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
      cardStatus = 'back';
    }
  }
  else
  {
    if (cardStatus != 'front')
    {
      $('#card').toggleClass('flipped');
      cardStatus = 'front';
    }
  }
}