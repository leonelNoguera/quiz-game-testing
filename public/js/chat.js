var socket = io();

var userName;
var userSurname;
var connected = false;

var regex = /(&zwj;|&nbsp;)/g;
var users = [];
var area;
var vote = false;
//var answerType;
var question;
var options;
var scoreArea1 = 0;
var scoreArea2 = 0;
var scoreArea3 = 0;
//socket.on('userConnected', (data) => {console.log(data);
function newUserConnected(data)
{console.log(data);    
    if ((data['userName'] != undefined) && (data['userSurname'] != undefined) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
        {
            if (!connected)
            {
                document.getElementById('divLogin').style.display = 'block';
                document.getElementById('loginFields').style.display = 'none';
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
                users = data['users'];
            }
        }
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
        if (((data['userName'] == userName) && (data['userSurname'] == userSurname)) || 
            ((teamName != undefined) && (data['teamName'] == teamName))
        )
        {
            if (!started)
            {//Pendiente ver si aparece data['newLeader'] en el backend antes de llegar a esta parte.
                showTeamInfo(data['newLeader']);
            }
            else
            {
                showTeamInfo(data['newLeader'], true);
            }
        }
    }
}
socket.on('loginError', (data) => {console.log(data);
    if ((data['teamName'] == teamName) && (data['userName'] == userName) && (data['userSurname'] == userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('loginErrorLbl').innerHTML = data['msg'];
        userName = '';
        userSurname = '';
        teamName = '';
    }
});
socket.on('continueNewLeader', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {console.log('data == ');console.log(data);//Pendiente solucionar cuando se desconecta algún usuario que no es el líder mientras votan en el área 1.
        $("#area1").prop('disabled', false);
        $("#area2").prop('disabled', false);
        $("#area3").prop('disabled', false);
        if (document.getElementById('spinner').style.display == 'block')
        {
            showSpinner(data);
        }
    }
});
var started = false;
socket.on('showSpinner', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('teamInfo').style.display = 'none';
        showSpinner(data);
    }
});
socket.on('startSpin', (data) => {//console.log(data);
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        if ((data['userName'] != userName) || (data['userSurname'] != userSurname))
        {
            spin(data['randomSpin']);
        }
    }
});
socket.on('showArea1PartialResult', (data) => {//console.log(data);
    if ((document.getElementById('divGameFinished').style.display == 'none'))
    {
        area = data['area'];
        if ((data['teamName'] == teamName) && (data['area'] == 1))
        {
            document.getElementById('teamInfo').style.display = 'none';
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
            /*for (var j = 0; j < data['question']['options'].length; j++)
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
            }*/
        }
    }
});
var nextStep;
var beforeStep;
socket.on('showResultArea2', (data) => {console.log('data == ' + JSON.stringify(data));
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('teamInfo').style.display = 'none';
        document.getElementById('area2Table').style.display = 'none';
        var r = 'INCORRECT';
        if (data['score']> 0)
        {
            r = 'CORRECT';
        }
        if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
        {
            document.getElementById('area2Info').innerHTML = '<br><br>YOUR ANSWER IS ' + r + '!<br>YOUR SCORE:<br><label class="lblScore">' + data['score'] + '</label>';
            nextStep = 'showSpinner';
            document.getElementById('nextBtnDivArea2').style.display = 'block';
            document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
        }
        else
        {
            document.getElementById('area2Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' ANSWER IS ' + r + '!<br>YOUR SCORE:<br><label class="lblScore">' + data['score'] + '</label>';
        }
        //scoreArea2 += data['score'];
        scoreArea2 += data['scoreArea2'];
        showGameInfo();
    }
});
var dataUserName;
var dataUserSurname;
socket.on('question', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('teamInfo').style.display = 'none';
        document.getElementById('lblWheelInfo').innerHTML = '';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('area' + data['area']).style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
        question = data['question']['question'];
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
                html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(1, ' + j + ');">' + data['question']['options'][j]['option'] + '<br></div><br>';
            }
            document.getElementById('area1AnswersColumn').innerHTML = html;
            document.getElementById('nextBtnDivArea1').innerHTML = '';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
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
                document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                document.getElementById('area2Info').innerHTML = '<br><br>NOW PLEASE CHOOSE THE RIGHT ANSWER';
                dataUserName = data['userName'];
                dataUserSurname = data['userSurname'];
                nextStep = 'area2Question';
            }
            else
            {
                document.getElementById('nextBtnDivArea2').innerHTML = '';
                document.getElementById('area2Info').innerHTML = '<br><br>' + data['userName'] + ' ' + data['userSurname'] + ' WILL CHOOSE THE ANSWER';
            }
        }
    }
});
socket.on('area2Question', (data) => {
    if ((data['teamName'] == teamName) && ((data['userName'] != userName) || (data['userSurname'] != userSurname)) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('teamInfo').style.display = 'none';
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
socket.on('area3Card', (data) => {console.log(data);//Ver por qué no voltea para los otros usuarios.
    if ((data['teamName'] == teamName) && ((data['userName'] != userName) || (data['userSurname'] != userSurname)) && (document.getElementById('divGameFinished').style.display == 'none'))
    {console.log(data['userName'] + ' ' + data['userSurname']);
        document.getElementById('teamInfo').style.display = 'none';
        userPlay = true;
        flip('back', false);
        userPlay = false;
        document.getElementById('nextBtnDivArea3').innerHTML = '';
        document.getElementById('backContent').innerHTML = '<br><br>' + data['text'] + '<br>' + 'SCORE: <label class="lblScore">' + data['score'] + '</label>';
        scoreArea3 += score;
        showGameInfo();
    }
});
function showBeforeStep()
{
    switch (beforeStep)
    {
        case 'showFinalAnswer':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('personalEvaluation').innerHTML = `
                THE FINAL TEAM LEADER ANSWER WAS:<br>
                ` + finalAnswer + `<br><br>
                THE SCORE FOR THE ANSWER:<br>
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
                if (options[i]['option'] == finalAnswer)
                {
                    html += '<div class="lblOptionFinal" id="lbl_question_option_' + i + '">' + options[i]['option'] + '<br>' + '<label class="lblScore">' + options[i]['score'] + '</label>' + ' ' + '<label class="lblResponse">' + options[i]['response'] + '</label>' + '<br>(final answer)<br></div>';
                }
                else
                {
                    html += '<div class="lblOption" id="lbl_question_option_' + i + '">' + options[i]['option'] + '<br>' + '<label class="lblScore">' + options[i]['score'] + '</label>' + ' ' + '<label class="lblResponse">' + options[i]['response'] + '</label>' + '<br></div>';
                }
            }
            if ('no mutual agreement' == finalAnswer)
            {
                html += '<div class="lblOptionFinal" id="lbl_question_option_' + (options.length) + '">no mutual agreement<br>' + '<label class="lblScore">-600</label><br>(final answer)<br></div>';
            }
            else
            {
                html += '<div class="lblOption" id="lbl_question_option_' + (options.length) + '">no mutual agreement<br>' + '<label class="lblScore">-600</label><br></div>';
            }
            html += '<label class="topic">' + topic + '<br><br></label>';
            document.getElementById('personalEvaluation').innerHTML = html;
            document.getElementById('nextBtnDivArea1').style.display = 'block';
            document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
        
            nextStep = 'showFinalAnswer';
        break;
    }
}
var answer;
function showNextStep()
{
    switch (nextStep)
    {
        case 'allUsersVotation':
            socket.emit('allUsersVotation', {
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area
            });
            document.getElementById('nextBtnDivArea1').innerHTML = '';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
        break;
        case 'leaderVotation':
            socket.emit('leaderVotation', {
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area
            });
            document.getElementById('nextBtnDivArea1').innerHTML = '';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
        break;
        case 'personalEvaluation':
            nextStep = 'sendPersonalEvaluation';
            document.getElementById('nextBtnDivArea1').style.display = 'block';
            document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
            
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('area1Table').style.display = 'none';
            document.getElementById('area1LabelsTable').style.display = 'none';
            document.getElementById('personalEvaluation').innerHTML = 'EVALUATION<br>HOW IS YOUR REALITY CLOSE TO THE BEST ANSWER WITH ' + bestAnswerScore + ' PONTS?<br><br>Distant <input type="range" id="personalEvaluationRange" min="0" max="4"> Firm';
            beforeStep = 'showFinalAnswer';
            document.getElementById('beforeBtnDivArea1').style.display = 'block';
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            showGameInfo();
        break;
        case 'sendPersonalEvaluation':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('area1Table').style.display = 'none';
            document.getElementById('area1LabelsTable').style.display = 'none';
            document.getElementById('nextBtnDivArea1').innerHTML = '';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
            var evaluation = parseInt(document.getElementById('personalEvaluationRange').value) + 1;
            document.getElementById('personalEvaluation').innerHTML = 'THANK FOR YOUR ENGAGEMENT<br>PLEASE TAKE TURNS IN SPINING A WHELL';
            socket.emit('personalEvaluation', {
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "area" : area, 
                "evaluation" : evaluation
            });
        break;
        case 'showFinalAnswer':
            document.getElementById('lblLightBoxArea1Header').innerHTML = '';
            document.getElementById('personalEvaluation').innerHTML = `
                THE FINAL TEAM LEADER ANSWER WAS:<br>
                ` + finalAnswer + `<br><br>
                THE SCORE FOR THE ANSWER:<br>
                ` + '<label class="lblScore">' + score + '</label>' + `<br>`;
            nextStep = 'personalEvaluation';
            document.getElementById('beforeBtnDivArea1').style.display = 'block';
            document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
            beforeStep = 'detailedExplanationOfAnswers';
            scoreArea1 = scoreTotal;
            showGameInfo();
        break;
        case 'questionArea2':
            socket.emit('questionArea2', {
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "answer" : answer, 
                "area" : area
            });
            document.getElementById('nextBtnDivArea2').innerHTML = '';
        break;
        case 'showSpinner':
            socket.emit('nextUserWheel', {
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName
            });
            try
            {
                document.getElementById('nextBtnDivArea1').innerHTML = '';
                document.getElementById('beforeBtnDivArea1').innerHTML = '';
                document.getElementById('nextBtnDivArea2').innerHTML = '';
            }catch{}
        break;
        case 'area2Question':
            socket.emit('area2Question', {
                "userName" : userName, 
                "userSurname" : userSurname, 
                "teamName" : teamName, 
                "question" : question, 
                "options" : options
            });
            document.getElementById('area1AnswersColumn').innerHTML = '';
            document.getElementById('area2Table').style.display = 'flex';
            document.getElementById('area2QuestionsDiv').innerHTML = '<label id="question">' + question + '</label>';
            var html = '';
            for (var j = 0; j < options.length; j++)
            {
                html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(2, ' + j + ');">' + options[j]['option'] + '<br></div><br>';
            }
            document.getElementById('area2AnswersDiv').innerHTML = html;
            nextStep = 'questionArea2';
            document.getElementById('nextBtnDivArea2').innerHTML = '';
        break;
    }
}
var finalAnswer;
var score;
var scoreTotal;
var bestAnswerScore;
socket.on('detailedExplanationOfAnswers', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('teamInfo').style.display = 'none';
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
        scoreArea1 = data['scoreArea1'];

        var html = '';
        for (var i = 0; i < data['options'].length; i++)
        {
            if (data['options'][i]['option'] == finalAnswer)
            {
                html += '<div class="lblOptionFinal" id="lbl_question_option_' + i + '">' + data['options'][i]['option'] + '<br>' + '<label class="lblScore">' + data['options'][i]['score'] + '</label>' + ' ' + '<label class="lblResponse">' + data['options'][i]['response'] + '</label>' + '<br>(final answer)<br></div>';
            }
            else
            {
                html += '<div class="lblOption" id="lbl_question_option_' + i + '">' + data['options'][i]['option'] + '<br>' + '<label class="lblScore">' + data['options'][i]['score'] + '</label>' + ' ' + '<label class="lblResponse">' + data['options'][i]['response'] + '</label>' + '<br></div>';
            }
        }
        if ('no mutual agreement' == finalAnswer)
        {
            html += '<div class="lblOptionFinal" id="lbl_question_option_' + (data['options'].length) + '">no mutual agreement<br>' + '<label class="lblScore">-600</label><br>(final answer)<br></div>';
        }
        else
        {
            html += '<div class="lblOption" id="lbl_question_option_' + (data['options'].length) + '">no mutual agreement<br>' + '<label class="lblScore">-600</label><br></div>';
        }
        html += '<label class="topic">' + data['topic'] + '<br><br></label>';
        document.getElementById('personalEvaluation').innerHTML = html;
        document.getElementById('nextBtnDivArea1').style.display = 'block';
        document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
        showGameInfo();
    }
});
socket.on('leaderVotation', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {console.log(data);
        document.getElementById('teamInfo').style.display = 'none';
        document.getElementById('personalEvaluation').innerHTML = '';
        document.getElementById('area1Table').style.display = 'flex';
        document.getElementById('area1').style.display = 'block';
        document.getElementById('area1').style.backgroundColor = "#ac0034";
        document.getElementById('lblLightBoxArea1Header').innerHTML = 'NOW DISCUSS THE MOST APPROPIATE ANSWER WITH THE TEAM & LEADER WILL SUBMIT THE FINAL DECISSION.';
        step = 'selectingFinalAnswer';
        document.getElementById('area1QuestionColumn').innerHTML = '<label id="question">' + data['question']['question'] + '</label>';
        question = data['question']['question'];
        var html = '';
        for (var j = 0; j < data['question']['options'].length; j++)
        {
            if ((data['leader']['userName'] == userName) && (data['leader']['userSurname'] == userSurname))
            {
                html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(1, ' + j + ');">' + data['question']['options'][j]['option'] + '<br></div><br>';
            }
            else
            {
                html += '<label class="lblOption" id="lbl_question_option_' + j + '">' + data['question']['options'][j]['option'] + '</label><br><br>';
            }
        }
        if ((data['leader']['userName'] == userName) && (data['leader']['userSurname'] == userSurname))
        {//Pendiente ver si funciona o si se puede optimizar optionSelected.
            html += '<div class="optionNoSelected" id="lbl_question_option_' + j + '" onclick="optionSelected(1, ' + j + ');">no mutual agreement</div><br>';
            document.getElementById('nextBtnDivArea1').innerHTML = '';
            document.getElementById('beforeBtnDivArea1').innerHTML = '';
        }
        document.getElementById('area1AnswersColumn').innerHTML = html;
        nextStep = 'leaderVotation';
    }
});
socket.on('personalEvaluation', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        var html = 'Distant <input type="range" id="personalEvaluationRange" min="0" max="4"> Firm';
        nextStep = 'personalEvaluation';
        document.getElementById('nextBtnDivArea1').style.display = 'block';
        document.getElementById('nextBtnDivArea1').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
        beforeStep = 'showFinalAnswer';
        document.getElementById('beforeBtnDivArea1').style.display = 'block';
        document.getElementById('beforeBtnDivArea1').innerHTML = '<i class="fas fa-angle-left fa-2x" onclick="showBeforeStep();"></i>';
        document.getElementById('personalEvaluation').style.display = 'block';
        document.getElementById('lblLightBoxArea1Header').innerHTML = 'EVALUATION<br>HOW IS YOUR REALITY CLOSE TO THE BEST ANSWER WITH ' + bestAnswerScore + ' POINTS';
        document.getElementById('area1Table').style.display = 'none';
        document.getElementById('area1LabelsTable').style.display = 'none';
        document.getElementById('personalEvaluation').innerHTML = html;
        showGameInfo();
    }
});
var text;
var userPlay = false;
socket.on('area3Ro', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        document.getElementById('teamInfo').style.display = 'none';
        document.getElementById('lblWheelInfo').innerHTML = '';
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
});
socket.on('finishGame', (data) => {
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        finishGame();
    }
});
socket.on('showTeamInfo', (data) => {
    if ((data['teamName'] == teamName) && (data['userName'] != userName) && (data['userSurname'] != userSurname) && (document.getElementById('divGameFinished').style.display == 'none'))
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
/*socket.on("disconnect", () => {
    document.getElementById('restartPopup').style.display = 'block';
    $("#area1").prop('disabled', false);
    $("#area2").prop('disabled', false);
    $("#area3").prop('disabled', false);
    setTimeout(() => {
        socket.connect();
        document.getElementById('restartPopup').style.display = 'none';
    }, 1000);
});*/
socket.on("connect_error", () => {disconnected();});
socket.on("disconnect", () => {disconnected();});
function disconnected()
{
    document.getElementById('restartPopup').style.display = 'block';
    $("#area1").prop('disabled', true);
    $("#area2").prop('disabled', true);
    $("#area3").prop('disabled', true);
}
