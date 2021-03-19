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
			for (var j = 0; j < game.rooms[i]['users'].length; j++)
			{
				//if (j != aux)
        if (j == aux)
				{
          game.rooms[i]['users'][j]['connected'] = false;
					//auxUsers.push(game.rooms[i]['users'][j]);
					//auxUsersIds.push(game.rooms[i]['usersIds'][j]);
				}
			}
			//game.rooms[i]['users'] = [...auxUsers];
			//game.rooms[i]['usersIds'] = [...auxUsersIds];
		}
	}
	return r;
}
function disconnect(socket)
{
	var userInfo = userDisconected(socket.id);
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
      /*var aux = [];
      for (var j = 0; j < game.rooms[index]['users'].length; j++)
      {
        if (game.rooms[index]['users'][j] != null)
        {
          aux.push(game.rooms[index]['users'][j]);
        }
      }
      game.rooms[index]['users'] = [...aux];*/
      var index2 = game.searchTeamByUser(message['userName'], message['userSurname'], index);
      if (index2 != -1)
      {console.log('Line 563.');
        message['users'] = [];
        message['teamName'] = game.rooms[index]['teams'][index2]['teamName'];
        var oneUserConnected = false;
        for (var j = 0; j < game.rooms[index]['teams'][index2]['users'].length; j++)
        {
          if ((game.rooms[index]['teams'][index2]['users'][j]['userName'] == message['userName']) && 
            (game.rooms[index]['teams'][index2]['users'][j]['userSurname'] == message['userSurname']))
          {
            game.rooms[index]['teams'][index2]['full'] = false;
            game.rooms[index]['teams'][index2]['users'][j]['connected'] = false;
            game.rooms[index]['teams'][index2]['users'][j]['votes'] = 0;
            if (game.rooms[index]['teams'][index2]['users'][j]['leader'])
            {
              message['status'] = 'newLeader';
              for (var k = 0; k < game.rooms[index]['teams'][index2]['users'].length; k++)
              {
                game.rooms[index]['teams'][index2]['users'][k]['voteLeader'] = false;
              }
            }
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
          /*game.rooms[index]['teams'][index2]['sendedQuestions'] = {
            'area1' : [], 
            'area2' : [], 
            'area3' : []
          }; 
          game.rooms[index]['teams'][index2]['scoreArea1'] = 0;
          game.rooms[index]['teams'][index2]['scoreArea2'] = 0;
          game.rooms[index]['teams'][index2]['scoreArea3'] = 0;*/
          if (message['users'].length == 1)
          {
            message['status'] = 'oneUser';
            //game.rooms[index]['teams'][index2]['users'][0]['leader'] = false;
            //game.rooms[index]['teams'][index2]['users'][0]['rolledDice'] = false;
          }
          /*for (var j = 0; j < game.rooms[index]['teams'][index2]['users'].length; j++)
          {
            game.rooms[index]['teams'][index2]['users'][j]['votes'] = 0;
            game.rooms[index]['teams'][index2]['users'][j]['vote'] = false;
            game.rooms[index]['teams'][index2]['users'][j]['rolledDice'] = false;
          }*/
        }
      }
      message['rooms'] = game.rooms;
      console.log(message);
      socket.emit('userDisconnected', message);
      socket.broadcast.emit('userDisconnected', message);
    }
  }
}
module.exports.disconnect = disconnect;