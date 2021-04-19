var game = require('./game.js');
var utils = require('./utils.js');
function userDisconnected(socket)
{//Pendiente ver si funciona al desconectarse mientras se está votando al líder.
  console.log('disconnections.js, line 4: game.usersIds == ');console.log(game.usersIds);console.log(socket.id);
  if (game.usersIds && (game.usersIds.indexOf(socket.id) != -1))
  {
    var data = {
      'userName' : game.users[game.usersIds.indexOf(socket.id)]['userName'], 
      'userSurname' : game.users[game.usersIds.indexOf(socket.id)]['userSurname']
    };console.log('Se desconectó: ' + data['userName'] + ' ' + data['userSurname']);
    
    var emitString = 'userDisconnected';
    
    var teamIndex = game.searchTeamByUser(data['userName'], data['userSurname']);
    if (teamIndex != -1)
    {
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
          game.teams[teamIndex]['users'][j]['vote'] = false;//Pendiente ver si es necesario.
          if (game.teams[teamIndex]['users'][j]['leader'])
          {
            game.teams[teamIndex]['users'][j]['leader'] = false;//Pendiente ver si funciona.
            game.teams[teamIndex]['newLeader'] = true;//Pendiente ver cuándo cambiarlo.
            for (var k = 0; k < game.teams[teamIndex]['users'].length; k++)
            {
              game.teams[teamIndex]['users'][k]['vote'] = false;
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
      {//Eliminar team cuando no quedan miembros conectados.
        var aux = [];
        for (var i = 0; i < game.teams.length; i++)
        {
          if (i != teamIndex)
          {
            aux.push(game.teams[i]);
          }
          else
          {
            var aux2 = [];
            for (var j = 0; j < game.teams[i]['users'].length; j++)
            {
              for (var k = 0; k < game.users.length; k++)
              {//Borrar los usuarios del team que se va a eliminar.
                if ((game.users[k]['userName'] == game.teams[i]['users'][j]['userName']) && 
                  (game.users[k]['userSurname'] == game.teams[i]['users'][j]['userSurname']))
                {
                  aux2.push(k);
                }
              }
            }//console.log('disconnections.js, line 76: aux2 == ');console.log(aux2);
            var aux3 = [];
            var aux4 = [];
            for (var j = 0; j < game.users.length; j++)
            {
              if (aux2.indexOf(j) == -1)
              {
                aux3.push(game.users[j]);
                aux4.push(game.usersIds[j]);
              }
            }//console.log('disconnections.js, line 86: aux3 == ');console.log(aux3);console.log('disconnections.js, line 86: aux4 == ');console.log(aux4);
            game.users = aux3;
            game.usersIds = aux4;
          }
        }
        //console.log(game.usersIds);console.log(socket.id);
        game.teams = [...aux];
      }
      else
      {
        if (data['users'].length == 1)
        {
          game.teams[teamIndex]['status'] = 'oneUser';
        }
        else
        {console.log('disconnections.js, line 90: game.teams[teamIndex][\'status\'] == ' + game.teams[teamIndex]['status']);
          if (!game.teams[teamIndex]['newLeader'])
          {console.log('disconnections.js, line 92: status (userIndex) == ' + game.teams[teamIndex]['users'][userIndex]['status']);
            if (game.teams[teamIndex]['users'][userIndex]['status'] == 'useTheWheel')
            {//Era su turno. Asignar el turno a otro.
              game.teams[teamIndex]['users'][userIndex]['status'] = 'seeTheWheel';
              var j = userIndex + 1;
              if (userIndex == (game.teams[teamIndex]['users'].length - 1))
              {
                j = 0;
              }
              for (; j < game.teams[teamIndex]['users'].length; j++)
              {
                if ((!game.teams[teamIndex]['users'][j]['usedTheWheel']) && (j != userIndex))
                {
                  game.teams[teamIndex]['users'][j]['status'] = 'useTheWheel';
                  data['userName'] = game.teams[teamIndex]['users'][j]['userName'];
                  data['userSurname'] = game.teams[teamIndex]['users'][j]['userSurname'];
                  game.teams[teamIndex]['status'] = 'wheel';
                  emitString = 'showSpinner';
                  j = game.teams[teamIndex]['users'].length;
                }
              }
            }
            if (game.teams[teamIndex]['status'] == 'answeringQuestionArea1')
            {
              var allUsersVoted = true;
              for (var k = 0; k < game.teams[teamIndex]['users'].length; k++)
              {console.log('disconnections.js, line 124: ' + game.teams[teamIndex]['users'][k]['voteForAnAnswer'] + ', ' + game.teams[teamIndex]['users'][k]['connected']);
                if ((!game.teams[teamIndex]['users'][k]['voteForAnAnswer']) && game.teams[teamIndex]['users'][k]['connected'])
                {
                  allUsersVoted = false;
                }
                if (game.teams[teamIndex]['users'][k]['leader'])
                {
                  data['leader'] = game.teams[teamIndex]['users'][k];
                }
              }
              if (allUsersVoted)
              {
                data['question'] = game.teams[teamIndex]['sendedQuestions']['area1'][game.teams[teamIndex]['sendedQuestions']['area1'].length - 1]['question'];
                for (var j = 0; j < game.questions['area1'].length; j++)
                {
                  if (game.questions['area1'][j]['question'] == data['question'])
                  {
                    data['question'] = game.questions['area1'][j];
                    j = game.questions['area1'].length;
                  }
                }
                emitString = 'leaderVotation';
              }
            }
            if (game.teams[teamIndex]['status'] == 'personalEvaluation')
            {
              var usersConnected = 0;
              for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
              {
                if (game.teams[teamIndex]['users'][j]['connected'])
                {
                  usersConnected += 1;
                }
              }
              var size = game.teams[teamIndex]['sendedQuestions']['area1'].length;
              console.log('Preguntas enviadas: ' + size + '/' + game.questions['area1'].length);
              console.log('Evaluaciones: ' + game.teams[teamIndex]['sendedQuestions']['area1'][size - 1]['evaluation'].length + '/' + usersConnected + ' usuarios.');
              if ((size == game.questions['area1'].length) && 
                  (game.teams[teamIndex]['sendedQuestions']['area1'][size - 1]['evaluation'].length == usersConnected))
              {
                game.teams[teamIndex]['status'] = 'finished';
                emitString = 'finishGame';
              }
              else
              {
                if (game.teams[teamIndex]['sendedQuestions']['area1'][size - 1]['evaluation'].length == usersConnected)
                {//Todos los usuarios evaluaron hasta la pregunta actual. Siguiente pregunta.
                  if (utils.allUsersInTeamUsedTheWheel(teamIndex))
                  {
                    for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
                    {
                      game.teams[teamIndex]['users'][j]['usedTheWheel'] = false;
                    }
                  }
                  for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
                  {
                    if (game.teams[teamIndex]['users'][j]['connected'] && (!game.teams[teamIndex]['users'][j]['usedTheWheel']))
                    {
                      for (var k = 0; k < game.teams[teamIndex]['users'].length; k++)
                      {
                        game.teams[teamIndex]['users'][k]['status'] = 'seeTheWheel';
                      }
                      game.teams[teamIndex]['status'] = 'wheel';
                      game.teams[teamIndex]['users'][j]['status'] = 'useTheWheel';
                      data['userName'] = game.teams[teamIndex]['users'][j]['userName'];
                      data['userSurname'] = game.teams[teamIndex]['users'][j]['userSurname'];
                      emitString = 'showSpinner';
                      j = game.teams[teamIndex]['users'].length;
                    }
                  }
                }
              }
            }
            if ((game.teams[teamIndex]['status'] == 'answeringQuestionArea2') || (game.teams[teamIndex]['status'] == 'area3') || (game.teams[teamIndex]['status'] == 'area3Card'))
            {
              if ((game.teams[teamIndex]['actualUserName'] == data['userName']) &&
                (game.teams[teamIndex]['actualUserSurname'] == data['userSurname']))
              {//Pendiente ver si es necesario pasar la pregunta a otro usuario.
                game.teams[teamIndex]['users'][userIndex]['status'] = 'seeTheWheel';
                var j = userIndex + 1;
                if (userIndex == (game.teams[teamIndex]['users'].length - 1))
                {
                  j = 0;
                }
                for (; j < game.teams[teamIndex]['users'].length; j++)
                {
                  if ((!game.teams[teamIndex]['users'][j]['usedTheWheel']) && (j != userIndex))
                  {
                    game.teams[teamIndex]['status'] = 'wheel';
                    game.teams[teamIndex]['users'][j]['status'] = 'wheel';
                    data['userName'] = game.teams[teamIndex]['users'][j]['userName'];
                    data['userSurname'] = game.teams[teamIndex]['users'][j]['userSurname'];
                    emitString = 'showSpinner';
                    j = game.teams[teamIndex]['users'].length;
                  }
                }
              }
            }
            if (game.teams[teamIndex]['status'] == 'area3Card')
            {
              //data['userName'] = game.teams[teamIndex]['users'][j]['userName'];
              //emitString = 'area3Card';
            }
          }
          else
          {//Se deconectó el líder. Es necesario elejir otro si es posible.
            for (var i = 0; i < game.teams[teamIndex]['users'].length; i++)
            {
              game.teams[teamIndex]['users'][i]['vote'] = false;//game.teams[teamIndex]['users'][i]['voteForAnAnswer'] = false;
              game.teams[teamIndex]['users'][i]['votesReceived'] = 0;
            }
          }
        }
        //data['teams'] = game.teams;console.log(game.teams);
        data['status'] = game.teams[teamIndex]['status'];
        data['newLeader'] = game.teams[teamIndex]['newLeader'];
        console.log(data);
        console.log(emitString);
        socket.emit(emitString, data);
        socket.broadcast.emit(emitString, data);
      }
    }
  }
}
module.exports.userDisconnected = userDisconnected;
/*Casos:

1 team
3 usuarios
login y desconexiones de todos los usuarios OK

1 team
3 usuarios
login sin elección
  se desconecta u3 OK
  se desconecta u2 OK
  se desconecta u1 OK

1 team
3 usuarios
login con elección completa
  se desconecta u3 OK
  se desconecta u2 OK

1 team
3 usuarios
login con elección completa
  se desconecta u1 OK

1 team
3 usuarios
login con elección completa
área 1 sin respuesta
  se desconecta u3 OK

1 team
3 usuarios
login con elección completa
área 1 con respuestas de u1 y u2
  se desconecta u3 OK

1 team
3 usuarios
login con elección completa
área 1 con evaluaciones de u1 y u2
  se desconecta u3 OK

1 team
3 usuarios
login con elección completa
cualquier área
área 2 sin responder
  se desconecta u2 OK

1 team
3 usuarios
login con elección completa
cualquier área
área 3 sin voltear la tarjeta
  se desconecta u2 OK

1 team
3 usuarios
login con elección completa
cualquier área
se desconectan todos menos uno OK

falta ver qué pasa si se desconecta el líder dutrante la última pregunta del área 1 (dado que automáticamente va a la rueda luego del nuevo líder).
*/