var game = require('./game.js');
function spin(data, socket)
{
	var message = JSON.parse(data);
    var index = game.searchRoomCode(message['roomCode'], false);
    var index2 = -1;
    if (index != -1)
    {
      for (var i = 0; i < game.rooms[index]['teams'].length; i++)
      {
        if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
        {
          for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
          {
            if ((game.rooms[index]['teams'][i]['users'][j]['userName'] == message['userName']) && 
                (game.rooms[index]['teams'][i]['users'][j]['userSurname'] == message['userSurname']))
            {
              game.rooms[index]['teams'][i]['users'][j]['rolledDice'] = true;
              index2 = j;
              j = game.rooms[index]['teams'][i]['users'].length;
            }
          }
        }
      }
      var area = message['area'];console.log('Line 343: ' + message['area']);//parseInt(message['area'].split(' ')[1]);
      if (area == 1)
      {console.log('Line 345.');//Enviar de a una pregunta.
        for (var i = 0; i < game.rooms[index]['teams'].length; i++)
        {
          if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
          {
            var allSended = true;
            for (var j = 0; j < game.questions['area' + area].length; j++)
            {
              var sended = false;
              for (var k = 0; k < game.rooms[index]['teams'][i]['sendedQuestions']['area' + area].length; k++)
              {
                if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + area][k]['question'] == game.questions['area' + area][j]['question'])
                {
                  sended = true;
                  k = game.rooms[index]['teams'][i]['sendedQuestions']['area' + area].length;
                }
              }
              if (!sended)
              {
                allSended = false;
                game.rooms[index]['teams'][i]['sendedQuestions']['area' + area].push({
                  'question' : game.questions['area' + area][j]['question'], 
                  'finalAnswer' : '', 
                  'otherAnswers' : [], 
                  'evaluation' : []
                });
                game.rooms[index]['teams'][i]['users'][index2]['status'] = 'answeringQuestionArea1';
                for (var k = 0; k < game.rooms[index]['teams'][i]['users'].length; k++)
                {//Se "recicla" esa variable para usarla en la votación de respuestas en vez de la elección del líder.
                  game.rooms[index]['teams'][i]['users'][k]['vote'] = false;
                  if (game.rooms[index]['teams'][i]['users'][k]['leader'])
                  {console.log('Asignando status: \'waitingAnsweringQuestionArea1\'');
                    game.rooms[index]['teams'][i]['users'][k]['status'] = 'waitingAnsweringQuestionArea1';
                  }
                }
                message['question'] = game.questions['area' + area][j];
                message['rooms'] = game.rooms;
                message['area'] = area;
                //message['teamName'] = game.rooms[index]['teams'][i]['teamName'];
                socket.emit('question', message);
                socket.broadcast.emit('question', message);
                j = game.questions['area' + area].length;//Pendiente ver si hace falta quitar esto para enviar a todos los usuario que no sean el lider.
              }
            }
            i = game.rooms[index]['teams'].length;
          }
        }
      }
      if (area == 2)
      {console.log('Line 389: ' + message['area']);
        for (var i = 0; i < game.rooms[index]['teams'].length; i++)
        {
          if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
          {
            message['question'] = game.questions['area2'][Math.floor(Math.random() * Math.floor(game.questions['area2'].length))];
            message['rooms'] = game.rooms;
            socket.emit('question', message);
            socket.broadcast.emit('question', message);
            for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
            {
              game.rooms[index]['teams'][i]['users'][j]['status'] = 'answeringQuestionArea2';
            }
            i = game.rooms[index]['teams'].length;
          }
        }
      }
      if (area == 3)
      {//Enviar risks y oportunities. .
        for (var i = 0; i < game.rooms[index]['teams'].length; i++)
        {
          if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
          {
            var type = 'risk';
            if (Math.floor(Math.random() * Math.floor(2)))
            {
              type = 'oportunity';
            }
            var ro = game['area3'][type][Math.floor(Math.random() * Math.floor(game['area3'][type].length))];
            game.rooms[index]['teams'][i]['scoreArea3'] += ro['score'];
            message['ro'] = ro;
            message['type'] = type;
            message['rooms'] = game.rooms;
            message['area'] = area;
            //Hay que lanzar el dado.
            //Reiniciar si lanzaron todos.
            var allUsersRolled = true;
            for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
            {
              if (!game.rooms[index]['teams'][i]['users'][j]['rolledDice'])
              {
                allUsersRolled = false;
                j = game.rooms[index]['teams'][i]['users'].length;
              }
            }
            if (allUsersRolled)
            {console.log('Line 471.');
              for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
              {
                game.rooms[index]['teams'][i]['users'][j]['rolledDice'] = false;
              }
            }
            socket.emit('ro', message);
            socket.broadcast.emit('ro', message);
            i = game.rooms[index]['teams'].length;
          }
        }
      }
    }
}
function startSpin(data, socket)
{
	var message = JSON.parse(data);
    var index = game.searchRoomCode(message['roomCode'], false);
    if (index != -1)
    {
      for (var i = 0; i < game.rooms[index]['teams'].length; i++)
      {
        if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
        {
			socket.emit('startSpin', message);
			socket.broadcast.emit('startSpin', message);
        }
      }
    }
}
function showWheel(data, socket)
{
	var message = JSON.parse(data);
    var index = game.searchRoomCode(message['roomCode'], false);
    if (index != -1)
    {
      //game.rooms[index]['teams'][i]['sendedQuestions'].push(game.questions['area' + data['area']][j]['question']);
      for (var i = 0; i < game.rooms[index]['teams'].length; i++)
      {
        if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
        {
          //Hay que lanzar el dado.
          //Reiniciar si lanzaron todos.
          var allUsersRolled = true;
          for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
          {
            if (!game.rooms[index]['teams'][i]['users'][j]['rolledDice'])
            {
              allUsersRolled = false;
              j = game.rooms[index]['teams'][i]['users'].length;
            }
          }
          if (allUsersRolled)
          {
            for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
            {
              game.rooms[index]['teams'][i]['users'][j]['rolledDice'] = false;
            }
          }
          message['rooms'] = game.rooms;
          for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
          {
            if (!game.rooms[index]['teams'][i]['users'][j]['rolledDice'])
            {
              message['userName'] = game.rooms[index]['teams'][i]['users'][j]['userName'];
              message['userSurname'] = game.rooms[index]['teams'][i]['users'][j]['userSurname'];
              message['rooms'] = game.rooms;
              socket.emit('showSpinner', message);
              socket.broadcast.emit('showSpinner', message);
              //Es necesario detener el bucle para que tire de a uno a la vez.
              j = game.rooms[index]['teams'][i]['users'].length;
            }
          }
        }
      }
    }
}
module.exports.spin = spin;
module.exports.startSpin = startSpin;
module.exports.showWheel = showWheel;