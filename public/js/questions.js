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
		document.getElementById('lbl_question_option_' + i).style.backgroundColor = document.getElementById('area' + area).style.backgroundColor;
    }
    try{document.getElementById('lbl_question_option_' + options.length).style.backgroundColor = document.getElementById('area' + area).style.backgroundColor;}catch{}
    if (answer == aux)
    {
    	answer = '';
    	document.getElementById('nextBtnDivArea' + area).style.display = 'none';
    }
    else
    {
		document.getElementById('nextBtnDivArea' + area).style.display = 'block';
    	document.getElementById('lbl_question_option_' + index).style.backgroundColor = '#0000ff';
    }
}