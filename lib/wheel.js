var game = require('./game.js');
var utils = require('./utils.js');
function selectedArea(data, socket)
{console.log('wheel.js, line 3: data == ' + JSON.stringify(data));//data = JSON.stringify(data);//data = JSON.parse(data);console.log('wheel.js, line 5 data == ' + data);
	var userIndex = -1;
  for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {
      for (var j = 0; j < game.teams[i]['users'].length; j++)
      {
        if ((game.teams[i]['users'][j]['userName'] == data['userName']) && 
            (game.teams[i]['users'][j]['userSurname'] == data['userSurname']))
        {
          game.teams[i]['users'][j]['usedTheWheel'] = true;
          userIndex = j;
          j = game.teams[i]['users'].length;
        }
      }
    }
  }
  var area = data['area'];console.log('wheel.js, line 21: data[\'area\'] == ' + data['area']);
  if (data['area'] == 1)
  {//Enviar de a una pregunta.
    for (var i = 0; i < game.teams.length; i++)
    {
      if (game.teams[i]['teamName'] == data['teamName'])
      {
      	game.teams[i]['status'] = 'questionArea1';
        var allSended = true;
        for (var j = 0; j < game.questions['area1'].length; j++)
        {
          var sended = false;
          for (var k = 0; k < game.teams[i]['sendedQuestions']['area1'].length; k++)
          {
            if (game.teams[i]['sendedQuestions']['area1'][k]['question'] == game.questions['area1'][j]['question'])
            {
              sended = true;
              k = game.teams[i]['sendedQuestions']['area1'].length;
            }
          }
          if (!sended)
          {
            allSended = false;
            game.teams[i]['sendedQuestions']['area1'].push({
              'question' : game.questions['area1'][j]['question'], 
              'finalAnswer' : '', 
              'otherAnswers' : [], 
              'evaluation' : []
            });
            game.teams[i]['users'][userIndex]['status'] = 'answeringQuestionArea1';
            for (var k = 0; k < game.teams[i]['users'].length; k++)
            {
              game.teams[i]['users'][k]['voteForAnAnswer'] = false;
              if (game.teams[i]['users'][k]['leader'])
              {
                game.teams[i]['users'][k]['status'] = 'waitingAnsweringQuestionArea1';
                data['leader'] = game.teams[i]['users'][k];
              }
            }
            data['question'] = game.questions['area1'][j];
            socket.emit('question', data);
            socket.broadcast.emit('question', data);
            j = game.questions['area1'].length;
          }
        }
        i = game.teams.length;
      }
    }
  }
  if (area == 2)
  {
    for (var i = 0; i < game.teams.length; i++)
    {
      if (game.teams[i]['teamName'] == data['teamName'])
      {
        game.teams[i]['status'] = 'answeringQuestionArea2';
        data['question'] = game.questions['area2'][Math.floor(Math.random() * Math.floor(game.questions['area2'].length))];
        socket.emit('question', data);
        socket.broadcast.emit('question', data);
        game.teams[i]['actualUserName'] = data['userName'];
        game.teams[i]['actualUserSurname'] = data['userSurname'];
        for (var j = 0; j < game.teams[i]['users'].length; j++)
        {
          game.teams[i]['users'][j]['status'] = 'answeringQuestionArea2';
        }
        i = game.teams.length;
      }
    }
  }
  if (area == 3)
  {
    for (var i = 0; i < game.teams.length; i++)
    {
      if (game.teams[i]['teamName'] == data['teamName'])
      {
      	var type = 'risk';
        if (Math.floor(Math.random() * Math.floor(2)))
        {
          type = 'opportunity';
        }
        var ro = game['area3'][type][Math.floor(Math.random() * Math.floor(game['area3'][type].length))];
        game.teams[i]['scoreArea3'] += ro['score'];
        data['ro'] = ro;//ro (Risk or Opportunity)
        data['type'] = type;
        data['area'] = area;
        if (utils.allUsersInTeamUsedTheWheel(i))
        {
          for (var j = 0; j < game.teams[i]['users'].length; j++)
          {
            game.teams[i]['users'][j]['usedTheWheel'] = false;
          }
        }
        socket.emit('area3Ro', data);
        socket.broadcast.emit('area3Ro', data);
        i = game.teams.length;
      }
    }
  }
}
function startSpin(data, socket)
{
	for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {
      socket.emit('startSpin', data);
      socket.broadcast.emit('startSpin', data);
    }
  }
}
function showWheel(data, socket)
{
	for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {console.log('wheel.js, line 136: game.teams[i][\'users\'] == ');console.log(game.teams[i]['users']);
      //Hay que lanzar el dado.
      //Reiniciar si lanzaron todos.
      if (utils.allUsersInTeamUsedTheWheel(i))
      {console.log('wheel.js, line 140: Todos los usuarios del team usaron la rueda.');//Pendiente meter esta porción en utils porque se repite en varias partes.
        for (var j = 0; j < game.teams[i]['users'].length; j++)
        {
          game.teams[i]['users'][j]['usedTheWheel'] = false;
        }
      }
      for (var j = 0; j < game.teams[i]['users'].length; j++)
      {
        game.teams[i]['users'][j]['status'] = 'onlyWheel';
      }
      for (var j = 0; j < game.teams[i]['users'].length; j++)
      {console.log('wheel.js, line 151: game.teams[' + i + '][\'users\'][' + j + '][\'connected\'] == ' + game.teams[i]['users'][j]['connected']);
        if ((game.teams[i]['users'][j]['connected']) && (!game.teams[i]['users'][j]['usedTheWheel']))
        {
        	game.teams[i]['users'][j]['status'] = 'wheel';console.log('wheel.js, line 154: Wheel para ' + game.teams[i]['users'][j]['userName'] + ' ' + game.teams[i]['users'][j]['userSurname']);
      		data['userName'] = game.teams[i]['users'][j]['userName'];
      		data['userSurname'] = game.teams[i]['users'][j]['userSurname'];
      		j = game.teams[i]['users'].length;//Es necesario detener el bucle para que usen la rueda de a uno a la vez.
        }
      }
      socket.emit('showSpinner', data);
      socket.broadcast.emit('showSpinner', data);
    }
  }
}
module.exports.selectedArea = selectedArea;
module.exports.startSpin = startSpin;
module.exports.showWheel = showWheel;