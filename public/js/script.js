function showTeamInfo(newLeader = false)
{
    document.getElementById('teamInfo').style.display = 'block';
    var html = '';
    var tmp = [];
    var userInTeamIndex = -1;
    console.log(teams);
    if (teams.length)
    {
        for (var j = 0; j < teams.length; j++)
        {
            for (var k = 0; k < teams[j]['users'].length; k++)
            {
                if ((teams[j]['users'][k]['userName'] == userName) && 
                    (teams[j]['users'][k]['userSurname'] == userSurname))
                {
                    userInTeamIndex = j;
                }
            }
        }
        if (userInTeamIndex != -1)
        {console.log('Line 40.');
            html += '<label>TEAM<br>"' + teams[userInTeamIndex]['teamName'] + '"<br></label>';
            var indexLeaderElected = -1;
            for (var k = 0; k < teams[userInTeamIndex]['users'].length; k++)
            {
                if (teams[userInTeamIndex]['users'][k]['leader'])
                {
                    indexLeaderElected = k;
                    if (teams[userInTeamIndex]['users'][k]['status'] == 'waitingAnsweringQuestionArea1')
                    {
                        document.getElementById('area1').style.display = 'none';
                        document.getElementById('area2').style.display = 'none';
                        document.getElementById('area3').style.display = 'none';
                    }
                }
            }
            if (teams[userInTeamIndex]['users'].length == 1)
            {
                document.getElementById('lblPlease').innerHTML = '<br><br><br>';
            }
            if (teams[userInTeamIndex]['users'].length > 1)
            {
                document.getElementById('lblPlease').innerHTML = 'PLEASE CHOOSE YOUR LEADER<br><br><br>';
                showGameInfo();
            }
            for (var k = 0; k < teams[userInTeamIndex]['users'].length; k++)
            {
                html += '<br>' + teams[userInTeamIndex]['users'][k]['userName'] + ' ' + teams[userInTeamIndex]['users'][k]['userSurname'];
                if ((teams[userInTeamIndex]['users'][k]['userName'] == userName) && 
                    (teams[userInTeamIndex]['users'][k]['userSurname'] == userSurname))
                {
                    html += ' (you)';
                }
                if (k == indexLeaderElected)
                {
                    html += ' (leader)';
                }
                if ((teams[userInTeamIndex]['users'].length > 1) && (indexLeaderElected == -1) && (!vote))
                {//Se debe habilitar la elección de lider.
                    //document.getElementById('lblChooseLeader').innerHTML = 'PLASE CHOSE YOUR LEADER';
                    html += '<br><button id="vl_' + userInTeamIndex + '_' + k + '" onclick="voteLeader(userName, userSurname, roomCode, ' + userInTeamIndex + ', ' + k + ', \'' + teams[userInTeamIndex]['users'][k]['userName'] + '\', \'' + teams[userInTeamIndex]['users'][k]['userSurname'] + '\', ' + newLeader + ');" style="background-color: #c5b3b1; display: \'block\'; border-radius: 12px; font-size: 100%;">VOTE FOR LEADER</button>';
                }
            }
            html += '</div>';
        }
    }
    document.getElementById('teamInfo').innerHTML = html;
}
function showGameInfo()
{
    document.getElementById('gameInfo').style.display = 'block';
    if (teams != undefined)
    {
        for (var j = 0; j < teams.length; j++)
        {
            if (teams[j]['teamName'] == teamName)
            {
                for (var k = 0; k < teams[j]['users'].length; k++)
                {
                    if ((teams[j]['users'][k]['userName'] == userName) && 
                        (teams[j]['users'][k]['userSurname'] == userSurname))
                    {
                        document.getElementById('gameInfo').innerHTML = '<div style="padding-right: 5%; padding-left: 5%; padding-top: 5%; padding-bottom: 5%;">DILEMMAS:<br>' + teams[j]['scoreArea1'] + '<br><br>KNOWLEDGE ABOUT US:<br>' + teams[j]['scoreArea2'] + '<br><br>RISKS & OPPORTUNITIES:<br>' + teams[j]['scoreArea3'] + '</div>';
                    }
                }
            }
        }
    }
}
function gameFinished()
{
    if (teams != undefined)
    {
        for (var j = 0; j < teams.length; j++)
        {
            if (teams[j]['teamName'] == teamName)
            {
                document.getElementById('gameInfo').innerHTML = '<div style="padding-right: 5%; padding-left: 5%; padding-top: 5%; padding-bottom: 5%;">DILEMMAS:<br>' + teams[j]['scoreArea1'] + '<br><br>KNOWLEDGE ABOUT US:<br>' + teams[j]['scoreArea2'] + '<br><br>RISKS & OPPORTUNITIES:<br>' + teams[j]['scoreArea3'] + '</div>';
            }
        }
    }
}
var data2;
function restart()
{
    document.getElementById('body').style.backgroundColor = "white";
    document.getElementById('body').style.backgroundImage = "url('./img/2.png')";
    document.getElementById('restartPopup').style.display = 'none';
    if (data2['status'] == 'newLeader')
    {
        showTeamInfo();
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