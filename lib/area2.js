var game = require('./game.js');
function question(socket, data)
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
        for (var j = 0; j < game.questions['area' + message['area']].length; j++)
        {//console.log(game.questions['area' + message['area']][j]['question'], message['question']);
          if (game.questions['area' + message['area']][j]['question'] == message['question'])
          {//console.log('Line 541.');
            for (var k = 0; k < game.questions['area' + message['area']][j]['options'].length; k++)
            {//console.log(game.questions['area' + message['area']][j]['options'][k]['option'], message['answer']);
              if (game.questions['area' + message['area']][j]['options'][k]['option'] == message['answer'])
              {//Pendiente ver por qué no llega a este punto.
                game.rooms[index]['teams'][i]['scoreArea' + message['area']] += game.questions['area' + message['area']][j]['options'][k]['score'];
                message['score'] = game.questions['area' + message['area']][j]['options'][k]['score'];
                k = game.questions['area' + message['area']][j]['options'].length;
              }
            }
            j = game.questions['area' + message['area']].length;
          }
        }
        message['rooms'] = game.rooms;
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
        }console.log('Score: ' + message['score'])
        socket.emit('showResultArea2', message);
        socket.broadcast.emit('showResultArea2', message);
      }
    }
  }
}
module.exports.question = question;