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
    admin.login(data, socket);
  });
  socket.on('editQuestionsArea1', (data) => {
    admin.editQuestionsArea1(data, socket);
  });
	socket.on('update', (data) => {
		login.update(data, socket);
	});
  socket.on('voteLeader', (data) => {
    voting.voteLeader(socket, data);
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
    area2.question(socket, data);
  });
  socket.on('showTeamInfo', (data) => {
    socket.emit('showTeamInfo', data);
    socket.broadcast.emit('showTeamInfo', data);
  });
  socket.on('disconnect', () => {//Pendiente reiniciar cuando se van todos los de un mismo equipo.
    disconnections.disconnect(socket);
	});
  socket.on('showSpinner', (data) => {
    wheel.showWheel(data, socket);
  });
});