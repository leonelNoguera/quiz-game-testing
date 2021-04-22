socket.on('userConnected', (data) => {console.log(data);//socket.on('userReconnected', (data) => {console.log(data);
    if (document.getElementById('divGameFinished').style.display == 'none')
    {
        if (data['status'] == 'starting')
        {
            newUserConnected(data);
        }
        else
        {
            if ((data['userName'] == userName) && (data['userSurname'] == userSurname))
            {
                users = data['users'];
                teamName = data['teamName'];
                scoreArea1 = data['scoreArea1'];
                scoreArea2 = data['scoreArea2'];
                scoreArea3 = data['scoreArea3'];
                connected = true;
                document.getElementById('divLogin').style.display = 'block';
                document.getElementById('loginFields').style.display = 'none';
                document.getElementById('body').style.backgroundColor = "white";
                document.getElementById('body').style.backgroundImage = "url('./img/2.png')";
                //document.getElementById('lblPlease').innerHTML = '<br><br><br>';
                var leader = false;
                for (var k = 0; k < users.length; k++)
                {
                    if (users[k]['leader'])
                    {
                        leader = true;
                    }
                }
                if (leader)
                {//Se reconectó en otra etapa del juego.
                    vote = true;
                    
                    document.getElementById('divLogin').style.display = 'none';
                    document.getElementById('lblArea').innerHTML = '';
                    started = true;
                    document.getElementById('restartPopup').style.display = 'none';
                    document.getElementById('body').style.backgroundColor = "#eee";
                    document.getElementById('body').style.backgroundImage = "url('./img/3.2.png')";
                    document.getElementById('area3').style.display = 'none';
                    document.getElementById('area2').style.display = 'none';
                    document.getElementById('area1').style.display = 'none';
                    //document.getElementById('spinner').style.display = 'block';
                    //document.getElementById('teamInfo').style.display = 'none';
                    showGameInfo();
                    //Ver en qué etapa está.
                    if (data['status'] == 'starting')
                    {
                        //
                    }
                    if (data['status'] == 'wheel')
                    {
                        var userUsingWheel;
                        for (var i = 0; i < users.length; i++)
                        {
                            if (users[i]['status'] == 'useTheWheel')
                            {
                                userUsingWheel = users[i];
                            }
                        }
                        document.getElementById('lblWheelInfo').innerHTML = '<br>' + userUsingWheel['userName'] + ' ' + userUsingWheel['userSurname'] + ' spins the wheel';
                        pickedArea = undefined;
                        spinStarted = false;
                        lockWheel = true;
                        document.getElementById('divLogin').style.display = 'none';
                        document.getElementById('lblArea').innerHTML = '';
                        started = true;
                        document.getElementById('restartPopup').style.display = 'none';
                        document.getElementById('body').style.backgroundColor = "#eee";
                        document.getElementById('body').style.backgroundImage = "url('./img/3.2.png')";
                        document.getElementById('area3').style.display = 'none';
                        document.getElementById('area2').style.display = 'none';
                        document.getElementById('area1').style.display = 'none';
                        document.getElementById('spinner').style.display = 'block';
                        if ((data['randomSpin'] != undefined) && ((userUsingWheel['userName'] != userName) || (userUsingWheel['userSurname'] != userSurname)))
                        {
                            spin(data['randomSpin']);
                        }

                        document.getElementById('teamInfo').style.display = 'none';
                        showGameInfo();
                    }
                    if (data['status'] == 'answeringQuestionArea1')
                    {
                        document.getElementById('area1').style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
                        question = data['question']['question'];
                        answer = '';
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
                    if (data['status'] == 'leaderVotation')
                    {
                        document.getElementById('personalEvaluation').innerHTML = '';
                        document.getElementById('area1Table').style.display = 'flex';
                        document.getElementById('area1').style.display = 'block';
                        document.getElementById('area1').style.backgroundColor = "#ac0034";
                        document.getElementById('lblLightBoxArea1Header').innerHTML = 'NOW DISCUSS THE BEST MOST APPROPIATE ANSWER WITH THE TEAM & LEADER WILL SUBMIT THE FINAL DECISSION.';
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
                    if ((data['status'] == 'detailedExplanationOfAnswers') || (data['status'] == 'personalEvaluation'))
                    {//Muestra el cambio de score antes que los otros pero eso es un detalle de poca importancia.
                        document.getElementById('personalEvaluation').innerHTML = '';
                        document.getElementById('area1').style.display = 'block';
                        document.getElementById('area1').style.backgroundColor = "#ac0034";
                        document.getElementById('lblLightBoxArea1Header').innerHTML = 'DETAILED EXPLANATION OF ANSWERS';
                        document.getElementById('area1Table').style.display = 'none';
                        document.getElementById('area1LabelsTable').style.display = 'none';
                        document.getElementById('beforeBtnDivArea1').innerHTML = '';
                        
                        nextStep = 'showFinalAnswer';
                        finalAnswer = data['finalAnswer'];
                        score = data['score'];
                        scoreArea1 -= score;//Pendiente ver si funciona para evitar la descordinación en el score.
                        scoreTotal = data['scoreTotal'];
                        bestAnswerScore = data['bestAnswerScore'];
                        options = data['options'];
                        topic = data['topic'];
                        question = data['question'];

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
                    }
                    if (data['status'] == 'answeringQuestionArea2')
                    {//Pendiente ver si es necesario uno para cuando el usuario en turno ya respondió la pregunta.
                        document.getElementById('lblWheelInfo').innerHTML = '';
                        document.getElementById('spinner').style.display = 'none';
                        document.getElementById('area2').style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
                        question = data['question']['question'];
                        answer = '';
                        document.getElementById('area3').style.display = 'none';
                        document.getElementById('area1').style.display = 'none';
                        document.getElementById('area2').style.display = 'block';
                        options = data['question']['options'];
                        document.getElementById('area2Table').style.display = 'none';
                        document.getElementById('lblArea').innerHTML = 'KNOWLEDGE ABOUT US';
                        if ((data['actualUserName'] == userName) && (data['actualUserSurname'] == userSurname))
                        {
                            document.getElementById('nextBtnDivArea2').style.display = 'block';
                            document.getElementById('nextBtnDivArea2').innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
                            document.getElementById('area2Info').innerHTML = '<br><br>NOW PLEASE CHOOSE THE RIGHT ANSWER';
                            nextStep = 'area2Question';
                        }
                        else
                        {
                            document.getElementById('nextBtnDivArea2').innerHTML = '';
                            document.getElementById('area2Info').innerHTML = '<br><br>' + data['actualUserName'] + ' ' + data['actualUserSurname'] + ' WILL CHOOSE THE ANSWER';
                        }
                    }
                    if ((data['status'] == 'area3Ro') || (data['status'] == 'area3Card'))
                    {//Actualiza el score antes de que el usuario de la tarjeta la voltee.
                        document.getElementById('lblWheelInfo').innerHTML = '';
                        document.getElementById('spinner').style.display = 'none';
                        document.getElementById('area3').style.top = (parseInt(document.getElementById('lblArea').offsetTop) + 35) + 'px';
                        document.getElementById('lblArea').innerHTML = 'RISKS & OPPORTUNITIES';
                        document.getElementById('area1').style.display = 'none';
                        document.getElementById('area2').style.display = 'none';
                        document.getElementById('area3').style.display = 'block';
                        text = data['ro']['text'];
                        score = data['ro']['score'];
                        if ((data['userNameWithCard'] == userName) && (data['userSurnameWithCard'] == userSurname))
                        {//Pendiente ver si llega a este punto.
                            userPlay = true;
                            document.getElementById('front').innerHTML = '<br><br>NOW OPEN THE CARD<br>&<br>SEE THE RESULT';
                            flip('front');
                        }
                        else
                        {
                            if (data['status'] == 'area3Card')
                            {
                                userPlay = true;
                                flip('back', false);
                                userPlay = false;
                            }
                            else
                            {
                                flip('front');
                            }
                            document.getElementById('front').innerHTML = '<br><br>' + data['userNameWithCard'] + ' ' + data['userSurnameWithCard'] + ' WILL OPEN THE<br>CARD<br>&<br>SEE THE RESULT';
                        }
                        showGameInfo();
                    }
                }
                else
                {//Se reconectó en medio de la votación.
                    vote = false;
                    if (data['status'] == 'starting')
                    {
                        showTeamInfo(false, true);
                    }
                    else
                    {
                        showTeamInfo(false);
                    }
                }
            }
            else
            {
                if (data['teamName'] == teamName)
                {//Otro usuario recibe la información de que se reconectó uno.
                    users = data['users'];
                    var leader = false;
                    for (var k = 0; k < users.length; k++)
                    {
                        if (users[k]['leader'])
                        {
                            leader = true;
                        }
                    }
                    if (!leader)
                    {//Se reconectó cuando faltaba un líder.
                        if (data['status'] == 'starting')
                        {
                            showTeamInfo(false, true);
                        }
                        else
                        {
                            showTeamInfo(false);
                        }
                    }
                }
            }
        }
    }
});