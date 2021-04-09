var game = require('./game.js');
var utils = require('./utils.js');
function voteLeader(data, socket)
{
  var vote = false;
  var teamIndex = game.searchTeamByTeamName(data['teamName']);
  if (teamIndex != -1)
  {
    for (var i = 0; i < game.teams[teamIndex]['users'].length; i++)
    {
      if ((game.teams[teamIndex]['users'][i]['userName'] == data['userNameVoting']) && 
        (game.teams[teamIndex]['users'][i]['userSurname'] == data['userSurnameVoting']) && 
        (!game.teams[teamIndex]['users'][i]['vote']))
      {
        game.teams[teamIndex]['users'][i]['vote'] = true;
        vote = true;
        console.log(game.teams[teamIndex]['users'][i]['userName'] + ' ' + game.teams[teamIndex]['users'][i]['userSurname'] + ' ha votado.');
      }
    }
    if (vote)
    {
      for (var i = 0; i < game.teams[teamIndex]['users'].length; i++)
      {
        if ((game.teams[teamIndex]['users'][i]['userName'] == data['userNameVoted']) && 
          (game.teams[teamIndex]['users'][i]['userSurname'] == data['userSurnameVoted']))
        {
          game.teams[teamIndex]['users'][i]['votesReceived'] += 1;
          console.log(game.teams[teamIndex]['users'][i]['userName'] + ' ' + game.teams[teamIndex]['users'][i]['userSurname'] + ' tiene ' + game.teams[teamIndex]['users'][i]['votesReceived'] + ' votos.');
        }
      }
    }
    var votationComplete = true;
    for (var i = 0; i < game.teams[teamIndex]['users'].length; i++)
    {//Ver si ya votaron todos en el team.
      if ((game.teams[teamIndex]['users'][i]['connected']) && (!game.teams[teamIndex]['users'][i]['vote']))
      {
        votationComplete = false;
        i = game.teams[teamIndex]['users'].length;
      }
    }
    if (votationComplete)
    {//Ver si hay algún ganador.
      console.log('Todos votaron en el equipo: ' + game.teams[teamIndex]['teamName']);
      var maxVotesIndex = 0;
      for (var i = 1; i < game.teams[teamIndex]['users'].length; i++)
      {
        if (game.teams[teamIndex]['users'][i]['votesReceived'] > game.teams[teamIndex]['users'][maxVotesIndex]['votesReceived'])
        {
          maxVotesIndex = i;
        }
      }
      for (var i = 0; i < game.teams[teamIndex]['users'].length; i++)
      {
        if ((game.teams[teamIndex]['users'][i]['votesReceived'] == game.teams[teamIndex]['users'][maxVotesIndex]['votesReceived']) && (i != maxVotesIndex))
        {
          maxVotesIndex = -1;
          i = game.teams[teamIndex]['users'].length;
        }
      }
      if (maxVotesIndex != -1)
      {//Hay un ganador.
        console.log(game.teams[teamIndex]['users'][maxVotesIndex]['userName'] + ' ' + game.teams[teamIndex]['users'][maxVotesIndex]['userSurname'] + ' es el líder del equipo: ' + game.teams[teamIndex]['teamName']);
        game.teams[teamIndex]['users'][maxVotesIndex]['leader'] = true;
        var allUsersInTeams = true;
        var allUsersVoted = true;
        for (var i = 0; i < game.users.length; i++)
        {
          var found = false;
          for (var j = 0; j < game.teams.length; j++)
          {
              for (var k = 0; k < game.teams[j]['users'].length; k++)
              {
                  if (game.teams[j]['users'][k]['connected'] && (!game.teams[j]['users'][k]['vote']))
                  {
                    allUsersVoted = false;
                  }
                  if ((game.teams[j]['users'][k]['userName'] == game.users[i]['userName']) || 
                      (game.teams[j]['users'][k]['userSurname'] == game.users[i]['userSurname']))
                  {
                      found = true;
                  }
              }
          }
          if (!found)
          {
            allUsersInTeams = false;
          }
        }
        if (allUsersInTeams && allUsersVoted)
        {
          //Hay que lanzar el dado.
          //Pendiente ver si se puede optimizar. Buscar usedTheWheel.
          var teamsWithPreviousLeaderDisconnected = [];
          for (var i = 0; i < game.teams.length; i++)
          {
            for (var j = 0; j < game.teams[i]['users'].length; j++)
            {
              game.teams[i]['users'][j]['usedTheWheel'] = false;
              if ((game.teams[i]['users'][j]['status'] == 'answeringQuestionArea1') ||
                (game.teams[i]['users'][j]['status'] == 'answeringQuestionArea2') || 
                (game.teams[i]['status'] == 'leaderVotation'))//Pendiente ver si está bien.
              {//Esto es para evitar que se reinicie la pregunta actual luego de elejir a otro lider porque el anterior se desconectó.
                teamsWithPreviousLeaderDisconnected.push(i);
              }
            }
          }
          for (var i = 0; i < game.teams.length; i++)
          {
            for (var j = 0; j < game.teams[i]['users'].length; j++)
            {
              if (game.teams[i]['users'][j]['connected'] && (!game.teams[i]['users'][j]['usedTheWheel']))
              {//Pendiente evitar que se reinicien las preguntas luego de elejir a otro lider porque el anterior se desconectó.
                for (var k = 0; k < game.teams[i]['users'].length; k++)
                {
                  game.teams[teamIndex]['users'][k]['status'] = 'seeTheWheel';
                }//here
                game.teams[i]['users'][j]['status'] = 'useTheWheel';console.log('Wheel para ' + game.teams[i]['users'][j]['userName'] + ' ' + game.teams[i]['users'][j]['userSurname']);
                data['userName'] = game.teams[i]['users'][j]['userName'];
                data['userSurname'] = game.teams[i]['users'][j]['userSurname'];
                //data['users'] = game.users;
                if (data['status'] == 'starting')//Pendiente ver si está bien.
                {
                  socket.emit('showSpinner', data);
                  socket.broadcast.emit('showSpinner', data);
                }//Sino significa que se tiene que continuar con la pregunta pero con otro líder. Pendiente mostrar (leader).
                else
                {
                  socket.emit('continueNewLeader', data);
                  socket.broadcast.emit('continueNewLeader', data);
                }
                j = game.teams[i]['users'].length;
              }
            }
          }
        }
      }
      else
      {
        for (var j = 0; j < game.teams.length; j++)
        {//Se reinicia la votación. Puede ser necesario cuando se desconecta alguno durante la elección del lider.
          if (game.teams[j]['teamName'] == data['teamName'])
          {
            for (var k = 0; k < game.teams[j]['users'].length; k++)
            {//Pendiente revisar esto.
              game.teams[j]['users'][k]['vote'] = false;
              game.teams[j]['users'][k]['votesReceived'] = 0;
            }
            data['teams'] = game.teams;
            for (var k = 0; k < game.teams[j]['users'].length; k++)
            {
              data['userName'] = game.teams[j]['users'][k]['userName'];
              data['userSurname'] = game.teams[j]['users'][k]['userSurname'];
              socket.emit('update', data);//update a todos los usuarios del team.
              socket.broadcast.emit('update', data);
            }
          }
        }
      }
    }
  }
}
function allUsersVotation(socket, data)
{console.log('voting, line 166: data == ' + JSON.stringify(data));
  //game.teams[i]['sendedQuestions'].push(game.questions['area1'][j]['question']);
  for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {
      var allUsersVoted = true;
      for (var k = 0; k < game.teams[i]['users'].length; k++)
      {
        if ((game.teams[i]['users'][k]['userName'] == data['userName']) && 
            (game.teams[i]['users'][k]['userSurname'] == data['userSurname']))
        {
          game.teams[i]['users'][k]['voteForAnAnswer'] = true;console.log('voting, line 178: ' + game.teams[i]['users'][k]['userName'] + ' ' + game.teams[i]['users'][k]['userSurname'] + ' eligió una respuesta.');
        }
        if ((!game.teams[i]['users'][k]['voteForAnAnswer']) && game.teams[i]['users'][k]['connected'])
        {
          allUsersVoted = false;
        }
        if (game.teams[i]['users'][k]['leader'])
        {
          data['leader'] = game.teams[i]['users'][k];
        }
      }
      for (var j = 0; j < game.teams[i]['sendedQuestions']['area1'].length; j++)
      {
        if (game.teams[i]['sendedQuestions']['area1'][j]['question'] == data['question'])
        {//Se encontró la pregunta.
          var found = false;
          for (var k = 0; k < game.teams[i]['sendedQuestions']['area1'][j]['otherAnswers'].length; k++)
          {
            if (game.teams[i]['sendedQuestions']['area1'][j]['otherAnswers'][k]['answer'] == data['answer'])
            {//Alguien ya eligió esa repuesta préviamente
              game.teams[i]['sendedQuestions']['area1'][j]['otherAnswers'][k]['votesReceived'].push({userName: data['userName'], userSurname: data['userSurname']});
              found = true;
            }
          }
          if (!found)
          {//Nadie eligió esa repuesta préviamente.
            game.teams[i]['sendedQuestions']['area1'][j]['otherAnswers'].push({
              'answer' : data['answer'], 
              'votesReceived' : [{userName: data['userName'], userSurname: data['userSurname']}]
            });
          }
        }
      }
      if (allUsersVoted)
      {//Tiene que decidir el líder.
        for (var j = 0; j < game.questions['area1'].length; j++)
        {
          if (game.questions['area1'][j]['question'] == data['question'])
          {
            data['question'] = game.questions['area1'][j];
          }
        }
        socket.emit('leaderVotation', data);
        socket.broadcast.emit('leaderVotation', data);
      }
      else
      {//Para informar al admin sobre el estado de la votación.
        data['teams'] = game.teams;
        socket.emit('allUsersVotationAdmin', data);
        socket.broadcast.emit('allUsersVotationAdmin', data);
      }
    }
  }
}
function leaderVotation(data, socket)
{
  for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {
      for (var k = 0; k < game.teams[i]['users'].length; k++)
      {
        if ((game.teams[i]['users'][k]['userName'] == data['userName']) && 
            (game.teams[i]['users'][k]['userSurname'] == data['userSurname']))
        {
          game.teams[i]['users'][k]['voteForAnAnswer'] = true;
        }
      }
      if (data['answer'] != 'no mutual agreement')
      {
        for (var j = 0; j < game.questions['area1'].length; j++)
        {
          if (game.questions['area1'][j]['question'] == data['question'])
          {
            for (var k = 0; k < game.questions['area1'][j]['options'].length; k++)
            {
              if (game.questions['area1'][j]['options'][k]['option'] == data['answer'])
              {
                game.teams[i]['scoreArea1'] += game.questions['area1'][j]['options'][k]['score'];
                data['score'] = game.questions['area1'][j]['options'][k]['score'];
                data['finalAnswer'] = game.questions['area1'][j]['options'][k]['option'];
                k = game.questions['area1'][j]['options'].length;
              }
            }
            j = game.questions['area1'].length;
          }
        }
      }
      else
      {
        game.teams[i]['scoreArea1'] -= 600;
        data['finalAnswer'] = data['answer'];
        data['score'] = -600;
      }
      for (var j = 0; j < game.teams[i]['sendedQuestions']['area1'].length; j++)
      {
        if (game.teams[i]['sendedQuestions']['area1'][j]['question'] == data['question'])
        {//Pregunta actual encontrada en sendedQuestions.
          game.teams[i]['sendedQuestions']['area1'][j]['finalAnswer'] = data['answer'];
        }
      }
      //Mostrar explicación y score antes de la evaluación.
      for (var j = 0; j < game.questions['area1'].length; j++)
      {
        if (game.questions['area1'][j]['question'] == data['question'])
        {
          data['options'] = game.questions['area1'][j]['options'];
          data['topic'] = game.questions['area1'][j]['topic'];
          j = game.questions['area1'].length;
        }
      }
      data['bestAnswerScore'] = -1;
      for (var j = 0; j < game.questions['area1'].length; j++)
      {
        if (game.questions['area1'][j]['question'] == data['question'])
        {
          for (var k = 0; k < game.questions['area1'][j]['options'].length; k++)
          {
            if (game.questions['area1'][j]['options'][k]['score'] > data['bestAnswerScore'])
            {
              data['bestAnswerScore'] = game.questions['area1'][j]['options'][k]['score'];
            }
          }
          j = game.questions['area1'].length;
        }
      }
      data['scoreTotal'] = game.teams[i]['scoreArea1'];
      data['teamName'] = game.teams[i]['teamName'];
      socket.emit('detailedExplanationOfAnswers', data);
      socket.broadcast.emit('detailedExplanationOfAnswers', data);//Antes de la evaluación con input range 1-5.
    }
  }
}
function personalEvaluation(data, socket)
{
  for (var i = 0; i < game.teams.length; i++)
  {
    if (game.teams[i]['teamName'] == data['teamName'])
    {
      for (var j = 0; j < game.teams[i]['sendedQuestions']['area1'].length; j++)
      {
        if (game.teams[i]['sendedQuestions']['area1'][j]['question'] == data['question'])
        {
          game.teams[i]['sendedQuestions']['area1'][j]['evaluation'].push({
            'evaluation' : data['evaluation'], 
            'userName' : data['userName'], 
            'userSurname' : data['userSurname']
          });
        }
      }
      var usersConnected = 0;
      for (var j = 0; j < game.teams[i]['users'].length; j++)
      {
        if (game.teams[i]['users'][j]['connected'])
        {
          usersConnected += 1;
        }
      }
      var size = game.teams[i]['sendedQuestions']['area1'].length;
      console.log('Preguntas enviadas: ' + size + '/' + game.questions['area1'].length);
      console.log('Evaluaciones: ' + game.teams[i]['sendedQuestions']['area1'][size - 1]['evaluation'].length + '/' + usersConnected + ' usuarios.');
      if ((size == game.questions['area1'].length) && 
          (game.teams[i]['sendedQuestions']['area1'][size - 1]['evaluation'].length == usersConnected))
      {
        game.teams[i]['status'] = 'finished';
        socket.emit('finishGame', data);
        socket.broadcast.emit('finishGame', data);
      }
      else
      {
        if (game.teams[i]['sendedQuestions']['area1'][size - 1]['evaluation'].length == usersConnected)
        {//Todos los usuarios evaluaron hasta la pregunta actual. Siguiente pregunta.
          if (utils.allUsersInTeamUsedTheWheel(i))
          {
            for (var j = 0; j < game.teams[i]['users'].length; j++)
            {
              game.teams[i]['users'][j]['usedTheWheel'] = false;
            }
          }
          for (var j = 0; j < game.teams[i]['users'].length; j++)
          {
            if (game.teams[i]['users'][j]['connected'] && (!game.teams[i]['users'][j]['usedTheWheel']))
            {
              for (var k = 0; k < game.teams[i]['users'].length; k++)
              {
                game.teams[i]['users'][k]['status'] = 'seeTheWheel';
              }
              game.teams[i]['users'][j]['status'] = 'useTheWheel';
              data['userName'] = game.teams[i]['users'][j]['userName'];
              data['userSurname'] = game.teams[i]['users'][j]['userSurname'];
              socket.emit('showSpinner', data);
              socket.broadcast.emit('showSpinner', data);
              j = game.teams[i]['users'].length;
            }
          }
        }
      }
      socket.broadcast.emit('personalEvaluationAdmin', data);
    }
  }
}
module.exports.voteLeader = voteLeader;
module.exports.allUsersVotation = allUsersVotation;
module.exports.leaderVotation = leaderVotation;
module.exports.personalEvaluation = personalEvaluation;