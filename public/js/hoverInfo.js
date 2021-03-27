//var mouseOverCircle = false;
document.getElementById('circle').onmouseover = function(){
	//document.getElementById('spinner').offsetLeft;
	document.getElementById('spinner').offsetLeft;
	var top = document.getElementById('spinner').offsetTop + (document.getElementById('spinner').offsetWidth / 2);
	var left = document.getElementById('spinner').offsetLeft + (document.getElementById('spinner').offsetHeight / 2);
	var text = 'CLICK TO SPIN THE WHEEL';
	$("#body").append('<div class="overInfo" id="circleInfo" style="position: absolute; top: ' + top + 'px; z-index: 5; left: ' + left + 'px;">' + text + '</div>');
    //mouseOverCircle = true;
}
document.getElementById('circle').onmouseout = function(){
	$('#circleInfo').remove();
	/*if (mouseOverCircle)
	{

	}
    mouseOverCircle = false;*/
}