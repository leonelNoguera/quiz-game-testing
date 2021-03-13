var socket = io();

var userName;
var userSurname;
var roomCode;
var connected = false;

var regex = /(&zwj;|&nbsp;)/g;
var teams = [];
var area;
var finished = false;
var vote = false;
//var answerType;
var question;
var options;
socket.on('update', (data) => {//message['newTeam']
    if ((data['userName'] != undefined) && (data['userSurname'] != undefined) && (document.getElementById('divGameFinished').style.display == 'none'))
    {//Pendiente modificar para ser más parecido a los otros y que muestre los equipos desde el principio como en otras ocasiones.
        if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
        {
            if (!connected)
            {
                document.getElementById('divLogin').style.display = 'block';
                document.getElementById('loginFields').style.display = 'none';
                roomCode = data['roomCode'];
                teams = getTeams(data['rooms']);
                teamName = data['teamName'];
                connected = true;
                document.getElementById('body').style.backgroundColor = "white";
                document.getElementById('body').style.backgroundImage = "url('./img/2.png')";
                //document.getElementById('lblPlease').innerHTML = '<br><br><br>';
            }
        }
        else
        {//data['newTeam']
            if (connected && (data['teamName'] == teamName))
            {//console.log('Ya estaba conectado y viene otro.');
                teams = getTeams(data['rooms']);
            }
        }
        for (var j = 0; j < teams.length; j++)
        {
            if ((teams[j]['teamName'] == data['teamName']) && (data['teamName'] == teamName))
            {
                var leader = false;
                for (var k = 0; k < teams[j]['users'].length; k++)
                {
                    if ((teams[j]['users'][k]['userName'] == userName) && 
                        (teams[j]['users'][k]['userSurname'] == userSurname) && 
                        (!teams[j]['users'][k]['vote']) && 
                        (!teams[j]['users'][k]['leader']))
                    {//Ver que no sea el lider.
                        vote = false;
                    }
                }
            }
        }
        if (((data['userName'] == userName) && (data['userSurname'] == userSurname)) || 
            ((teamName != undefined) && (data['teamName'] == teamName))
        )
        {
            showTeamInfo(data['newLeader']);
        }
        //console.log('Teams:');
        //console.log(teams);
    }
});
socket.on('showSpinner', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {console.log('Line 84.')
        document.getElementById('divLogin').style.display = 'none';
        pickedArea = undefined;
        document.getElementById('lblArea').innerHTML = '';
        //document.getElementById('statusInfo').innerHTML = data['status'];
        started = true;
        teams = getTeams(data['rooms']);
        //updateUsersInfo();
        document.getElementById('restartPopup').style.display = 'none';
        document.getElementById('body').style.backgroundColor = "#ac0034";
        document.getElementById('body').style.backgroundImage = "url('./img/3.2.png')";
        
        /*if ((data['userName'] == userName) && 
            (data['userSurname'] == userSurname))*/
        {
            document.getElementById('area3').style.display = 'none';
            document.getElementById('area2').style.display = 'none';
            document.getElementById('area1').style.display = 'none';
            document.getElementById('spinner').style.display = 'block';
        }
        if ((data['userName'] == userName) && 
            (data['userSurname'] == userSurname))
        {
            lockWheel = false;
        }
        else
        {
            lockWheel = true;
        }
        document.getElementById('teamInfo').style.display = 'none';
        showGameInfo();
    }
});
socket.on('startSpin', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        if ((data['userName'] != userName) || (data['userSurname'] != userSurname))
        {
            spin(data['randomSpin']);
        }
    }
});
socket.on('showArea1PartialResult', (data) => {//console.log(data);
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {//console.log('Line 115.');
        area = data['area'];
        teams = getTeams(data['rooms']);
        for (var i = 0; i < teams.length; i++)
        {
            if ((teams[i]['teamName'] == data['teamName']) && (data['teamName'] == teamName) && (data['area'] == 1))
            {//console.log('Line 121.');
                document.getElementById('area3').style.display = 'none';
                document.getElementById('area2').style.display = 'none';
                document.getElementById('area1').style.display = 'block';
                document.getElementById('area1QuestionsDiv').innerHTML = '';
                document.getElementById('area1AnswersDiv').innerHTML = '';
                
                //document.getElementById('area1VotingResultsLeftDiv').innerHTML = '<label id="question">' + data['question']['question'] + '</label>';
                //<hr style="width:50%;text-align:left;margin-left:0"> 
                /*game.rooms[index]['teams'][i]['sendedQuestions']['area' + message['area']][j]['otherAnswers'].push({
                    'answer' : message['answer'], 
                    'votes' : [{userName: message['userName'], userSurname: message['userSurname']}];
                });*/
                var maxVotes = data['otherAnswers'][0]['votes'].length;
                for (var k = 1; k < data['otherAnswers'].length; k++)
                {
                    if (data['otherAnswers'][k]['votes'].length > maxVotes)
                    {
                        maxVotes = data['otherAnswers'][k]['votes'].length;
                    }
                }
                html = '';
                for (var j = 0; j < data['question']['options'].length; j++)
                {
                    html += '<label class="lblOption" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label><br>';
                }
                document.getElementById('area1AnswersDiv').innerHTML = html;
                for (var j = 0; j < data['question']['options'].length; j++)
                {//50/100 = 0.5
                    for (var k = 0; k < data['otherAnswers'].length; k++)
                    {
                        if (data['otherAnswers'][k]['answer'] == data['question']['options'][j]['option'])
                        {
                            //var usersList = [];
                            /*here*/var html = '<span class="otherAnswers" style="display:none; left: ' + document.getElementById('lbl_question_option_' + j).offsetLeft + 'px; top: ' + document.getElementById('lbl_question_option_' + j).offsetBottom + 'px;">';
                            for (var l = 0; l < data['otherAnswers'][k]['votes'].length; l++)
                            {//[{userName: message['userName'], userSurname: message['userSurname']}]
                                html += data['otherAnswers'][k]['votes'][l]['userName'] + ' ' + data['otherAnswers'][k]['votes'][l]['userSurname'] + '<br>';
                            }
                            html += '</span>';
                            document.getElementById('area1AnswersDiv').innerHTML += html;
                            k = data['otherAnswers'].length;
                        }
                    }
                }
                //html += '<button onclick="submitAnswer(\'allUsersVotation\');">Submit answer</button>';
                //document.getElementById('nextButton').style.display = 'block';
            }
        }
    }
});
var nextStep;
var beforeStep;
socket.on('showResultArea2', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        for (var j = 0; j < teams.length; j++)
        {
            if ((teams[j]['teamName'] == data['teamName']) && (data['teamName'] == teamName))
            {
                document.getElementById('area2Table').style.display = 'none';
                //score = options[scoreIndex]['score'];
                score = options[data['scoreIndex']]['score'];
                var r = 'INCORRECT';
                //if (data['score'] > 0)
                if (score > 0)
                {
                    r = 'CORRECT';
                }
                if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
                {
                    //document.getElementById('area2Info').innerHTML = '<br><br>YOUR ANSWER IS ' + r + '!<br>YOUR SCORE:<br>' + data['score'];
                    document.getElementById('area2Info').innerHTML = '<br><br>YOUR ANSWER IS ' + r + '!<br>YOUR SCORE:<br><label class="lblScore">' + score + '</label>';
                    nextStep = 'showSpinner';
                    document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                    document.getElementById('nextBtnDivArea2').style.display = 'block';
                }
                else
                {
                    document.getElementById('area2Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' ANSWER IS ' + r + '!<br>YOUR SCORE:<br><label class="lblScore">' + data['score'] + '</label>';
                }
            }
        }
    }
});
var dataUserName;
var dataUserSurname;
socket.on('question', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        area = data['area'];
        teams = getTeams(data['rooms']);
        for (var j = 0; j < teams.length; j++)
        {
            if ((teams[j]['teamName'] == data['teamName']) && (data['teamName'] == teamName))
            {
                document.getElementById('spinner').style.display = 'none';
                document.getElementById('area' + data['area']).style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
                question = data['question']['question'];
                var leader = false;
                for (var k = 0; k < teams[j]['users'].length; k++)
                {
                    if ((teams[j]['users'][k]['userName'] == userName) && 
                        (teams[j]['users'][k]['userSurname'] == userSurname) && 
                        teams[j]['users'][k]['leader'])
                    {//Ver que no sea el lider (porque ese vota después).
                        leader = true;
                    }
                }
                //if ((data['area'] == 1) && (!leader))
                if (data['area'] == 1)
                {
                    document.getElementById('area3').style.display = 'none';
                    document.getElementById('area2').style.display = 'none';
                    document.getElementById('area1').style.display = 'block';
                    document.getElementById('personalEvaluation').innerHTML = '';
                    document.getElementById('area1Table').style.display = 'block';
                    document.getElementById('area1QuestionsDiv').innerHTML = '<label id="question">' + data['question']['question'] + '</label>';
                    var html = '';
                    options = data['question']['options'];
                    for (var j = 0; j < data['question']['options'].length; j++)
                    {
                        html += '<input type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea1\').style.display = \'block\';">';
                        html += '<label id="lbl_question_option_' + j + '" for=question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label><br>';
                    }
                    document.getElementById('area' + data['area'] + 'AnswersDiv').innerHTML = html;
                    //document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                    document.getElementById('nextBtnDivArea1').style.display = 'none';
                    document.getElementById('beforeBtnDivArea1').style.display = 'none';
                    //document.getElementById('lblArea').innerHTML = 'DILEMMAS';
                    document.getElementById('lblLightBoxArea1Header').innerHTML = 'READ THE DILEMMA & CHOOSE THE BEST ANSWER INDIVIDUALLY.';
                    nextStep = 'allUsersVotation';
                }
                if (data['area'] == 2)
                {
                    document.getElementById('area3').style.display = 'none';
                    document.getElementById('area1').style.display = 'none';
                    document.getElementById('area2').style.display = 'block';
                    options = data['question']['options'];
                    document.getElementById('area2Table').style.display = 'none';
                    document.getElementById('lblArea').innerHTML = 'KNOWLEDGE ABOUT US';
                    if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
                    {
                        document.getElementById('area2Info').innerHTML = '<br><br>NOW PLEASE CHOOSE THE RIGHT ANSWER';
                        dataUserName = data['userName'];
                        dataUserSurname = data['userSurname'];
                        nextStep = 'area2Question';
                        document.getElementById('nextBtnDivArea2').style.display = 'block';
                        document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                    }
                    else
                    {
                        document.getElementById('area2Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' WILL CHOOSE THE ANSWER';
                        document.getElementById('nextBtnDivArea2').style.display = 'none';
                    }
                }
            }
        }
    }
});
socket.on('area2Question', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (data['userName'] != userName) && (data['userSurname'] != userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('area2Info').innerHTML = data['userName'] + ' ' + data['userSurname'] + ' IS ANSWERING THE QUESTION :';
        document.getElementById('area2Table').style.display = 'flex';
        document.getElementById('area2QuestionsDiv').innerHTML = '<label id="question">' + data['question'] + '</label>';
        var html = '';
        for (var j = 0; j < data['options'].length; j++)
        {
            html += '<label id="lbl_question_option_' + j + '">' + data['options'][j]['option'] + '</label><br>';
        }
        document.getElementById('area2AnswersDiv').innerHTML = html;
    }
});
socket.on('area3Card', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (data['userName'] != userName) && (data['userSurname'] != userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('area3Info').innerHTML = document.getElementById('area3Info').innerHTML = '<br><br>' + data['text'] + '<br>' + 'SCORE: <label class="lblScore">' + data['score'] + '</label>';
    }
});
function showBeforeStep()
{
    switch (beforeStep)
    {
        case 'showFinalAnswer':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('personalEvaluation').innerHTML = `
                YOUR FINAL ANSWER WAS:<br>
                ` + finalAnswer + `<br><br>
                YOUR SCORE FOR THE ANSWER:<br>
                ` + '<label class="lblScore">' + score + '</label>' + `<br>`;//Pendiente la parte de los comentarios.
            nextStep = 'personalEvaluation';
            beforeStep = 'detailedExplanationOfAnswers';
        break;
        case 'detailedExplanationOfAnswers':
            document.getElementById('lblLightBoxArea1Header').innerHTML = 'DETAILED EXPLANATION OF ANSWERS';
            var html = '';
            for (var i = 0; i < options.length; i++)
            {
                //html += '<label class="lblOption" id="lbl_question_option_' + i + '">' + options[i]['option'] + '</label><br>' + options[i]['score'] + ' ' + options[i]['response'] + '<br>';
                html += '<label class="lblOption" id="lbl_question_option_' + i + '">' + options[i]['option'] + '<br>' + '<label class="lblScore">' + options[i]['score'] + '</label>' + ' ' + '<label class="lblResponse">' + options[i]['response'] + '</label>' + '<br></label>';
            }
            html += '<label class="topic">' + topic + '<br><br></label>';
            document.getElementById('personalEvaluation').innerHTML = html;
            document.getElementById('nextBtnDivArea1').style.display = 'block';
            document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';

            document.getElementById('beforeBtnDivArea1').style.display = 'none';
        
            nextStep = 'showFinalAnswer';
            //beforeStep = 'detailedExplanationOfAnswers';
        break;
    }
}
function showNextStep()
{
    var answer;
    var rads = document.getElementsByName('answer');
    for (var i = 0; i < rads.length; i++)
    {
        if (rads[i].checked)
        {
            //question = document.getElementById('question').innerHTML;
            //answer = document.getElementById('lbl_question_option_' + rads[i].id.split('_')[rads[i].id.split('_').length - 1]).innerHTML;
            answer = options[rads[i].id.split('_')[rads[i].id.split('_').length - 1]]['option'];
            i = rads.length;
        }
    }
    switch (nextStep)
    {
        case 'allUsersVotation'://Pendiente desactivar los input range (o cambiar por label).
            socket.emit('allUsersVotation', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area, 
                "roomCode" : roomCode
            }));
            //document.getElementById('nextBtnDivArea1').style.display = 'none';
            document.getElementById('nextBtnDivArea1').innerHTML = '';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
        break;
        case 'leaderVotation':
            socket.emit('leaderVotation', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area, 
                "roomCode" : roomCode
            }));
            document.getElementById('nextBtnDivArea1').style.display = 'none';
            document.getElementById('beforeBtnDivArea1').style.display = 'none';
        break;
        case 'personalEvaluation'://console.log('Line 297.');
            nextStep = 'sendPersonalEvaluation';
            document.getElementById('nextBtnDivArea1').style.display = 'block';
            
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('area1Table').style.display = 'none';
            document.getElementById('personalEvaluation').innerHTML = 'EVALUATION<br>HOW IS YOUR REALITY CLOSE TO THE BEST ANSWER WITH ' + bestAnswerScore + ' PONTS?<br><br>Distant <input type="range" id="personalEvaluationRange" min="0" max="4"> Firm';
            beforeStep = 'showFinalAnswer';
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            document.getElementById('beforeBtnDivArea1').style.display = 'block';
            showGameInfo();
            //Pendiente ver si mantener este mensaje para el del siguiente turno.
            /*socket.emit('personalEvaluation', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "area" : area, 
                "evaluation" : evaluation, 
                "roomCode" : roomCode
            }));*/
            //document.getElementById('area1').style.display = 'none';
        break;
        case 'sendPersonalEvaluation':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('area1Table').style.display = 'none';
            document.getElementById('nextBtnDivArea1').style.display = 'none';
            document.getElementById('beforeBtnDivArea1').style.display = 'none';
            var evaluation = parseInt(document.getElementById('personalEvaluationRange').value) + 1;
            document.getElementById('personalEvaluation').innerHTML = 'THANK FOR YOUR ENGAGEMENT<br>PLEASE TAKE TURNS IN SPINING A WHELL';
            //Pendiente ver si mantener este mensaje para el del siguiente turno.
            socket.emit('personalEvaluation', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "area" : area, 
                "evaluation" : evaluation, 
                "roomCode" : roomCode
            }));
            //document.getElementById('area1').style.display = 'none';
        break;
        case 'showFinalAnswer':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('personalEvaluation').innerHTML = `
                YOUR FINAL ANSWER WAS:<br>
                ` + finalAnswer + `<br><br>
                YOUR SCORE FOR THE ANSWER:<br>
                ` + '<label class="lblScore">' + score + '</label>' + `<br>`;//Pendiente la parte de los comentarios.
            nextStep = 'personalEvaluation';//console.log('Line 347.');
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            document.getElementById('beforeBtnDivArea1').style.display = 'block';
            beforeStep = 'detailedExplanationOfAnswers';
        break;
        case 'questionArea2':
            socket.emit('questionArea2', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area, 
                "roomCode" : roomCode, 
                "scoreIndex" : scoreIndex
            }));
            document.getElementById('nextBtnDivArea2').innerHTML = '';
        break;
        case 'showSpinner':
            socket.emit('showSpinner', JSON.stringify({
                "teamName" : teamName, 
                "roomCode" : roomCode
            }));
            try
            {
                document.getElementById('nextBtnDivArea1').style.display = 'none';
                document.getElementById('beforetBtnDivArea1').style.display = 'none';
                document.getElementById('nextBtnDivArea2').style.display = 'none';
                document.getElementById('nextBtnDivArea3').style.display = 'none';
            }catch{}
        break;
        case 'area2Question':
            socket.emit('area2Question', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "options" : options, 
                "roomCode" : roomCode
            }));
            document.getElementById('area2Table').style.display = 'flex';
            document.getElementById('area2QuestionsDiv').innerHTML = '<label id="question">' + question + '</label>';
            var html = '';
            for (var j = 0; j < options.length; j++)
            {
                html += '<input class="inputRadioOption" type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea2\').style.display = \'block\'; scoreIndex = ' + j + ';">';
                html += '<label id="lbl_question_option_' + j + '" for=question_option_' + j + '">' + options[j]['option'] + '</label><br>';
            }
            document.getElementById('area2AnswersDiv').innerHTML = html;
            nextStep = 'questionArea2';
            document.getElementById('nextBtnDivArea2').style.display = 'none';
        break;
        case 'area3Card':
            socket.emit('area3Card', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "text" : text, 
                "score" : score, 
                "roomCode" : roomCode
            }));
            //<div id="card"></div>
            //document.getElementById('cardContent').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + score;
            document.getElementById('area3Info').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
            nextStep = 'showSpinner';
            document.getElementById('nextBtnDivArea3').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
        break;
    }
}
var finalAnswer;
var score;
var scoreIndex;
var bestAnswerScore;
socket.on('detailedExplanationOfAnswers', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('lblLightBoxArea1Header').innerHTML = 'DETAILED EXPLANATION OF ANSWERS';
        document.getElementById('area1Table').style.display = 'none';
        
        nextStep = 'showFinalAnswer';
        finalAnswer = data['finalAnswer'];
        score = data['score'];
        bestAnswerScore = data['bestAnswerScore'];
        options = data['options'];
        topic = data['topic'];

        var html = '';
        for (var i = 0; i < data['options'].length; i++)
        {
            html += '<label class="lblOption" id="lbl_question_option_' + i + '">' + data['options'][i]['option'] + '<br>' + '<label class="lblScore">' + data['options'][i]['score'] + '</label>' + ' ' + '<label class="lblResponse">' + data['options'][i]['response'] + '</label>' + '<br><br></label>';
        }
        html += '<label class="topic">' + data['topic'] + '<br><br></label>';
        document.getElementById('personalEvaluation').innerHTML = html;
        document.getElementById('nextBtnDivArea1').style.display = 'block';
        document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
    }
});
socket.on('leaderVotation', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        var leader = false;
        var teamIndex = -1;
        for (var j = 0; j < teams.length; j++)
        {
            if (teams[j]['teamName'] == data['teamName'])
            {
                teamIndex = j;
                for (var k = 0; k < teams[j]['users'].length; k++)
                {
                    if ((teams[j]['users'][k]['userName'] == userName) && 
                        (teams[j]['users'][k]['userSurname'] == userSurname) && 
                        teams[j]['users'][k]['leader'])
                    {
                        leader = true;
                    }
                }
            }
        }//console.log('Line 252: ' + leader + ', ' + teamIndex + ', ' + data['teamName']);
        if ((teamIndex != -1) && (data['teamName'] == teamName))
        {
            document.getElementById('personalEvaluation').innerHTML = '';
            document.getElementById('area1Table').style.display = 'block';
            document.getElementById('area1').style.display = 'block';
            document.getElementById('area1').style.backgroundColor = "#ac0034";
            document.getElementById('lblLightBoxArea1Header').innerHTML = 'NOW DISCUSS THE BEST MOST APPROPIATE ANSWER WITH THE TEAM & LEADER WILL SUBMIT THE FINAL DECISSION.';
            document.getElementById('area1QuestionsDiv').innerHTML = '<label id="question">' + data['question']['question'] + '<br></label>';
            question = data['question']['question'];
            var html = '';
            for (var j = 0; j < data['question']['options'].length; j++)
            {
                if (leader)
                {
                    html += '<input class="inputRadioOption" type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea1\').style.display = \'block\';">';
                    html += '<label class="lblOption" id="lbl_question_option_' + j + '" for=question_option_' + j + '">' + data['question']['options'][j]['option'] + '<br></label>';
                }
                else
                {
                    html += '<label class="lblOption" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '<br></label>';
                }
            }
            if (leader)
            {
                html += '<input class="inputRadioOption" type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea1\').style.display = \'block\';">';
                html += '<label class="lblOption" id="lbl_question_option_' + j + '" for=question_option_' + j + '">no mutual agreement<br></label>';
                document.getElementById('nextBtnDivArea1').style.display = 'none';
                document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                document.getElementById('beforeBtnDivArea1').style.display = 'none';
                document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            }
            document.getElementById('area1AnswersDiv').innerHTML = html;
            nextStep = 'leaderVotation';
        }
    }
});
socket.on('personalEvaluation', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        if (data['teamName'] == teamName)
        {
            var html = 'Distant <input type="range" id="personalEvaluationRange" min="0" max="4"> Firm';
            //document.getElementById('submitPersonalEvaluation').style.display = 'block';
            nextStep = 'personalEvaluation';
            document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
            beforeStep = 'showFinalAnswer';
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            document.getElementById('personalEvaluation').style.display = 'block';
            document.getElementById('lblLightBoxArea1Header').innerHTML = 'EVALUATION<br>HOW IS YOUR REALITY CLOSE TO THE BEST ANSWER WITH ' + bestAnswerScore + ' POINTS';
            document.getElementById('area1Table').style.display = 'none';

            document.getElementById('personalEvaluation').innerHTML = html;
            showGameInfo();
        }
    }
});
var text;
socket.on('ro', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        //console.log(data);
        if (data['teamName'] == teamName)
        {//console.log(document.getElementById('spinner').style.display);
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('area3').style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
            document.getElementById('lblArea').innerHTML = 'RISKS & OPPORTUNITIES';
            area = data['area'];
            document.getElementById('area1').style.display = 'none';
            document.getElementById('area2').style.display = 'none';
            document.getElementById('area3').style.display = 'block';
            text = data['ro']['text'];
            score = data['ro']['score'];
            if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
            {
                document.getElementById('area3Info').innerHTML = '<br><br>NOW OPEN THE CARD<br>&<br>SEE THE RESULT';
                dataUserName = data['userName'];
                dataUserSurname = data['userSurname'];
                nextStep = 'area3Card';
                document.getElementById('nextBtnDivArea3').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                document.getElementById('nextBtnDivArea3').style.display = 'block';
            }
            else
            {
                document.getElementById('area3Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' WILL OPEN THE<br>CARD<br>&<br>SEE THE RESULT';
            }
            showGameInfo();
        }
    }
});
socket.on('finishGame', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        if (data['teamName'] == teamName)
        {
            document.getElementById('body').style.backgroundColor = "white";
            document.getElementById('body').style.backgroundImage = "url('./img/2.png')";
            teams = getTeams(data['rooms']);
            document.getElementById('teamInfo').style.display = 'none';
            document.getElementById('gameInfo').style.display = 'none';
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('area1').style.display = 'none';
            document.getElementById('area2').style.display = 'none';
            document.getElementById('area3').style.display = 'none';
            //document.getElementById('submitPersonalEvaluation').style.display = 'none';
            document.getElementById('divGameFinished').style.display = 'block';
            finished = true;
            gameFinished();
        }
    }
});
socket.on('showTeamInfo', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (data['userName'] != userName) && (data['userSurname'] != userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        pickedArea = undefined;
        document.getElementById('body').style.backgroundColor = "white";
        document.getElementById('body').style.backgroundImage = "url('./img/2.png')";
        document.getElementById('restartPopup').style.display = 'none';
        vote = false;
        showTeamInfo(true);
    }
});
socket.on('userDisconnected', (data) => {console.log(data);
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        data2 = data;
        document.getElementById('teamInfo').style.display = 'none';
        document.getElementById('gameInfo').style.display = 'none';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('area1').style.display = 'none';
        document.getElementById('area2').style.display = 'none';
        document.getElementById('area3').style.display = 'none';
        document.getElementById('restartPopup').style.display = 'block';
        document.getElementById('lblUserDisconnected').innerHTML = data['userName'] + ' ' + data['userSurname'] + ' disconnected.';
        document.getElementById('restartPopup').style.top = (document.documentElement.clientWidth * 0.3) + 'px';
        document.getElementById('restartPopup').style.left = (document.documentElement.clientHeight * 0.4) + 'px';
    }
});
function joinTeam(userName, userSurname, roomCode, index)
{
    socket.emit('joinTeam', JSON.stringify({
        type: 'joinTeam',
        userName: userName, 
        userSurname: userSurname, 
        teamName: teams[index]['teamName'], 
        roomCode: roomCode
    }));
}
function voteLeader(userNameVoting, userSurnameVoting, roomCode, teamIndex, userIndex, userNameVoted, userSurnameVoted, newLeader = false)
{console.log('newLeader == ' + newLeader);
    console.log('vl_' + teamIndex + '_' + userIndex);
    console.log(document.getElementById('vl_' + teamIndex + '_' + userIndex).innerHTML);
    if (document.getElementById('vl_' + teamIndex + '_' + userIndex).innerHTML.toLowerCase() != 'vote for leader')
    {
        for (var i = 0; i < teams[teamIndex]['users'].length; i++)
        {
            //console.log('vl_' + teamIndex + '_' + i);
            document.getElementById('vl_' + teamIndex + '_' + i).style.display = 'none';
        }
        //console.log(userNameVoting, userSurnameVoting, roomCode, teamIndex, userNameVoted, userSurnameVoted);
        vote = true;
        //Pendiente ver por qué el último que vota no recibe la información sobre quién es el líder.
        socket.emit('voteLeader', JSON.stringify({
            type: 'voteLeader',
            newLeader: newLeader,
            userNameVoted: userNameVoted, 
            userSurnameVoted: userSurnameVoted, 
            userNameVoting: userNameVoting, 
            userSurnameVoting: userSurnameVoting, 
            teamName: teams[teamIndex]['teamName'], 
            roomCode: roomCode
        }));
    }
    else
    {
        for (var i = 0; i < teams[teamIndex]['users'].length; i++)
        {
            document.getElementById('vl_' + teamIndex + '_' + i).style.display = 'block';
            document.getElementById('vl_' + teamIndex + '_' + i).innerHTML = 'VOTE FOR LEADER';
            if (i == userIndex)
            {
                document.getElementById('vl_' + teamIndex + '_' + i).innerHTML = 'CONFIRM';
            }
        }
    }
}
function login()
{
    if (!connected)
    {
        auxUserName = document.getElementById('nameInput').value;
        auxUserSurname = document.getElementById('surnameInput').value;
        if (auxUserName.length && auxUserSurname.length)
        {
            userName = $('#nameInput').val().replace(regex, ' ').trim();
            userSurname = $('#surnameInput').val().replace(regex, ' ').trim();
            var data = JSON.stringify({
                'type' : 'update', 
                'userName' : userName, 
                'userSurname' : userSurname, 
                'teamName' : document.getElementById('teamName').value
            });
            socket.emit('update', data);
        }
    }
}