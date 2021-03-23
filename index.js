var game = require('./lib/game.js');
var area2 = require('./lib/area2.js');
var login = require('./lib/login.js');
var voting = require('./lib/voting.js');
var wheel = require('./lib/wheel.js');
var disconnections = require('./lib/disconnections.js');
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var admin;
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => {
  //console.log(socket.id);
	var addedUser = false;
  socket.on('adminLogin', (data) => {
    var message = JSON.parse(data);
    if (message['password'] == 'Password123')/*tmp_code*/
    {
      admin = socket.id;
      message['password'] = undefined;
      message['rooms'] = game.rooms;
      message['questionsArea1'] = game.questions['area1'];
      socket.emit('adminLogged', message);
    }
    else
    {
      socket.emit('error', {});
    }
  });
  socket.on('submitQuestionsArea1', (data) => {
    var message = JSON.parse(data);
    if (message['password'] == 'Password123')
    {console.log('Line 40.');
      game.questions['area1'] = message['questionsArea1'];
      console.log(game.questions['area1'].length + ' preguntas.');
      for (var i = 0; i < game.questions['area1'].length; i++)
      {
        console.log(game.questions['area1'][i]['question']);
      }
      //console.log(socket.id);
    }
  });
	socket.on('update', (data) => {
		login.update(data, socket);
	});
  socket.on('voteLeader', (data) => {//console.log('Line 187.');//Pendiente asegurarse de que no pueda votar sin estar en ese team.
    voting.voteLeader(socket, data);
  });
  socket.on('spin', (data) => {console.log(data);
    wheel.spin(data, socket);
  });
  socket.on('startSpin', (data) => {
    wheel.startSpin(data, socket);
  });
  socket.on('allUsersVotation', (data) => {
    voting.allUsersVotation(socket, data);
  });
  socket.on('leaderVotation', (data) => {
    voting.leaderVotation(data, socket);
  });
  socket.on('area2Question', (data) => {
    socket.broadcast.emit('area2Question', JSON.parse(data));
  });
  socket.on('area3Card', (data) => {
    var message = JSON.parse(data);
    socket.broadcast.emit('area3Card', message);
  });
  socket.on('personalEvaluation', (data) => {//input range
    var message = JSON.parse(data);
    var index = game.searchRoomCode(message['roomCode'], false);
    if (index != -1)
    {
      //game.rooms[index]['teams'][i]['sendedQuestions'].push(game.questions['area' + data['area']][j]['question']);
      for (var i = 0; i < game.rooms[index]['teams'].length; i++)
      {
        if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
        {console.log('Line 580.');//Pendiente ver si es necesario omitir al lider en esta parte.
          /*"question" : question, 
          "answer" : answer, 
          "area" : area, 
          "evaluation" : parseInt(document.getElementById('personalEvaluationRange').value) + 1, 
          "roomCode" : roomCode*/
          //console.log(message['question']);
          for (var j = 0; j < game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']].length; j++)
          {//console.log(game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['question'], message['question']);
            if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['question'] == message['question'])
            {console.log('Line 589.');//Pregunta actual encontrada en sendedQuestions.
              //game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['finalAnswer']
              //Ver por qué no llega a este punto.
              game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['evaluation'].push({
                'evaluation' : message['evaluation'], 
                'userName' : message['userName'], 
                'userSurname' : message['userSurname']
              });
            }
          }
          var usersConnected = 0;
          for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
          {
            if (game.rooms[index]['teams'][i]['users'][j]['connected'])
            {
              usersConnected += 1;
            }
          }
          
          message['rooms'] = game.rooms;
          var size = game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']].length;
          console.log('Line 616.');
          console.log(size, game.questions['area' + message['area']].length);
          console.log(game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][size - 1]['evaluation'].length, usersConnected);
          //game.rooms[index]['teams'][i]['users'].length
          if ((size == game.questions['area' + message['area']].length) && 
              (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][size - 1]['evaluation'].length == usersConnected))
          {//Todos los usuarios evaluaron hasta la última pregunta. //Juego terminado.
            socket.emit('finishGame', message);
            socket.broadcast.emit('finishGame', message);
          }
          else
          {
            if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][size - 1]['evaluation'].length == usersConnected)
            {//Todos los usuarios evaluaron hasta la pregunta actual. Siguiente pregunta.
              //Hay que lanzar el dado.
              //Reiniciar si lanzaron todos.
              var allUsersRolled = true;
              for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
              {
                if (game.rooms[index]['teams'][i]['users'][j]['connected'] && (!game.rooms[index]['teams'][i]['users'][j]['rolledDice']))
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
                  game.rooms[index]['teams'][i]['users'][j]['status'] = 'wheel';
                }
              }
              for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
              {
                if (game.rooms[index]['teams'][i]['users'][j]['connected'] && (!game.rooms[index]['teams'][i]['users'][j]['rolledDice']))
                {console.log('Line 508.');
                  for (var k = 0; k < game.rooms[index]['teams'][i]['users'].length; k++)
                  {
                    game.rooms[index]['teams'][i]['users'][k]['status'] = 'onlyWheel';
                  }
                  game.rooms[index]['teams'][i]['users'][j]['status'] = 'wheel';
                  message['userName'] = game.rooms[index]['teams'][i]['users'][j]['userName'];
                  message['userSurname'] = game.rooms[index]['teams'][i]['users'][j]['userSurname'];
                  message['rooms'] = game.rooms;
                  socket.emit('showSpinner', message);
                  socket.broadcast.emit('showSpinner', message);
                  //Es necesario detener el bucle para que tire de a uno a la vez.
                  j = game.rooms[index]['teams'][i]['users'].length;
                }
              }
              //socket.emit('finishGame', message);
              //socket.broadcast.emit('finishGame', message);
            }
          }
          socket.broadcast.emit('personalEvaluationAdmin', message);
        }
      }
    }
  });
  socket.on('questionArea2', (data) => {
    area2.question(socket, data);
  });
  socket.on('showTeamInfo', (data) => {
    var message = JSON.parse(data);
    socket.emit('showTeamInfo', message);
    socket.broadcast.emit('showTeamInfo', message);
  });
  socket.on('disconnect', () => {//Pendiente reiniciar cuando se van todos los de un mismo equipo.
    disconnections.disconnect(socket);
	});
  socket.on('showSpinner', (data) => {
    wheel.showWheel(data, socket);
  });
});