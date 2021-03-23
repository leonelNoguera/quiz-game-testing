function showTeamInfo(newLeader = false, element = 'teamInfo')
{
    if (element == 'teamInfo')
    {
        document.getElementById('lblArea').innerHTML = '';
    }
    document.getElementById(element).style.display = 'block';
    var html = '';
    var tmp = [];
    //var userInTeamIndex = -1;
    console.log(users);
    //if (users.length)
    {
        /*for (var j = 0; j < teams.length; j++)
        {
            for (var k = 0; k < teams[j]['users'].length; k++)
            {
                if ((teams[j]['users'][k]['userName'] == userName) && 
                    (teams[j]['users'][k]['userSurname'] == userSurname))
                {
                    userInTeamIndex = j;
                }
            }
        }*/
        //if (userInTeamIndex != -1)
        {console.log('Line 40.');
            html += '<label>TEAM<br>"' + teamName + '"<br></label>';
            var indexLeaderElected = -1;
            for (var k = 0; k < users.length; k++)
            {
                if (users[k]['leader'])
                {
                    indexLeaderElected = k;
                    /*if (users[k]['status'] == 'waitingAnsweringQuestionArea1')
                    {
                        document.getElementById('area1').style.display = 'none';
                        document.getElementById('area2').style.display = 'none';
                        document.getElementById('area3').style.display = 'none';
                    }*/
                }
            }
            if (element == 'teamInfo')
            {
                if (users.length == 1)
                {
                    document.getElementById('lblPlease').innerHTML = '<br><br><br>';
                }
                if (users.length > 1)
                {
                    document.getElementById('lblPlease').innerHTML = 'PLEASE CHOOSE YOUR LEADER<br><br><br>';
                    showGameInfo();
                }
            }
            for (var k = 0; k < users.length; k++)
            {
                html += '<br>' + users[k]['userName'] + ' ' + users[k]['userSurname'];
                if ((users[k]['userName'] == userName) && 
                    (users[k]['userSurname'] == userSurname))
                {
                    if (!users[k]['voteLeader'])
                    {
                        vote = false;
                    }
                    html += ' (you)';
                }
                //if (k == indexLeaderElected)
                if (users[k]['leader'])
                {
                    html += ' (leader)';
                }
                if ((users.length > 1) && (indexLeaderElected == -1) && (!vote))
                {//Se debe habilitar la elección de lider.
                    //Pendiente ver por qué no aparece el botón para votar al u2 en el u3.
                    //document.getElementById('lblChooseLeader').innerHTML = 'PLASE CHOSE YOUR LEADER';
                    html += '<br><button class="voteLeaderBtn" id="vl_' + k + '" onclick="voteLeader(userName, userSurname, roomCode, ' + k + ', \'' + users[k]['userName'] + '\', \'' + users[k]['userSurname'] + '\', ' + newLeader + ');">VOTE FOR LEADER</button>';
                }
            }
            html += '</div>';
        }
    }
    document.getElementById(element).innerHTML = html;
    if (element == 'teamInfo2')
    {
        $("#area1").prop('disabled', true);
        $("#area2").prop('disabled', true);
        $("#area3").prop('disabled', true);
        document.getElementById(element).innerHTML = '<br>PLEASE CHOOSE YOUR LEADER<br><br>' + document.getElementById(element).innerHTML;
    }
}
function showGameInfo()
{
    document.getElementById('gameInfo').style.display = 'block';
    document.getElementById('gameInfo').innerHTML = '<div id="scores">DILEMMAS:<br>' + scoreArea1 + '<br><br>KNOWLEDGE ABOUT US:<br>' + scoreArea2 + '<br><br>RISKS & OPPORTUNITIES:<br>' + scoreArea3 + '</div>';
}
function gameFinished()
{
    if (teams != undefined)
    {
        for (var j = 0; j < teams.length; j++)
        {
            if (teams[j]['teamName'] == teamName)
            {
                document.getElementById('gameInfo').innerHTML = '<div id="scores">DILEMMAS:<br>' + scoreArea1 + '<br><br>KNOWLEDGE ABOUT US:<br>' + scoreArea2 + '<br><br>RISKS & OPPORTUNITIES:<br>' + scoreArea3 + '</div>';
            }
        }
    }
}
var data2;
function restart()
{
    document.getElementById('lblArea').innerHTML = '';
    pickedArea = undefined;
    document.getElementById('body').style.backgroundColor = "white";
    document.getElementById('body').style.backgroundImage = "url('./img/2.png')";
    document.getElementById('restartPopup').style.display = 'none';
    if (data2['status'] == 'newLeader')
    {
        socket.emit('showTeamInfo', JSON.stringify({
            "userName" : userName, 
            "userSurname" : userSurname, 
            "teamName" : data2['teamName'], 
            "roomCode" : data2['roomCode'], 
            'status': data2['status'], 
            'rooms': data2['rooms']
        }));
        vote = false;
        showTeamInfo(true);
    }
    else
    {
        if (data2['status'] != 'oneUser')
        {
            socket.emit('showSpinner', JSON.stringify({
                "teamName" : data2['teamName'], 
                "roomCode" : data2['roomCode']
            }));
        }
        else
        {
            document.getElementById('divLogin').style.display = 'block';
            showTeamInfo();
        }
    }
}
function getTeams(rooms)
{
    for (var i = 0; i < rooms.length; i++)
    {
        if (rooms[i]['roomCode'] == roomCode)
        {
            return rooms[i]['teams'];
        }
    }
    return [];
}