var cardStatus = 'front';
var showBtn = false;
function flip(next = 'back', showBtn = true)
{
  if (userPlay)
  {
    if ((cardStatus == 'front') && (next == 'back'))
    {
      $('#card').toggleClass('flipped');
      cardStatus = 'back';

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
        document.getElementById('nextBtnDivArea3').style.display = 'block';
        document.getElementById('backContent').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
        nextStep = 'showSpinner';
        scoreArea3 += score;
        showGameInfo();
      }
      else
      {
        document.getElementById('nextBtnDivArea3').style.display = 'none';
      }
    }
    if ((cardStatus == 'back') && (next == 'front'))
    {
      $('#card').toggleClass('flipped');
      cardStatus = 'front';
    }
  }
}