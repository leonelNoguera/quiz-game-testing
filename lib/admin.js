var game = require('./game.js');
var adminSocket;
function login(data, socket)
{
	if (data['password'] == 'Password123')
    {
		adminSocket = socket.id;
		data['password'] = undefined;
		data['teams'] = game.teams;
		data['questionsArea1'] = game.questions['area1'];
		socket.emit('adminLogged', data);
    }
}
function editQuestionsArea1(data, socket)
{
	if ((socket.id == adminSocket) && (data['password'] == 'Password123'))
	{//Pendiente tener un array auxiliar para las preguntas por si hay algunos jugando.
		if (game.teams.length)
		{
			var usersConnected = false;
			var sendedQuestions = false;
			var finished = false;
			for (var i = 0; i < game.teams.length; i++)
			{
				if (game.teams[i]['sendedQuestions']['area1'].length)
				{
					sendedQuestions = true;
				}
				if (game.teams[i]['status'] == 'finished')
				{//Pendiente ver el tema del status al reiniciar el juego.
					finished = true;
				}
				for (var j = 0; j < game.teams[i]['users'].length; j++)
				{
					if (game.teams[i]['users'][j]['connected'])
					{
						usersConnected = true;
					}
				}
			}
			if (usersConnected && sendedQuestions)
			{
				//
			}
			else
			{//Pendiente ver si llega a este punto con usersConnected alguna vez.
				game.questions['area1'] = data['questionsArea1'];
			}
		}
		else
		{
			game.questions['area1'] = data['questionsArea1'];
		}
	}
}
module.exports.login = login;
module.exports.editQuestionsArea1 = editQuestionsArea1;