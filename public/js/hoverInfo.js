var mouseOverCircle = false;
var mouseOverSpinner = false;
var mouseOverArea1AnswersColumn = false;

document.getElementById('circle').onmouseover = function(){
	showInfo('circle', 'onmouseover');
}
document.getElementById('circleText').onmouseover = function(){
	showInfo('circleText', 'onmouseover');
}
document.getElementById('spinner').onmouseover = function(){
	showInfo('spinner', 'onmouseover');
}
document.getElementById('area1AnswersColumn').onmouseover = function(){
	showInfo('area1AnswersColumn', 'onmouseover');
}


document.getElementById('circle').onmouseout = function(){
	showInfo('circle', 'onmouseout');
}
document.getElementById('circleText').onmouseout = function(){
	showInfo('circleText', 'onmouseout');
}
document.getElementById('spinner').onmouseout = function(){
	showInfo('spinner', 'onmouseout');
}
document.getElementById('area1AnswersColumn').onmouseout = function(){
	showInfo('area1AnswersColumn', 'onmouseout');
}

function showInfo(elementId, eventName)
{
	if (eventName == 'onmouseout')
	{
		if ((elementId == 'circle') || (elementId == 'circleText'))
		{
			$('#circleInfo').remove();
			mouseOverCircle = false;
		}
		if (elementId == 'spinner')
		{
			$('#circleInfo').remove();
			mouseOverSpinner = false;
		}
		if (elementId == 'area1AnswersColumn')
		{
			$('#area1AnswersColumnInfo').remove();
			mouseOverArea1AnswersColumn = false;
		}
	}
	if (eventName == 'onmouseover')
	{
		if (((elementId == 'circle') || (elementId == 'circleText')) && (!mouseOverCircle) && (!lockWheel))
		{
			var top = document.getElementById('spinner').offsetTop + (document.getElementById('spinner').offsetWidth / 2);
			var left = document.getElementById('spinner').offsetLeft + (document.getElementById('spinner').offsetHeight / 2);
			var text = 'CLICK TO SPIN THE WHEEL';
			$("#body").append('<div class="overInfo" id="circleInfo" style="position: absolute; top: ' + top + 'px; z-index: 5; left: ' + left + 'px;">' + text + '</div>');
		    mouseOverCircle = true;
		}
		if ((elementId == 'spinner') && (!mouseOverSpinner) && (!lockWheel))
		{
			if (pickedArea != undefined)
			{
				if (mouseOverCircle)
				{
					$('#circleInfo').remove();
					mouseOverCircle = false;
				}
				var top = document.getElementById('spinner').offsetTop + (document.getElementById('spinner').offsetWidth / 2);
				var left = document.getElementById('spinner').offsetLeft + document.getElementById('spinner').offsetHeight;
				var text = 'CLICK TO OPEN "' + ['DILEMMAS', 'KNOWLEDGE ABOUT US', 'RISKS & OPPORTUNITIES'][pickedArea - 1] + '"';
				$("#body").append('<div class="overInfo" id="circleInfo" style="position: absolute; top: ' + top + 'px; z-index: 5; left: ' + left + 'px;">' + text + '</div>');
				mouseOverSpinner = true;
			}
		}
		if ((elementId == 'area1AnswersColumn') && (!mouseOverArea1AnswersColumn))
		{
			var top = document.getElementById('area1AnswersColumn').offsetTop + (document.getElementById('area1AnswersColumn').offsetWidth / 2);
			var left = document.getElementById('area1AnswersColumn').offsetLeft + document.getElementById('area1AnswersColumn').offsetHeight;
			var text = 'CLICK TO VOTE ON THE ANSWER AND CLICK THE ARROW FOR THE NEXT STEP';
			$("#body").append('<div class="overInfo" id="area1AnswersColumnInfo" style="position: absolute; top: 20%;' + top + 'px; z-index: 5; margin-left: auto; margin-right: auto;' + left + 'px;">' + text + '</div>');
		    mouseOverArea1AnswersColumn = true;
		}
	}

	
}
