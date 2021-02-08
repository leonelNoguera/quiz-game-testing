var game = require('./lib/game.js');
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var rounds = 10;
var puntuation = 10;
var maxUsers = 10;
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
    if ((message['password'] == 'Password123') && (admin == undefined))
    {
      admin = socket.id;
      message['password'] = undefined;
      message['rooms'] = game.rooms;
      message['questions'] = game.questions;
      socket.emit('adminLogged', message);
    }
    else
    {
      socket.emit('error', {});
    }
    //message['password'] = undefined;
    //socket.emit('adminLogged', message);
    console.log(socket.id);
  });
	socket.on('new message', (data) => {
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});
	});
	socket.on('update', (data) => {
    console.log(socket.id);
		//console.log('Line 35: ' + data);
		var message = JSON.parse(data);
		var private = false;
		var flagAddRoom = false;
		//if ((message['userName'].split('_').length < 1) || (message['userName'].split('_')[message['userName'].split('_').length - 1] == ''))
    if (
      (message['roomCode'] == '')
    )
		{//Código no especificado
      console.log('Line 41.');
			if (game.searchRoomCode('') != -1)
			{
				index = game.searchRoomCode('');
				message['roomCode'] = game.rooms[game.searchRoomCode('')]['roomCode'];
			}
			else
			{
				message['roomCode'] = game.generateRoomCode();
				flagAddRoom = true;
			}
			//game.extractUserName(message);
		}
		else
		{
			//message['roomCode'] = message['userName'].split('_')[message['userName'].split('_').length - 1];
			//game.extractUserName(message);
			if (message['roomCode'] != 'private')
			{
				if (game.searchRoomCode(message['roomCode']) != -1)
				{
					index = game.searchRoomCode(message['roomCode']);
				}
				else
				{//Pendiente hacer visible el error.
					message['type'] = 'error';
					message['error'] = 'Error: The code \'' + message['roomCode'] + '\' was not found.';
				}
			}
			else
			{
				message['roomCode'] = game.generateRoomCode();
				flagAddRoom = true;
				private = true;
			}
		}
		if (flagAddRoom)
		{
			//console.log('Añadiendo: ' + socket.id);
			game.rooms.push({
				'roomCode' : message['roomCode'], 
				'users' : [{'userName' : message['userName'], 'userSurname' : message['userSurname'], 'userType' : undefined, 'votes' : 0, 'vote' : false}], 
				'usersIds' : [socket.id], 
				'usersPoints' : [0], 
				'usersTurns' : [{'userName' : message['userName'], 'userSurname' : message['userSurname'], 'userType' : undefined, 'votes' : 0, 'vote' : false}], 
				'usersUsed' : [], 
				'private' : private, 
				'full' : false, 
				'selectedUser' : '', 
				'round' : [1, rounds], 
        'teams' : []
			});
      console.log(game.rooms[game.rooms.length - 1]['users']);
			message['usersInRoom'] = [...game.rooms[game.rooms.length - 1]['users']];
      message['requestTeamName'] = true;
		}
		else
		{
			if (index != undefined)
			{
        var flag = false;
        for (var i = 0; i < game.rooms[index]['users'].length; i++)
        {
          if ((game.rooms[index]['users'][i]['userName'] == message['userName']) && 
            (game.rooms[index]['users'][i]['userSurname'] == message['userSurname']))
          {
            message['type'] = 'error';
            message['error'] = 'Error: The player \'' + message['userName'] + '\' is in the game.';
            flag = true;
            i = game.rooms[index]['users'].length;
          }
        }
				if (!flag)
				{
					if ((message['userName'] != undefined) && (message['userName'] != '') && 
            (message['userSurname'] != undefined) && (message['userSurname'] != ''))
					{
						//game.rooms[index]['users'].push(message['userName']);//Esto se hace cuando hay más de un usuario.
            game.rooms[index]['users'].push({'userName' : message['userName'], 'userSurname' : message['userSurname'], 'userType' : message['userType'], 'votes' : message['votes'], 'vote' : message['vote']});
						if (game.rooms[index]['users'].length == maxUsers)
						{
							game.rooms[index]['full'] = true;
						}
            game.rooms[index]['usersIds'].push(socket.id);
						game.rooms[index]['usersPoints'].push(0);
						message['usersInRoom'] = [...game.rooms[index]['users']];
						if (game.rooms[index]['selectedUser'] == '')
						{//Esto se haría al principio.
							game.rooms[index]['usersUsed'] = [];
							game.rooms[index]['round'] = [1, rounds];
							game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
							if (game.rooms[index]['usersTurns'].length)
							{
								game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
								game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
								game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

								message['selectedUser'] = game.rooms[index]['selectedUser'];
								/*var aux = [];
								while (aux.length < 5)
								{
									var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
									if (aux.indexOf(w) == -1)
									{
										aux.push(w);
									}
								}
								message['words'] = aux;*/
								message['round'] = [...game.rooms[index]['round']];
							}
						}
					}
				}
        message['teams'] = game.rooms[index]['teams'];
			}
		}
    message['id'] = socket.id;
    console.log('Line 158.');
    socket.emit('update', message);
    socket.broadcast.emit('update', message);
	});
  socket.on('newTeamName', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    //index2 = game.searchUserInTeam(message['userName'], message['userSurname'], message['teamName'], index);
    index2 = game.searchTeam(message['teamName'], index);
    if (index2 == -1)
    {//Se debe agregar el team a la sala y al usuario.
      game.rooms[index]['teams'].push({
        'teamName' : message['teamName'], 
        'users' : [
          {
            'userName' : message['userName'], 
            'userSurname' : message['userSurname'], 
            'votes' : message['votes'], 
            'vote' : message['vote']
          }
        ]
      });
      var index3 = game.searchUserInRoom(message['userName'], message['userSurname'], index);
      if (index3 != -1)
      {
        game.rooms[index]['users'][index3]['team'] = message['teamName'];
        message['teamOk'] = true;
      }
    }
    socket.emit('newTeamName', message);
    socket.broadcast.emit('newTeamName', message);
  });
  socket.on('joinTeam', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    //index2 = game.searchUserInTeam(message['userName'], message['userSurname'], message['teamName'], index);
    index2 = game.searchTeam(message['teamName'], index);
    /*type: 'joinTeam',
      userName: userName, 
      userSurname: userSurname, 
      teamName: teams[index]['teamName'], 
      roomCode: roomCode*/
    if (index2 != -1)
    {//
      game.rooms[index]['teams'][index2]['users'].push({
        'userName' : message['userName'], 
        'userSurname' : message['userSurname'], 
        'votes' : message['votes'], 
        'vote' : message['vote']
      });
      message['teams'] = game.rooms[index]['teams'];
    }
    socket.emit('joinTeam', message);
    socket.broadcast.emit('joinTeam', message);
  });
  socket.on('voteLeader', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    index2 = game.searchTeam(message['teamName'], index);
    /*type: 'voteLeader',
    userNameVoted: userNameVoted, 
    userSurnameVoted: userSurnameVoted, 
    userNameVoting: userNameVoting, 
    userSurnameVoting: userSurnameVoting, 
    teamName: teams[teamIndex]['teamName'], 
    roomCode: roomCode*/
    if (index2 != -1)
    {//
      console.log('Line 239');
      //game.rooms[index]['teams'][index2]['votes'].push({'userName' : message['userName'], 'userSurname' : message['userSurname']});
      console.log(message['userNameVoting'], message['userSurnameVoting']);
      for (var i = 0; i < game.rooms[index]['teams'][index2]['users'].length; i++)
      {
        if ((game.rooms[index]['teams'][index2]['users'][i]['userName'] == message['userNameVoted']) && 
          (game.rooms[index]['teams'][index2]['users'][i]['userSurname'] == message['userSurnameVoted']))
        {
          game.rooms[index]['teams'][index2]['users'][i]['votes'] += 1;
        }
        if ((game.rooms[index]['teams'][index2]['users'][i]['userName'] == message['userNameVoting']) && 
          (game.rooms[index]['teams'][index2]['users'][i]['userSurname'] == message['userSurnameVoting']))
        {
          game.rooms[index]['teams'][index2]['users'][i]['vote'] = true;
          console.log(game.rooms[index]['teams'][index2]['users'][i]['userName'] + ' ' + game.rooms[index]['teams'][index2]['users'][i]['userSurname'] + ' ha votado.');
        }
      }
      var votationComplete = true;
      for (var i = 0; i < game.rooms[index]['teams'][index2]['users'].length; i++)
      {//Ver si ya votaron todos en el team.
        if (!game.rooms[index]['teams'][index2]['users'][i]['vote'])
        {
          votationComplete = false;
          i = game.rooms[index]['teams'][index2]['users'].length;
        }
      }
      if (votationComplete)
      {//Ver si hay algún ganador.
        var maxVotesIndex = 0;
        for (var i = 1; i < game.rooms[index]['teams'][index2]['users'].length; i++)
        {
          if (game.rooms[index]['teams'][index2]['users'][i]['votes'] > game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['votes'])
          {
            maxVotesIndex = i;
          }
        }
        for (var i = 0; i < game.rooms[index]['teams'][index2]['users'].length; i++)
        {
          if (game.rooms[index]['teams'][index2]['users'][i]['votes'] == game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['votes'])
          {
            maxVotesIndex = -1;
          }
        }
        if (maxVotesIndex != -1)
        {//Hay un ganador.
          game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['leader'] = true;
        }
        message['teams'] = game.rooms[index]['teams'];
        socket.emit('voteLeader', message);
        socket.broadcast.emit('voteLeader', message);
      }
    }
  });
  socket.on('rollDice', (data) => {
    var message = JSON.parse(data);
    socket.emit('rollDice', message);
    socket.broadcast.emit('rollDice', message);
  });
  socket.on('newUserNeedsInfo', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    message['selectedUser'] = game.rooms[index]['selectedUser'];
    message['roomCode'] = game.rooms[index]['roomCode'];
    message['round'] = [...game.rooms[index]['round']];
    message['full'] = game.rooms[index]['full'];
    message['type'] = 'returningGameInfo';
    socket.emit('returningGameInfo', message);
    socket.broadcast.emit('returningGameInfo', message);
  });
  socket.on('wordSelected', (data) => {//Pendiente ver si sirve para cuando se elije un lider.
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    game.rooms[index]['word'] = message['word'];
    game.rooms[index]['full'] = true;
    message['wordLength'] = message['word'].length;
    message['word'] = null;
    message['words'] = null;
    message['selectedUser'] = game.rooms[index]['selectedUser'];
    message['type'] = 'startDrawing';
    socket.emit('startDrawing', message);
    socket.broadcast.emit('startDrawing', message);
  });
  socket.on('drawing', (data) => {
    var message = JSON.parse(data);
    socket.emit('drawing', message);
    socket.broadcast.emit('drawing', message);
  });
  socket.on('guess', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    if ((game.rooms[index]['selectedUser'] != message['userName']) && (game.rooms[index]['word'] != undefined) && (game.rooms[index]['word'] != null))
    {
      if (game.rooms[index]['word'].toLowerCase() == message['guess'].toLowerCase())
      {
        for (var i = 0; i < game.rooms[index]['users'].length; i++)
        {
          if (game.rooms[index]['users'][i] == message['userName'])
          {
            game.rooms[index]['usersPoints'][i] += puntuation;
          }
        }
        message['puntuation'] = game.rooms[index]['usersPoints'];
        game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
        var aux = [];
        /*while (aux.length < 5)
        {
          var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
          if (aux.indexOf(w) == -1)
          {
            aux.push(w);
          }
        }*/
        if (game.rooms[index]['usersTurns'].length)
        {
          game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
          game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
          game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

          message['selectedUser'] = game.rooms[index]['selectedUser'];
          message['words'] = aux;
          message['word'] = game.rooms[index]['word'];
          message['full'] = game.rooms[index]['full'];
          message['type'] = 'nextTurn';
          message['round'] = [...game.rooms[index]['round']];
        }
        else
        {
          if (game.rooms[index]['round'][0] < game.rooms[index]['round'][1])
          {
            game.rooms[index]['round'][0] += 1;
            message['round'] = [...game.rooms[index]['round']];
            message['word'] = game.rooms[index]['word'];
            message['full'] = game.rooms[index]['full'];
            message['type'] = 'nextTurn';
            message['round'] = [...game.rooms[index]['round']];

            game.rooms[index]['usersUsed'] = [];
            game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
            if (game.rooms[index]['usersTurns'].length)
            {
              game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
              game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
              game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

              message['selectedUser'] = game.rooms[index]['selectedUser'];
              message['words'] = aux;
              message['round'] = [...game.rooms[index]['round']];
            }
          }
          else
          {
            message['word'] = game.rooms[index]['word'];
            var mayor = [0];
            for (var i = 1; i < game.rooms[index]['users'].length; i++)
            {
              if (game.rooms[index]['usersPoints'][i] > game.rooms[index]['usersPoints'][mayor[0]])
              {
                mayor = [i];
              }
              else
              {
                if (game.rooms[index]['usersPoints'][i] == game.rooms[index]['usersPoints'][mayor[0]])
                {
                  mayor.push(i);
                }
              }
            }
            var ganadores = [[game.rooms[index]['users'][mayor[0]], game.rooms[index]['usersPoints'][mayor[0]]]];
            for (var i = 1; i < mayor.length; i++)
            {
              ganadores.push([game.rooms[index]['users'][mayor[i]], game.rooms[index]['usersPoints'][mayor[i]]]);
            }
            message['puntuation'] = game.rooms[index]['usersPoints'];
            message['winners'] = [...ganadores];
            message['type'] = 'gameOver';
          }
        }
      }
      else
      {
        message['type'] = 'wrongWord';
      }
    }
    else
    {
      message['type'] = 'message';
    }
    socket.emit(message['type'], message);
    socket.broadcast.emit(message['type'], message);
  });
  socket.on('timeOut', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    message['timeOut'] = true;
    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
    var aux = [];
    /*while (aux.length < 5)
    {
      var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
      if (aux.indexOf(w) == -1)
      {
        aux.push(w);
      }
    }*/
    if (game.rooms[index]['usersTurns'].length)
    {
      game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
      game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
      game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
      message['selectedUser'] = game.rooms[index]['selectedUser'];
      message['words'] = aux;
      message['userName'] = '';
      message['word'] = game.rooms[index]['word'];
      message['full'] = game.rooms[index]['full'];
      message['type'] = 'nextTurn';
      message['round'] = [...game.rooms[index]['round']];
      message['puntuation'] = game.rooms[index]['usersPoints'];
    }
    else
    {
      if (game.rooms[index]['round'][0] < game.rooms[index]['round'][1])
      {
        game.rooms[index]['round'][0] += 1;
        message['round'] = [...game.rooms[index]['round']];
        message['userName'] = '';
        message['word'] = game.rooms[index]['word'];
        message['full'] = game.rooms[index]['full'];
        message['puntuation'] = game.rooms[index]['usersPoints'];
                message['type'] = 'nextTurn';
                message['round'] = [...game.rooms[index]['round']];

                game.rooms[index]['usersUsed'] = [];
        game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
        if (game.rooms[index]['usersTurns'].length)
                  {
                    game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
                    game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
                    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

                    message['selectedUser'] = game.rooms[index]['selectedUser'];
                    message['words'] = aux;
              message['round'] = [...game.rooms[index]['round']];
                  }
      }
      else
      {
        message['word'] = game.rooms[index]['word'];
        var mayor = [0];
        for (var i = 1; i < game.rooms[index]['users'].length; i++)
        {
          if (game.rooms[index]['usersPoints'][i] > game.rooms[index]['usersPoints'][mayor[0]])
          {
            mayor = [i];
          }
          else
          {
            if (game.rooms[index]['usersPoints'][i] == game.rooms[index]['usersPoints'][mayor[0]])
            {
              mayor.push(i);
            }
          }
        }
        var ganadores = [[game.rooms[index]['users'][mayor[0]], game.rooms[index]['usersPoints'][mayor[0]]]];
        for (var i = 1; i < mayor.length; i++)
        {
          ganadores.push([game.rooms[index]['users'][mayor[i]], game.rooms[index]['usersPoints'][mayor[i]]]);
        }
        message['puntuation'] = game.rooms[index]['usersPoints'];
        message['winners'] = [...ganadores];
        message['type'] = 'gameOver';
      }
    }
    socket.emit(message['type'], message);
    socket.broadcast.emit(message['type'], message);
  });
  socket.on('disconnect', () => {
    console.log(socket.id);
		userInfo = game.userDisconected(socket.id);
    var message = {
      'type' : 'userDisconected', 
      'roomCode' : userInfo[0], 
      'userName' : userInfo[1]['userName'], 
      'userSurname' : userInfo[1]['userSurname']
    }
    index = game.searchRoomCode(userInfo[0], false);
    if (index != -1)
    {
      if ((game.rooms[index]['selectedUser'] == undefined) || (game.rooms[index]['selectedUser'] == '') || (game.rooms[index]['selectedUser'] == userInfo[1]))
      {
        game.rooms[index]['selectedUser'] = '';
        game.rooms[index]['word'] = null;
        if (game.rooms[index]['usersTurns'].length)
            {
              if (game.rooms[index]['users'].length >= 2)
              {//Cuando se va el selectedUser pero quedan otros.
                game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
                message['selectedUser'] = game.rooms[index]['selectedUser'];
                game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
                var aux = [];
                /*while (aux.length < 5)
                {
                  var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
                  if (aux.indexOf(w) == -1)
                  {
                    aux.push(w);
                  }
                }*/
                message['words'] = aux;
                message['round'] = [...game.rooms[index]['round']];
                message['full'] = game.rooms[index]['full'];
                message['subType'] = 'reasignedSelectedUser';
              }
            }
            else
            {//No hay turnos disponibles.
              if (game.rooms[index]['users'].length > 1)
              {//Debería pasar a la siguiente ronda o terminar el juego.
                if (game.rooms[index]['round'][0] < game.rooms[index]['round'][1])
                {
                  game.rooms[index]['round'][0] += 1;
                  message['round'] = [...game.rooms[index]['round']];
                  message['word'] = game.rooms[index]['word'];
                  message['full'] = game.rooms[index]['full'];
                  message['subType'] = 'nextTurn';
                  message['round'] = [...game.rooms[index]['round']];
                  game.rooms[index]['usersUsed'] = [];
                  game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
                }
                else
                {
                  message['word'] = game.rooms[index]['word'];
                  message['subType'] = 'gameOver';
                }
              }
              else
              {//Volver al estado inicial.
                game.rooms[index]['round'] = [1, rounds];
              }
            }
      }
      else
      {
        if (!(game.rooms[index]['users'].length > 1))
        {
          if ((game.rooms[index]['word'] != undefined) && (game.rooms[index]['word'] != ''))
          {//El que queda gana por abandono si es que en algún momento se seleccionó una palabra.
            message['word'] = game.rooms[index]['word'];
            message['winners'] = [[game.rooms[index]['users'][0], game.rooms[index]['usersPoints'][0]]];
            message['subType'] = 'gameOver';
          }
          else
          {//Quedó sólamente el selectedUser.
            game.rooms[index]['selectedUser'] = '';
            game.rooms[index]['full'] = false;
          }
        }
      }
      game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
      message['full'] = game.rooms[index]['full'];
      //Si es la primer ronda, 19 users, full, word null, usersUsed == []
      if ((game.rooms[index]['round'][0] == 1) && game.rooms[index]['full'] && (game.rooms[index]['users'].length < maxUsers)
         && ((game.rooms[index]['word'] == null) || (game.rooms[index]['word'] == undefined))
         && (game.rooms[index]['usersUsed'].length <= 1)
      )
      {
        game.rooms[index]['full'] = false;
      }
      var index;
      for (var i = 0; i < game.rooms.length; i++)
      {
        if (message['roomCode'] == game.rooms[i]['roomCode'])
        {
          index = i;
        }
      }
      if ((index != undefined) && (!game.rooms[index]['usersIds'].length))
      {
        game.rooms[index]['full'] = true;
      }
    }
    socket.broadcast.emit('userDisconected', message);
	});
});