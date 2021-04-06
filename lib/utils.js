var game = require('./game.js');
function allUsersInTeamUsedTheWheel(teamIndex)
{
    for (var j = 0; j < game.teams[teamIndex]['users'].length; j++)
    {
        if (!game.teams[teamIndex]['users'][j]['usedTheWheel'])
        {
          return false;
        }
    }
    return true;
}
module.exports.allUsersInTeamUsedTheWheel = allUsersInTeamUsedTheWheel;