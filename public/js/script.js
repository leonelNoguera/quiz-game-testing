function showTeamInfo(newLeader = false, element = 'teamInfo')
{
    if (element == 'teamInfo')
    {
        document.getElementById('lblArea').innerHTML = '';
    }
    document.getElementById(element).style.display = 'block';
    var html = '';
    var tmp = [];
    console.log(users);
    html += '<label>TEAM<br>"' + teamName + '"<br></label>';
    var indexLeaderElected = -1;
    for (var k = 0; k < users.length; k++)
    {
        if (users[k]['leader'])
        {
            indexLeaderElected = k;
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
            html += '<br><button class="voteLeaderBtn" id="vl_' + k + '" onclick="voteLeader(userName, userSurname, ' + k + ', \'' + users[k]['userName'] + '\', \'' + users[k]['userSurname'] + '\', ' + newLeader + ');">VOTE FOR LEADER</button>';
        }
    }
    html += '</div>';
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
var status = 'starting';
function voteLeader(userNameVoting, userSurnameVoting, userIndex, userNameVoted, userSurnameVoted, newLeader = false)
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
        socket.emit('voteLeader', {
            newLeader: newLeader,
            status: status,
            userNameVoted: userNameVoted, 
            userSurnameVoted: userSurnameVoted, 
            userNameVoting: userNameVoting, 
            userSurnameVoting: userSurnameVoting, 
            teamName: teamName
        });
    }
    else
    {
        for (var i = 0; i < users.length; i++)
        {
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
            socket.emit('update', {
                'userName' : userName, 
                'userSurname' : userSurname, 
                'teamName' : document.getElementById('teamName').value
            });
        }
    }
}