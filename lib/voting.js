var game = require('./game.js');

function voteLeader(socket, data)
{
  var message = JSON.parse(data);
  index = game.searchRoomCode(message['roomCode'], false);
  index2 = game.searchTeam(message['teamName'], index);
  var vote = false;
  if (index2 != -1)
  {
    console.log(message['userNameVoting'], message['userSurnameVoting']);
    for (var i = 0; i < game.rooms[index]['teams'][index2]['users'].length; i++)
    {
      if ((game.rooms[index]['teams'][index2]['users'][i]['userName'] == message['userNameVoting']) && 
        (game.rooms[index]['teams'][index2]['users'][i]['userSurname'] == message['userSurnameVoting']) && 
        (!game.rooms[index]['teams'][index2]['users'][i]['vote']))
      {
        game.rooms[index]['teams'][index2]['users'][i]['vote'] = true;
        vote = true;
        console.log(game.rooms[index]['teams'][index2]['users'][i]['userName'] + ' ' + game.rooms[index]['teams'][index2]['users'][i]['userSurname'] + ' ha votado.');
      }
    }
    if (vote)
    {
      for (var i = 0; i < game.rooms[index]['teams'][index2]['users'].length; i++)
      {
        if ((game.rooms[index]['teams'][index2]['users'][i]['userName'] == message['userNameVoted']) && 
          (game.rooms[index]['teams'][index2]['users'][i]['userSurname'] == message['userSurnameVoted']))
        {
          game.rooms[index]['teams'][index2]['users'][i]['votes'] += 1;
          console.log(game.rooms[index]['teams'][index2]['users'][i]['userName'] + ' ' + game.rooms[index]['teams'][index2]['users'][i]['userSurname'] + ' tiene ' + game.rooms[index]['teams'][index2]['users'][i]['votes'] + ' votos.');
        }
      }
    }
    var votationComplete = true;
    for (var i = 0; i < game.rooms[index]['teams'][index2]['users'].length; i++)
    {//Ver si ya votaron todos en el team.
      if ((game.rooms[index]['teams'][index2]['users'][i]['connected']) && (!game.rooms[index]['teams'][index2]['users'][i]['vote']))
      {
        votationComplete = false;
        i = game.rooms[index]['teams'][index2]['users'].length;
      }
    }
    if (votationComplete)
    {//Ver si hay algún ganador.
      console.log('Todos votaron en el equipo: ' + game.rooms[index]['teams'][index2]['teamName']);
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
        if ((game.rooms[index]['teams'][index2]['users'][i]['votes'] == game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['votes']) && (i != maxVotesIndex))
        {
          maxVotesIndex = -1;
          i = game.rooms[index]['teams'][index2]['users'].length;
        }
      }
      if (maxVotesIndex != -1)
      {//Hay un ganador.
        console.log(game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['userName'] + ' ' + game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['userSurname'] + ' es el lider del equipo: ' + game.rooms[index]['teams'][index2]['teamName']);
        game.rooms[index]['teams'][index2]['users'][maxVotesIndex]['leader'] = true;
        //game.rooms[index]['teams'][index2]['full'] = true;//Pendiente ver que funcione.
        var allUsersInTeams = true;
        var allUsersVoted = true;
        for (var i = 0; i < game.rooms[index]['users'].length; i++)
        {
          var found = false;
          for (var j = 0; j < game.rooms[index]['teams'].length; j++)
          {
              for (var k = 0; k < game.rooms[index]['teams'][j]['users'].length; k++)
              {
                  if (!game.rooms[index]['teams'][j]['users'][k]['vote'])
                  {
                    allUsersVoted = false;
                  }
                  if ((game.rooms[index]['teams'][j]['users'][k]['userName'] == game.rooms[index]['users'][i]['userName']) || 
                      (game.rooms[index]['teams'][j]['users'][k]['userSurname'] == game.rooms[index]['users'][i]['userSurname']))
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
          //Pendiente ver si se puede optimizar. Buscar rolledDice.
          var teamsWithPreviousLeaderDisconnected = [];
          for (var i = 0; i < game.rooms[index]['teams'].length; i++)
          {
            for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
            {
              game.rooms[index]['teams'][i]['users'][j]['rolledDice'] = false;
              if ((game.rooms[index]['teams'][i]['users'][j]['status'] == 'answeringQuestionArea1') ||
                (game.rooms[index]['teams'][i]['users'][j]['status'] == 'answeringQuestionArea2') || 
                (game.rooms[index]['teams'][i]['status'] == 'leaderVotation'))//Pendiente ver si está bien.
              {//Esto es para evitar que se reinicie la pregunta actual luego de elejir a otro lider porque el anterior se desconectó.
                teamsWithPreviousLeaderDisconnected.push(i);
              }
            }
          }
          for (var i = 0; i < game.rooms[index]['teams'].length; i++)
          {
            for (var j = 0; j < game.rooms[index]['teams'][i]['users'].length; j++)
            {
              if (!game.rooms[index]['teams'][i]['users'][j]['rolledDice'])
              {//Pendiente evitar que se reinicien las preguntas luego de elejir a otro lider porque el anterior se desconectó.
                message['userName'] = game.rooms[index]['teams'][i]['users'][j]['userName'];
                message['userSurname'] = game.rooms[index]['teams'][i]['users'][j]['userSurname'];
                message['rooms'] = game.rooms;
                //message['status'] = 'Starting Game.';
                //if (teamsWithPreviousLeaderDisconnected.indexOf(i) == -1)
                //if (!message['newLeader'])
                if (message['status'] == 'starting')
                {console.log('Line 944.');
                  socket.emit('showSpinner', message);
                  socket.broadcast.emit('showSpinner', message);
                }//Sino significa que se tiene que continuar con la pregunta pero con otro líder. Pendiente mostrar (leader).
                else
                {
                  socket.emit('continueNewLeader', message);
                  socket.broadcast.emit('continueNewLeader', message);
                }
                j = game.rooms[index]['teams'][i]['users'].length;
              }
            }
          }
        }
      }
      else
      {
        for (var j = 0; j < game.rooms[index]['teams'].length; j++)
        {//Se reinicia la votación. Puede ser necesario cuando se desconecta alguno durante la elección del lider.
          if (game.rooms[index]['teams'][j]['teamName'] == message['teamName'])
          {
            for (var k = 0; k < game.rooms[index]['teams'][j]['users'].length; k++)
            {//Pendiente revisar esto.
              game.rooms[index]['teams'][j]['users'][k]['voteLeader'] = false;
              game.rooms[index]['teams'][j]['users'][k]['votes'] = 0;
            }
            message['rooms'] = game.rooms;
            for (var k = 0; k < game.rooms[index]['teams'][j]['users'].length; k++)
            {
              message['userName'] = game.rooms[index]['teams'][j]['users'][k]['userName'];
              message['userSurname'] = game.rooms[index]['teams'][j]['users'][k]['userSurname'];
              socket.emit('update', message);//update a todos los usuarios del team.
              socket.broadcast.emit('update', message);
            }
          }
        }
      }
    }
  }
}
function allUsersVotation(socket, data)
{
  var message = JSON.parse(data);
  console.log(message);
  var index = game.searchRoomCode(message['roomCode'], false);
  if (index != -1)
  {
    //game.rooms[index]['teams'][i]['sendedQuestions'].push(game.questions['area' + data['area']][j]['question']);
    for (var i = 0; i < game.rooms[index]['teams'].length; i++)
    {
      if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
      {
        var allUsersVoted = true;
        for (var k = 0; k < game.rooms[index]['teams'][i]['users'].length; k++)
        {
          if ((game.rooms[index]['teams'][i]['users'][k]['userName'] == message['userName']) && 
              (game.rooms[index]['teams'][i]['users'][k]['userSurname'] == message['userSurname']))
          {
            game.rooms[index]['teams'][i]['users'][k]['vote'] = true;
          }
          if (game.rooms[index]['teams'][i]['users'][k]['vote'])
          {
            console.log(game.rooms[index]['teams'][i]['users'][k]['userName'] + ' ' + game.rooms[index]['teams'][i]['users'][k]['userSurname'] + ' eligió una respuesta.');
          }
          //if ((!game.rooms[index]['teams'][i]['users'][k]['vote']) && (!game.rooms[index]['teams'][i]['users'][k]['leader']))
          if ((!game.rooms[index]['teams'][i]['users'][k]['vote']) && game.rooms[index]['teams'][i]['users'][k]['connected'])
          {
            allUsersVoted = false;
          }
        }
        /*"question" : question, 
        "answer" : answer, 
        "area" : area, */
        //var index2 = -1;
        //console.log('Pregunta: ' + message['question']);
        for (var j = 0; j < game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']].length; j++)
        {
          if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['question'] == message['question'])
          {//Se encontró la pregunta.
            //message['question']['options'] = game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['options'];//?
            //index2 = j;
            //if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'].length)
            //{//Esa pregunta tiene al menos respuesta registrada.
            var found = false;
            for (var k = 0; k < game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'].length; k++)
            {
              if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'][k]['answer'] == message['answer'])
              {//Alguien ya eligió esa repuesta préviamente
                //game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'][k]['votes'] += 1;
                game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'][k]['votes'].push({userName: message['userName'], userSurname: message['userSurname']});
                found = true;
              }
            }
            if (!found)
            {//Nadie eligió esa repuesta préviamente.
              //console.log('No estaba: ' + message['answer']);
              game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'].push({
                'answer' : message['answer'], 
                'votes' : [{userName: message['userName'], userSurname: message['userSurname']}]
              });
            }
            else
            {
              //console.log('Ya estaba: ' + message['answer']);
              /*game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'].push({
                'answer' : message['answer'], 
                'votes' : 1
              });*/
            }
          }
        }
        message['rooms'] = game.rooms;
        //message['area'] = data['area'];
        if (allUsersVoted)
        {//Tiene que decidir el líder.//Falta pasarle las opciones.
          //message['question'] = game.questions['area' + area][j];
          //console.log('Line 537: ' + message['question'] + ', ' + message['area']);
          for (var j = 0; j < game.questions['area' + message['area']].length; j++)
          {
            if (game.questions['area' + message['area']][j]['question'] == message['question'])
            {console.log('Line 541');
              message['question'] = game.questions['area' + message['area']][j];
            }
          }
          //Mostrar los resultados antes de eso.
          socket.emit('leaderVotation', message);
          socket.broadcast.emit('leaderVotation', message);
        }
        else
        {//Para informar al admin sobre el estado de la votación.
          socket.emit('allUsersVotationAdmin', message);
          socket.broadcast.emit('allUsersVotationAdmin', message);
        }
      }
    }
    //message['voteAnswerAllTeam'] = game.questions['area' + data['area']][j];
    //socket.emit('question', message);
    //socket.broadcast.emit('voteAnswerAllTeam', message);
  }
}
function leaderVotation(data, socket)
{
  var message = JSON.parse(data);
  var index = game.searchRoomCode(message['roomCode'], false);
  if (index != -1)
  {
    for (var i = 0; i < game.rooms[index]['teams'].length; i++)
    {
      if (game.rooms[index]['teams'][i]['teamName'] == message['teamName'])
      {
        for (var k = 0; k < game.rooms[index]['teams'][i]['users'].length; k++)
        {
          if ((game.rooms[index]['teams'][i]['users'][k]['userName'] == message['userName']) && 
              (game.rooms[index]['teams'][i]['users'][k]['userSurname'] == message['userSurname']))
          {
            game.rooms[index]['teams'][i]['users'][k]['vote'] = true;
          }
        }
        if (message['answer'] != 'no mutual agreement')
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
                  message['finalAnswer'] = game.questions['area' + message['area']][j]['options'][k]['option'];
                  k = game.questions['area' + message['area']][j]['options'].length;
                }
              }
              j = game.questions['area' + message['area']].length;
            }
          }
        }
        else
        {//-600 puntos
          game.rooms[index]['teams'][i]['scoreArea' + message['area']] -= 600;
          //game.rooms[index]['teams'][i]['scoreArea' + message['area']]
          message['finalAnswer'] = message['answer'];
          message['score'] = -600;
        }
        for (var j = 0; j < game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']].length; j++)
        {
          if (game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['question'] == message['question'])
          {//Pregunta actual encontrada en sendedQuestions.
            game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['finalAnswer'] = message['answer'];
          }
        }
        //Mostrar explicación y score antes de la evaluación.
        for (var j = 0; j < game.questions['area' + message['area']].length; j++)
        {
          if (game.questions['area' + message['area']][j]['question'] == message['question'])
          {
            message['options'] = game.questions['area' + message['area']][j]['options'];
            message['topic'] = game.questions['area' + message['area']][j]['topic'];
            j = game.questions['area' + message['area']].length;
          }
        }
        message['bestAnswerScore'] = -1;
        for (var j = 0; j < game.questions['area' + message['area']].length; j++)
        {
          if (game.questions['area' + message['area']][j]['question'] == message['question'])
          {
            for (var k = 0; k < game.questions['area' + message['area']][j]['options'].length; k++)
            {
              if (game.questions['area' + message['area']][j]['options'][k]['score'] > message['bestAnswerScore'])
              {
                message['bestAnswerScore'] = game.questions['area' + message['area']][j]['options'][k]['score'];
              }
            }
            j = game.questions['area' + message['area']].length;
          }
        }
        message['rooms'] = game.rooms;
        socket.emit('detailedExplanationOfAnswers', message);
        socket.broadcast.emit('detailedExplanationOfAnswers', message);
        //Sigue la evaluación con input range 1-5.
      }
    }
  }
}
module.exports.voteLeader = voteLeader;
module.exports.allUsersVotation = allUsersVotation;
module.exports.leaderVotation = leaderVotation;