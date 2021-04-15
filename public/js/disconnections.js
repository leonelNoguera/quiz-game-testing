socket.on('userDisconnected', (data) => {console.log(data);
    if ((data['teamName'] == teamName) && (document.getElementById('divGameFinished').style.display == 'none'))
    {
        //status = data['status'];
        users = data['users'];
        /*if (status == 'newLeader')
        {
            showTeamInfo(false, 'teamInfo2');
        }*/
        if (started)
        {
            if (data['status'] == 'oneUser')
            {
                window.location = window.location;
            }
            else
            {
                if (data['newLeader'])
                {
                    showTeamInfo(true, 'teamInfo');
                }
                else
                {//Se desconectó uno que no es el líder y quedan 2 o más.
                    //
                }
            }
            //showTeamInfo((status == 'newLeader'), 'teamInfo2');
        }
        else
        {
            showTeamInfo(false, 'teamInfo');
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