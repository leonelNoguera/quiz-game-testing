var game = require('./lib/game.js');
var area2 = require('./lib/area2.js');
var login = require('./lib/login.js');
var voting = require('./lib/voting.js');
var wheel = require('./lib/wheel.js');
var disconnections = require('./lib/disconnections.js');
var admin = require('./lib/admin.js');
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
  socket.on('adminLogin', (data) => {
    admin.login(data, socket);//Pendiente ver por qué no funciona bien con 2 teams
  });
  socket.on('editQuestionsArea1', (data) => {
    admin.editQuestionsArea1(data, socket);
  });
	socket.on('userConnected', (data) => {
		login.userConnected(data, socket);
	});
  socket.on('voteLeader', (data) => {
    voting.voteLeader(data, socket);
  });
  socket.on('selectedArea', (data) => {
    wheel.selectedArea(data, socket);
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
    socket.broadcast.emit('area2Question', data);
  });
  socket.on('area3Card', (data) => {
    socket.broadcast.emit('area3Card', data);
  });
  socket.on('personalEvaluation', (data) => {
    voting.personalEvaluation(data, socket);
  });
  socket.on('questionArea2', (data) => {
    area2.question(data, socket);
  });
  socket.on('showTeamInfo', (data) => {
    socket.emit('showTeamInfo', data);
    socket.broadcast.emit('showTeamInfo', data);
  });
  socket.on('disconnect', () => {
    disconnections.userDisconnected(socket);
	});
  socket.on('showSpinner', (data) => {
    wheel.showWheel(data, socket);
  });
  socket.on('nextUserWheel', (data) => {//console.log(data);
    for (var i = 0; i < game.teams.length; i++)
    {
      if (game.teams[i]['teamName'] == data['teamName'])
      {
        var k;
        for (var j = 0; j < game.teams[i]['users'].length; j++)
        {
          if ((game.teams[i]['users'][j]['userName'] == data['userName']) && 
            (game.teams[i]['users'][j]['userSurname'] == data['userSurname']))
          {//console.log('User index: ' + j);
            k = j + 1;
            if (k == game.teams[i]['users'].length)
            {
              k = 0;
            }
            j = game.teams[i]['users'].length;
          }
        }//console.log('Next user index: ' + k);console.log('game.teams[i][\'users\'].length == ' + game.teams[i]['users'].length);
        for (; k < game.teams[i]['users'].length; k++)
        {//console.log('User ' + k + ' connected: ' + game.teams[i]['users'][k]['connected']);
          if (game.teams[i]['users'][k]['connected'])
          {
            data['userName'] = game.teams[i]['users'][k]['userName'];
            data['userSurname'] = game.teams[i]['users'][k]['userSurname'];
            k = game.teams[i]['users'].length;
            wheel.showWheel(data, socket);
          }
        }
        i = game.teams.length;
      }
    }
  });
});