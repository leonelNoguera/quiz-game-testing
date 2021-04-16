var game = require('./game.js');
var utils = require('./utils.js');
function question(data, socket)
{
  for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {
      for (var j = 0; j < game.questions['area2'].length; j++)
      {
        if (game.questions['area2'][j]['question'] == data['question'])
        {
          for (var k = 0; k < game.questions['area2'][j]['options'].length; k++)
          {
            if (game.questions['area2'][j]['options'][k]['option'] == data['answer'])
            {
              game.teams[i]['scoreArea2'] += game.questions['area2'][j]['options'][k]['score'];
              data['score'] = game.questions['area2'][j]['options'][k]['score'];
              data['scoreArea2'] = game.teams[i]['scoreArea2'];
              k = game.questions['area2'][j]['options'].length;
            }
          }
          j = game.questions['area2'].length;
        }
      }
      data['rooms'] = game.rooms;
      //Hay que girar la rueda. Reiniciar si giraron todos.
      if (utils.allUsersInTeamUsedTheWheel(i))
      {
        for (var j = 0; j < game.teams[i]['users'].length; j++)
        {
          game.teams[i]['users'][j]['usedTheWheel'] = false;
        }
      }console.log('Score: ' + data['score'])
      socket.emit('showResultArea2', data);
      socket.broadcast.emit('showResultArea2', data);
    }
  }
}
module.exports.question = question;