var game = require('./game.js');
function disconnect(socket)
{//Pendiente ver si funciona al desconectarse mientras se está votando al líder.
	if (game.usersIds.indexOf(socket.id) != -1)
  {
    var data = {
      'userName' : game.users[game.usersIds.indexOf(socket.id)]['userName'], 
      'userSurname' : game.users[game.usersIds.indexOf(socket.id)]['userSurname']
    };console.log('Se desconectó: ' + data['userName'] + ' ' + data['userSurname']);
    
    var emitString = 'userDisconnected';
    
    var teamIndex = game.searchTeamByUser(data['userName'], data['userSurname']);
    if (teamIndex != -1)
    {
      game.teams[teamIndex]['status'] = 'starting';
      data['users'] = [];
      data['teamName'] = game.teams[teamIndex]['teamName'];
      var oneUserConnected = false;
      var userIndex = -1;
      for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
      {
        if ((game.teams[teamIndex]['users'][j]['userName'] == data['userName']) && 
          (game.teams[teamIndex]['users'][j]['userSurname'] == data['userSurname']))
        {
          userIndex = j;
          game.teams[teamIndex]['users'][j]['connected'] = false;
          game.teams[teamIndex]['users'][j]['votesReceived'] = 0;
          game.teams[teamIndex]['users'][j]['voteForAnAnswer'] = false;//Pendiente ver si es necesario.
          if (game.teams[teamIndex]['users'][j]['leader'])
          {
            game.teams[teamIndex]['users'][j]['leader'] = false;//Pendiente ver si funciona.
            game.teams[teamIndex]['status'] = 'newLeader';
            for (var k = 0; k < game.teams[teamIndex]['users'].length; k++)
            {
              game.teams[teamIndex]['users'][k]['voteLeader'] = false;
            }
          }
          j = game.teams[teamIndex]['users'].length;
        }
      }
      for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
      {
        if (game.teams[teamIndex]['users'][j]['connected'])
        {
          data['users'].push(game.teams[teamIndex]['users'][j]);
          oneUserConnected = true;
        }
      }
      if (!(data['users'].length))
      {//Eliminar team cuando no quedan miembros conectados. Pendiente hacer que pueda funcionar en caso de que estén jugando varios equipos a la vez.
      	var aux = [];
      	for (var i = 0; i < game.teams.length; i++)
    		{
    			if (i != teamIndex)
    			{
    				aux.push(game.teams[i]);
    			}
    		}
    		game.teams = [...aux];
      }
      else
      {//Pendiente arreglar lo de abajo.
        if (data['users'].length == 1)
        {
          game.teams[teamIndex]['status'] = 'oneUser';
        }
        else
        {console.log('disconnections.js, line 69: data[\'status\'] == ' + data['status']);
          if (data['status'] != 'newLeader')
          {console.log('disconnections.js, line 71: status (userIndex) == ' + game.teams[teamIndex]['users'][userIndex]['status']);
            //if (game.teams[teamIndex]['users'][userIndex]['status'] == 'onlyWheel')
            {//Se desconectó uno que no seguía en el turno.
              if (game.teams[teamIndex]['users'][userIndex]['status'] == 'wheel')
              {//Era su turno. Asignar el turno a otro.
                game.teams[teamIndex]['users'][userIndex]['status'] = 'onlyWheel';
                var j = userIndex + 1;
                if (userIndex == (game.teams[teamIndex]['users'].length - 1))
                {
                  j = 0;
                }
                for (; j < game.teams[teamIndex]['users'].length; j++)
                {
                  if ((!game.teams[teamIndex]['users'][j]['rolledDice']) && (j != userIndex))
                  {
                    //game.teams[teamIndex]['status'] = 'wheel';
                    //game.teams[teamIndex]['users'][j]['status'] = 'onlyWheel';
                    game.teams[teamIndex]['users'][j]['status'] = 'wheel';
                    data['userName'] = game.teams[teamIndex]['users'][j]['userName'];
                    data['userSurname'] = game.teams[teamIndex]['users'][j]['userSurname'];
                    //data['rooms'] = game.rooms;
                    //socket.emit('showSpinner', data);
                    //socket.broadcast.emit('showSpinner', data);
                    emitString = 'showSpinner';
                    j = game.teams[teamIndex]['users'].length;
                  }
                }
              }
            }
            //else
            {
            }
            /*for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
            {
              if (game.teams[teamIndex]['users'][j]['status'] == 'onlyWheel')
              {
                game.teams[teamIndex]['users'][j]['status'] = '';
              }
            }*/
          }
          else
          {
            //
          }
        }
        data['rooms'] = game.rooms;console.log(game.teams);
        data['status'] = game.teams[teamIndex]['status'];
        console.log(data);
        socket.emit(emitString, data);
        socket.broadcast.emit(emitString, data);
      }
    }
  }
}
module.exports.disconnect = disconnect;