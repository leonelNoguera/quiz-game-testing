var socket = io();

var userName;
var userSurname;
var roomCode;
var connected = false;

var regex = /(&zwj;|&nbsp;)/g;
var teams = [];
var users = [];
var area;
var finished = false;
var vote = false;
//var answerType;
var question;
var options;
var scoreArea1 = 0;
var scoreArea2 = 0;
var scoreArea3 = 0;
socket.on('update', (data) => {console.log(data);
    if ((data['userName'] != undefined) && (data['userSurname'] != undefined) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
        {
            if (!connected)
            {
                document.getElementById('divLogin').style.display = 'block';
                document.getElementById('loginFields').style.display = 'none';
                roomCode = data['roomCode'];
                //teams = getTeams(data['rooms']);
                users = data['users'];
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
                //teams = getTeams(data['rooms']);
                users = data['users'];
            }
        }
        //for (var j = 0; j < teams.length; j++)
        {
            //if ((teams[j]['teamName'] == data['teamName']) && (data['teamName'] == teamName))
            {
                //var leader = false;
                //for (var k = 0; k < teams[j]['users'].length; k++)
                for (var k = 0; k < users.length; k++)
                {
                    if ((users[k]['userName'] == userName) && 
                        (users[k]['userSurname'] == userSurname) && 
                        (!users[k]['vote']) && 
                        (!users[k]['leader']))
                    {//Ver que no sea el lider.
                        vote = false;
                    }
                }
            }
        }
        if (((data['userName'] == userName) && (data['userSurname'] == userSurname)) || 
            ((teamName != undefined) && (data['teamName'] == teamName))
        )
        {console.log(started);
            /*scoreArea1 = data['scoreArea1'];
            scoreArea2 = data['scoreArea2'];
            scoreArea3 = data['scoreArea3'];*/
            if (!started)
            {
                showTeamInfo(data['newLeader']);
            }
            else
            {
                showTeamInfo(data['newLeader'], 'teamInfo2');
            }
        }
        //console.log('Teams:');
        //console.log(teams);
    }
});
socket.on('continueNewLeader', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        $("#area1").prop('disabled', false);
        $("#area2").prop('disabled', false);
        $("#area3").prop('disabled', false);
        document.getElementById('teamInfo2').style.display = 'none';
    }
});
var started = false;
socket.on('showSpinner', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('lblWheelInfo').innerHTML = '<br>' + data['userName'] + ' ' + data['userSurname'] + ' spins the wheel';
        pickedArea = undefined;
        if ((data['userName'] == userName) && 
            (data['userSurname'] == userSurname))
        {
            lockWheel = false;
        }
        else
        {
            if ((data['status'] == undefined) || (data['status'] != 'onlyWheel'))
            {
                lockWheel = true;
            }
        }
        document.getElementById('divLogin').style.display = 'none';
        document.getElementById('lblArea').innerHTML = '';
        //document.getElementById('statusInfo').innerHTML = data['status'];
        started = true;
        teams = getTeams(data['rooms']);
        //updateUsersInfo();
        document.getElementById('restartPopup').style.display = 'none';
        document.getElementById('body').style.backgroundColor = "#eee";
        document.getElementById('body').style.backgroundImage = "url('./img/3.2.png')";
        
        document.getElementById('area3').style.display = 'none';
        document.getElementById('area2').style.display = 'none';
        document.getElementById('area1').style.display = 'none';
        document.getElementById('spinner').style.display = 'block';

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
    {
        area = data['area'];
        teams = getTeams(data['rooms']);
        for (var i = 0; i < teams.length; i++)
        {
            if ((teams[i]['teamName'] == data['teamName']) && (data['teamName'] == teamName) && (data['area'] == 1))
            {
                document.getElementById('area3').style.display = 'none';
                document.getElementById('area2').style.display = 'none';
                document.getElementById('area1').style.display = 'block';
                document.getElementById('area1QuestionColumn').innerHTML = '';
                document.getElementById('area1AnswersColumn').innerHTML = '';
                var html = '';
                for (var j = 0; j < data['question']['options'].length; j++)
                {
                    //html += '<label class="lblOption" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label><br>';
                    html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '<br></div><br>';
                }
                document.getElementById('area1AnswersColumn').innerHTML = html;
                for (var j = 0; j < data['question']['options'].length; j++)
                {
                    for (var k = 0; k < data['otherAnswers'].length; k++)
                    {
                        if (data['otherAnswers'][k]['answer'] == data['question']['options'][j]['option'])
                        {
                            //var usersList = [];//Pendiente revisar esta parte.
                            var html = '<span class="otherAnswers" style="display:none; left: ' + document.getElementById('lbl_question_option_' + j).offsetLeft + 'px; top: ' + document.getElementById('lbl_question_option_' + j).offsetBottom + 'px;">';
                            for (var l = 0; l < data['otherAnswers'][k]['votes'].length; l++)
                            {
                                html += data['otherAnswers'][k]['votes'][l]['userName'] + ' ' + data['otherAnswers'][k]['votes'][l]['userSurname'] + '<br>';
                            }
                            html += '</span>';
                            document.getElementById('area1AnswersColumn').innerHTML += html;
                            k = data['otherAnswers'].length;
                        }
                    }
                }
            }
        }
    }
});
var nextStep;
var beforeStep;
socket.on('showResultArea2', (data) => {console.log(data);
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        for (var j = 0; j < teams.length; j++)
        {
            if ((teams[j]['teamName'] == data['teamName']) && (data['teamName'] == teamName))
            {
                document.getElementById('area2Table').style.display = 'none';
                //score = options[scoreIndex]['score'];
                //score = options[data['scoreIndex']]['score'];
                score = data['score'];
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
                    //document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                    document.getElementById('nextBtnDivArea2').style.display = 'block';
                }
                else
                {
                    document.getElementById('area2Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' ANSWER IS ' + r + '!<br>YOUR SCORE:<br><label class="lblScore">' + data['score'] + '</label>';
                }
                scoreArea2 += score;
                showGameInfo();
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
                document.getElementById('lblWheelInfo').innerHTML = '';
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
                answer = '';
                if (data['area'] == 1)
                {
                    document.getElementById('area3').style.display = 'none';
                    document.getElementById('area2').style.display = 'none';
                    document.getElementById('area1').style.display = 'block';
                    document.getElementById('personalEvaluation').innerHTML = '';
                    document.getElementById('area1Table').style.display = 'flex';
                    document.getElementById('area1QuestionColumn').innerHTML = '<label id="question">' + data['question']['question'] + '</label>';
                    var html = '';
                    options = data['question']['options'];
                    for (var j = 0; j < data['question']['options'].length; j++)
                    {
                        //html += '<tr>';
                        //html += '<td><input type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea1\').style.display = \'block\';"></td>';
                        //html += '<td><label onclick="optionSelected(1, ' + j + ');" id="lbl_question_option_' + j + '" for=question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label></td>';
                        html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(1, ' + j + ');">' + data['question']['options'][j]['option'] + '<br></div><br>';
                        //html += '</tr><tr></tr>';
                    }
                    document.getElementById('area1AnswersColumn').innerHTML = html;
                    //document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                    document.getElementById('nextBtnDivArea1').style.display = 'none';
                    document.getElementById('beforeBtnDivArea1').style.display = 'none';
                    document.getElementById('lblArea').innerHTML = 'DILEMMAS';
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
                        document.getElementById('nextBtnDivArea2').style.display = 'block';
                        //document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                        //alert();
                        document.getElementById('area2Info').innerHTML = '<br><br>NOW PLEASE CHOOSE THE RIGHT ANSWER';
                        dataUserName = data['userName'];
                        dataUserSurname = data['userSurname'];
                        nextStep = 'area2Question';
                    }
                    else
                    {
                        document.getElementById('nextBtnDivArea2').style.display = 'none';
                        document.getElementById('area2Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' WILL CHOOSE THE ANSWER';
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
            //html += '<label id="lbl_question_option_' + j + '">' + data['options'][j]['option'] + '</label><br><br>';
            html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '">' + data['options'][j]['option'] + '<br></div><br>';
        }
        document.getElementById('area2AnswersDiv').innerHTML = html;
    }
});
socket.on('area3Card', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (data['userName'] != userName) && (data['userSurname'] != userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
    {console.log(data['userName'] + ' ' + data['userSurname']);
        userPlay = true;
        flip('back', false);
        userPlay = false;
        document.getElementById('nextBtnDivArea3').style.display = 'none';
        document.getElementById('backContent').innerHTML = '<br><br>' + data['text'] + '<br>' + 'SCORE: <label class="lblScore">' + data['score'] + '</label>';
        scoreArea3 += score;
        showGameInfo();
        //document.getElementById('back').innerHTML = '<br><br>' + data['text'] + '<br>' + 'SCORE: <label class="lblScore">' + data['score'] + '</label>';
        /*document.getElementById('back').innerHTML += '<div id="nextBtnDivArea3" style="padding-left: 90%; padding-bottom: 1%;"><i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i></div>';
        document.getElementById('nextBtnDivArea3').style.display = 'none';*/
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
                ` + '<label class="lblScore">' + score + '</label>' + `<br>`;
            nextStep = 'personalEvaluation';
            beforeStep = 'detailedExplanationOfAnswers';
            scoreArea1 = scoreTotal;
            showGameInfo();
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
var answer;
function showNextStep()
{
    /*var rads = document.getElementsByName('answer');
    for (var i = 0; i < rads.length; i++)
    {//El rads tiene más length que lo que tiene el área 2 (3).
        if (rads[i].checked)
        {
            var index = parseInt(rads[i].id.split('_')[rads[i].id.split('_').length - 1]);
            if (index != options.length)//no mutual ...
            {
                answer = options[index]['option'];//Error (es área 2 en pantalla pero lo toma como área 1): 
            }
            else
            {
                answer = 'no mutual agreement';
            }
            i = rads.length;
        }
    }*/
    switch (nextStep)
    {
        case 'allUsersVotation':
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
            document.getElementById('area1LabelsTable').style.display = 'none';
            document.getElementById('personalEvaluation').innerHTML = 'EVALUATION<br>HOW IS YOUR REALITY CLOSE TO THE BEST ANSWER WITH ' + bestAnswerScore + ' PONTS?<br><br>Distant <input type="range" id="personalEvaluationRange" min="0" max="4"> Firm';
            beforeStep = 'showFinalAnswer';
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            document.getElementById('beforeBtnDivArea1').style.display = 'block';
            showGameInfo();
        break;
        case 'sendPersonalEvaluation':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('area1Table').style.display = 'none';
            document.getElementById('area1LabelsTable').style.display = 'none';
            document.getElementById('nextBtnDivArea1').style.display = 'none';
            document.getElementById('beforeBtnDivArea1').style.display = 'none';
            var evaluation = parseInt(document.getElementById('personalEvaluationRange').value) + 1;
            document.getElementById('personalEvaluation').innerHTML = 'THANK FOR YOUR ENGAGEMENT<br>PLEASE TAKE TURNS IN SPINING A WHELL';
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
                ` + '<label class="lblScore">' + score + '</label>' + `<br>`;
            nextStep = 'personalEvaluation';//console.log('Line 347.');
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            document.getElementById('beforeBtnDivArea1').style.display = 'block';
            beforeStep = 'detailedExplanationOfAnswers';
            scoreArea1 = scoreTotal;
            showGameInfo();
        break;
        case 'questionArea2':
            socket.emit('questionArea2', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area, 
                "roomCode" : roomCode/*, 
                "scoreIndex" : scoreIndex*/
            }));//console.log('scoreIndex == ' + scoreIndex);
            document.getElementById('nextBtnDivArea2').style.display = 'none';
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
                //document.getElementById('nextBtnDivArea3').style.display = 'none';
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
            document.getElementById('area1AnswersColumn').innerHTML = '';
            document.getElementById('area2Table').style.display = 'flex';
            document.getElementById('area2QuestionsDiv').innerHTML = '<label id="question">' + question + '</label>';
            var html = '';
            for (var j = 0; j < options.length; j++)
            {
                //html += '<input class="inputRadioOption" type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea2\').style.display = \'block\'; scoreIndex = ' + j + ';">';
                //html += '<label id="lbl_question_option_' + j + '" for=question_option_' + j + '">' + options[j]['option'] + '</label><br>';
                //html += '<label onclick="optionSelected(2, ' + j + ');" id="lbl_question_option_' + j + '">' + options[j]['option'] + '</label><br><br>';
                html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(2, ' + j + ');">' + options[j]['option'] + '<br></div><br>';
            }
            document.getElementById('area2AnswersDiv').innerHTML = html;
            nextStep = 'questionArea2';
            //document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
            document.getElementById('nextBtnDivArea2').style.display = 'none';
        break;
        case 'area3Card':
            /*socket.emit('area3Card', JSON.stringify({
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "text" : text, 
                "score" : score, 
                "roomCode" : roomCode
            }));
            //<div id="card"></div>
            //document.getElementById('cardContent').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + score;
            //document.getElementById('area3Info').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
            document.getElementById('back').innerHTML = '<br><br>' + text + '<br>' + 'SCORE: ' + '<label class="lblScore">' + score + '</label>';
            nextStep = 'showSpinner';
            document.getElementById('nextBtnDivArea3').style.display = 'block';
            document.getElementById('nextBtnDivArea3').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';*/
        break;
    }
}
var finalAnswer;
var score;
var scoreTotal;
//var scoreIndex;
var bestAnswerScore;
var leaderName;
var leaderSurname;
socket.on('detailedExplanationOfAnswers', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        leaderName = data['userName'];
        leaderSurname = data['userSurname'];
        document.getElementById('lblLightBoxArea1Header').innerHTML = 'DETAILED EXPLANATION OF ANSWERS';
        document.getElementById('area1Table').style.display = 'none';
        document.getElementById('area1LabelsTable').style.display = 'none';
        
        nextStep = 'showFinalAnswer';
        finalAnswer = data['finalAnswer'];
        score = data['score'];
        scoreTotal = data['scoreTotal'];
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
            document.getElementById('area1Table').style.display = 'flex';
            document.getElementById('area1').style.display = 'block';
            document.getElementById('area1').style.backgroundColor = "#ac0034";
            document.getElementById('lblLightBoxArea1Header').innerHTML = 'NOW DISCUSS THE BEST MOST APPROPIATE ANSWER WITH THE TEAM & LEADER WILL SUBMIT THE FINAL DECISSION.';
            document.getElementById('area1QuestionColumn').innerHTML = '<label id="question">' + data['question']['question'] + '</label>';
            question = data['question']['question'];
            var html = '';
            for (var j = 0; j < data['question']['options'].length; j++)
            {
                if (leader)
                {
                    /*html += '<tr>';
                    html += '<td><input type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea1\').style.display = \'block\';"></td>';
                    html += '<td><label class="lblOption" id="lbl_question_option_' + j + '" for=question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label></td>';
                    html += '</tr><tr></tr>';*/
                    //html += '<label onclick="optionSelected(1, ' + j + ');" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label><br><br>';
                    html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(1, ' + j + ');">' + data['question']['options'][j]['option'] + '<br></div><br>';
                }
                else
                {
                    html += '<label class="lblOption" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label><br><br>';
                }
            }
            if (leader)
            {
                /*html += '<tr>';
                html += '<td><input class="inputRadioOption" type="radio" id="question_option_' + j + '" name="answer" onchange="document.getElementById(\'nextBtnDivArea1\').style.display = \'block\';"></td>';
                html += '<td><label class="lblOption" id="lbl_question_option_' + j + '" for=question_option_' + j + '">no mutual agreement</label></td>';
                html += '</tr><tr></tr>';*/
                //html += '<label onclick="optionSelected(1, ' + j + ');" id="lbl_question_option_' + j + '">no mutual agreement</label><br>';
                html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(1, ' + j + ');">no mutual agreement</div><br>';
                document.getElementById('nextBtnDivArea1').style.display = 'none';
                document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                document.getElementById('beforeBtnDivArea1').style.display = 'none';
                document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            }
            document.getElementById('area1AnswersColumn').innerHTML = html;
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
            nextStep = 'personalEvaluation';
            document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
            beforeStep = 'showFinalAnswer';
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            document.getElementById('personalEvaluation').style.display = 'block';
            document.getElementById('lblLightBoxArea1Header').innerHTML = 'EVALUATION<br>HOW IS YOUR REALITY CLOSE TO THE BEST ANSWER WITH ' + bestAnswerScore + ' POINTS';
            document.getElementById('area1Table').style.display = 'none';
            document.getElementById('area1LabelsTable').style.display = 'none';

            document.getElementById('personalEvaluation').innerHTML = html;
            showGameInfo();
        }
    }
});
var text;
var userPlay = false;
socket.on('ro', (data) => {
    if ((data['roomCode'] == roomCode) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        teams = getTeams(data['rooms']);
        if (data['teamName'] == teamName)
        {
            document.getElementById('lblWheelInfo').innerHTML = '';
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('area3').style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
            document.getElementById('lblArea').innerHTML = 'RISKS & OPPORTUNITIES';
            area = data['area'];
            document.getElementById('area1').style.display = 'none';
            document.getElementById('area2').style.display = 'none';
            document.getElementById('area3').style.display = 'block';
            text = data['ro']['text'];
            score = data['ro']['score'];//console.log('chat.js, line 654: score == ' + score);
            if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
            {
                userPlay = true;
                document.getElementById('front').innerHTML = '<br><br>NOW OPEN THE CARD<br>&<br>SEE THE RESULT';
                flip('front');
                dataUserName = data['userName'];
                dataUserSurname = data['userSurname'];
            }
            else
            {
                userPlay = true;
                flip('front');
                userPlay = false;
                document.getElementById('front').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' WILL OPEN THE<br>CARD<br>&<br>SEE THE RESULT';
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
            document.getElementById('lblWheelInfo').innerHTML = '';
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('area1').style.display = 'none';
            document.getElementById('area2').style.display = 'none';
            document.getElementById('area3').style.display = 'none';
            document.getElementById('divGameFinished').style.display = 'block';
            finished = true;
            gameFinished();
        }
    }
});
socket.on('showTeamInfo', (data) => {
    if ((data['roomCode'] == roomCode) && (data['teamName'] == teamName) && (data['userName'] != userName) && (data['userSurname'] != userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('area1AnswersColumn').innerHTML = '';
        document.getElementById('area2AnswersDiv').innerHTML = '';
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
    {console.log(data);
        status = data['status'];
        users = data['users'];
        /*if (status == 'newLeader')
        {
            showTeamInfo(false, 'teamInfo2');
        }*/
        //if (status == 'newLeader')
        {
            if (started)
            {
                showTeamInfo((status == 'newLeader'), 'teamInfo2');
            }
            else
            {console.log('712.');
                showTeamInfo((status == 'newLeader'), 'teamInfo');
            }
        }
        /*if (status == 'oneUser')
        {
            if (started)
            {
                showTeamInfo(false, 'teamInfo2');
            }
            else
            {
                showTeamInfo(false, 'teamInfo');
            }
        }*/
        /*data2 = data;
        document.getElementById('teamInfo').style.display = 'none';
        document.getElementById('gameInfo').style.display = 'none';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('area1').style.display = 'none';
        document.getElementById('area2').style.display = 'none';
        document.getElementById('area3').style.display = 'none';
        document.getElementById('restartPopup').style.display = 'block';
        document.getElementById('lblUserDisconnected').innerHTML = data['userName'] + ' ' + data['userSurname'] + ' disconnected.';
        document.getElementById('restartPopup').style.top = (document.documentElement.clientWidth * 0.3) + 'px';
        document.getElementById('restartPopup').style.left = (document.documentElement.clientHeight * 0.4) + 'px';*/
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
var status = 'starting';
function voteLeader(userNameVoting, userSurnameVoting, roomCode, userIndex, userNameVoted, userSurnameVoted, newLeader = false)
{console.log('newLeader == ' + newLeader);
    console.log('vl_' + userIndex);
    console.log(document.getElementById('vl_' + userIndex).innerHTML);
    if (document.getElementById('vl_' + userIndex).innerHTML.toLowerCase() != 'vote for leader')
    {
        for (var i = 0; i < users.length; i++)
        {
            document.getElementById('vl_' + i).style.display = 'none';
        }
        vote = true;
        socket.emit('voteLeader', JSON.stringify({
            newLeader: newLeader,
            status: status,
            userNameVoted: userNameVoted, 
            userSurnameVoted: userSurnameVoted, 
            userNameVoting: userNameVoting, 
            userSurnameVoting: userSurnameVoting, 
            teamName: teamName, 
            roomCode: roomCode
        }));
    }
    else
    {
        for (var i = 0; i < users.length; i++)
        {
            document.getElementById('vl_' + i).style.display = 'block';
            document.getElementById('vl_' + i).innerHTML = 'VOTE FOR LEADER';
            if (i == userIndex)
            {
                document.getElementById('vl_' + i).innerHTML = 'CONFIRM';
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
                'userName' : userName, 
                'userSurname' : userSurname, 
                'teamName' : document.getElementById('teamName').value
            });
            socket.emit('update', data);
        }
    }
}
socket.on("connect_error", () => {
  document.getElementById('restartPopup').style.display = 'block';
  setTimeout(() => {
    socket.connect();
    document.getElementById('restartPopup').style.display = 'none';
  }, 1000);
});
socket.on("disconnect", () => {});