var game = require('./game.js');
function userDisconected(id)
{
	var r = [null, null];
	var auxUsers = [];
	var auxUsersIds = [];
	var auxUsersPoints = [];
	var auxUsersTurns = [];
	var auxUsersUsed = [];
	for (var i = 0; i < game.rooms.length; i++)
	{
		var aux = game.rooms[i]['usersIds'].indexOf(id);
		if (aux != -1)
		{
			r = [game.rooms[i]['roomCode'], game.rooms[i]['users'][aux]];
		}
	}
	return r;
}
function disconnect(socket)
{//Pendiente ver si funciona al desconectarse mientras se está votando al líder.
	var userInfo = userDisconected(socket.id);console.log('disconnections.js: Line 34.');
  if ((userInfo[0] != null) && (userInfo[1] != null))
  {
    var message = {
      'roomCode' : userInfo[0], 
      'userName' : userInfo[1]['userName'], 
      'userSurname' : userInfo[1]['userSurname'], 
      'teamName' : undefined
    };console.log('Se desconectó: ' + message['userName'] + ' ' + message['userSurname']);
    index = game.searchRoomCode(userInfo[0], false);
    if (index != -1)
    {
      var emitString = 'userDisconnected';
      var index2 = game.searchTeamByUser(message['userName'], message['userSurname'], index);
      if (index2 != -1)
      {console.log('Line 563.');
        game.rooms[index]['teams'][index2]['status'] = 'starting';
        message['users'] = [];
        message['teamName'] = game.rooms[index]['teams'][index2]['teamName'];
        var oneUserConnected = false;
        var userIndex = -1;
        for (var j = 0; j < game.rooms[index]['teams'][index2]['users'].length; j++)
        {
          if ((game.rooms[index]['teams'][index2]['users'][j]['userName'] == message['userName']) && 
            (game.rooms[index]['teams'][index2]['users'][j]['userSurname'] == message['userSurname']))
          {
            userIndex = j;
            game.rooms[index]['teams'][index2]['full'] = false;
            game.rooms[index]['teams'][index2]['users'][j]['connected'] = false;
            game.rooms[index]['teams'][index2]['users'][j]['votes'] = 0;
            game.rooms[index]['teams'][index2]['users'][j]['vote'] = false;//Pendiente ver si es necesario.
            if (game.rooms[index]['teams'][index2]['users'][j]['leader'])
            {
              game.rooms[index]['teams'][index2]['users'][j]['leader'] = false;//Pendiente ver si funciona.
              game.rooms[index]['teams'][index2]['status'] = 'newLeader';
              for (var k = 0; k < game.rooms[index]['teams'][index2]['users'].length; k++)
              {
                game.rooms[index]['teams'][index2]['users'][k]['voteLeader'] = false;
              }
            }
            j = game.rooms[index]['teams'][index2]['users'].length;
          }
        }
        for (var j = 0; j < game.rooms[index]['teams'][index2]['users'].length; j++)
        {console.log(JSON.stringify(game.rooms[index]['teams'][index2]['users'][j]));
          if (game.rooms[index]['teams'][index2]['users'][j]['connected'])
          {
            message['users'].push(game.rooms[index]['teams'][index2]['users'][j]);
            oneUserConnected = true;
          }
        }
        //if (!game.rooms[index]['teams'][index2]['users'].length)
        if (!(message['users'].length))
        {//Eliminar team cuando no quedan miembros.
        	var aux = [];
        	for (var i = 0; i < game.rooms[index]['teams'].length; i++)
      		{
      			if (i != index2)
      			{
      				aux.push(game.rooms[index]['teams'][i]);
      			}
      		}
      		game.rooms[index]['teams'] = [...aux];
        }
        else
        {
          if (message['users'].length == 1)
          {
            game.rooms[index]['teams'][index2]['status'] = 'oneUser';
            //game.rooms[index]['teams'][index2]['users'][0]['leader'] = false;
            //game.rooms[index]['teams'][index2]['users'][0]['rolledDice'] = false;
          }
          else
          {console.log('disconnections.js, line 101: message[\'status\'] == ' + message['status']);
            if (message['status'] != 'newLeader')
            {console.log('disconnections.js, line 103: status (userIndex) == ' + game.rooms[index]['teams'][index2]['users'][userIndex]['status']);
              //if (game.rooms[index]['teams'][index2]['users'][userIndex]['status'] == 'onlyWheel')
              {//Se desconectó uno que no seguía en el turno.
                if (game.rooms[index]['teams'][index2]['users'][userIndex]['status'] == 'wheel')
                {//Era su turno. Asignar el turno a otro.
                  game.rooms[index]['teams'][index2]['users'][userIndex]['status'] = 'onlyWheel';
                  var j = userIndex + 1;
                  if (userIndex == (game.rooms[index]['teams'][index2]['users'].length - 1))
                  {
                    j = 0;
                  }
                  for (; j < game.rooms[index]['teams'][index2]['users'].length; j++)
                  {
                    if ((!game.rooms[index]['teams'][index2]['users'][j]['rolledDice']) && (j != userIndex))
                    {
                      //game.rooms[index]['teams'][index2]['status'] = 'wheel';
                      //game.rooms[index]['teams'][index2]['users'][j]['status'] = 'onlyWheel';
                      game.rooms[index]['teams'][index2]['users'][j]['status'] = 'wheel';
                      message['userName'] = game.rooms[index]['teams'][index2]['users'][j]['userName'];
                      message['userSurname'] = game.rooms[index]['teams'][index2]['users'][j]['userSurname'];
                      //message['rooms'] = game.rooms;
                      //socket.emit('showSpinner', message);
                      //socket.broadcast.emit('showSpinner', message);
                      emitString = 'showSpinner';
                      j = game.rooms[index]['teams'][index2]['users'].length;
                    }
                  }
                }
              }
              //else
              {
              }
              /*for (var j = 0; j < game.rooms[index]['teams'][index2]['users'].length; j++)
              {
                if (game.rooms[index]['teams'][index2]['users'][j]['status'] == 'onlyWheel')
                {
                  game.rooms[index]['teams'][index2]['users'][j]['status'] = '';
                }
              }*/
            }
            else
            {
              //
            }
          }
          message['rooms'] = game.rooms;console.log(game.rooms[index]['teams']);
          message['status'] = game.rooms[index]['teams'][index2]['status'];
          console.log(message);
          socket.emit(emitString, message);
          socket.broadcast.emit(emitString, message);
        }
      }
    }
  }
}
module.exports.disconnect = disconnect;