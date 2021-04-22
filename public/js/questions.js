var step = '';
function optionSelected(area, index)
{
	//Pendiente deseleccionar las otras opciones por medio de CSS.
	var aux = answer;
	if (index != options.length)
    {
        answer = options[index]['option'];
    }
    else
    {
    	answer = 'no mutual agreement';
    }
    for (var i = 0; i < options.length; i++)
    {
		//document.getElementById('lbl_question_option_' + i).style.backgroundColor = document.getElementById('area' + area).style.backgroundColor;
		document.getElementById('lbl_question_option_' + i).className = '';
    }
    try{document.getElementById('lbl_question_option_' + options.length).className = '';}catch{}
    if (answer == aux)
    {
    	answer = '';
    	document.getElementById('nextBtnDivArea' + area).innerHTML = '';
    }
    else
    {
        document.getElementById('nextBtnDivArea' + area).style.display = 'block';
		document.getElementById('nextBtnDivArea' + area).innerHTML = '<i class="fas fa-angle-right fa-2x" onclick="showNextStep();"></i>';
    	//document.getElementById('lbl_question_option_' + index).style.backgroundColor = '#0000ff';
    	/*if (step == 'selectingFinalAnswer')
    	{
    		document.getElementById('lbl_question_option_' + index).className = 'finalAnswerSelected';
    	}
    	else
    	{
    		document.getElementById('lbl_question_option_' + index).className = 'optionSelected';
    	}*/
    	document.getElementById('lbl_question_option_' + index).className = 'optionSelected';
    }
}