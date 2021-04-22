var cardStatus = 'front';
//var showBtn = false;
function flip(next = 'back', showBtn = true)
{//Pendiente ver por qué no muetra el back para los otros usuarios.
  if (userPlay)
  {
    if ((cardStatus == 'front') && (next == 'back'))
    {
      $('#card').toggleClass('flipped');
      cardStatus = 'back';

      if (showBtn)
      {
        socket.emit('area3Card', {
          "userName" : userName, 
          "userSurname" : userSurname, 
          "teamName" : teamName, 
          "text" : text, 
          "score" : score
        });
        document.getElementById('nextBtnDivArea3').style.display = 'block';
        document.getElementById('nextBtnDivArea3').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
        nextStep = 'showSpinner';
        scoreArea3 += score;
      }
      else
      {
        //scoreArea3 += score;
        //document.getElementById('backContent').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
        document.getElementById('nextBtnDivArea3').innerHTML = '';
      }
      document.getElementById('backContent').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
      showGameInfo();
    }
    if ((cardStatus == 'back') && (next == 'front'))
    {//Pendiente ver si será necesario usarlo.
      $('#card').toggleClass('flipped');
      cardStatus = 'front';
    }
  }
}