var lockWheel = true;
var padding = {top:20, right:40, bottom:0, left:0},
    w = 617 - padding.left - padding.right,
    h = 617 - padding.top  - padding.bottom,
    r = Math.min(w, h)/2,
    rotation = 0,
    oldrotation = 0,
    picked = 100000,
    oldpick = [],
    color = d3.scale.category20();//category20c()
    //http://osric.com/bingo-card-generator/?title=HTML+and+CSS+BINGO!&words=padding%2Cfont-family%2Ccolor%2Cfont-weight%2Cfont-size%2Cbackground-color%2Cnesting%2Cbottom%2Csans-serif%2Cperiod%2Cpound+sign%2C%EF%B9%A4body%EF%B9%A5%2C%EF%B9%A4ul%EF%B9%A5%2C%EF%B9%A4h1%EF%B9%A5%2Cmargin%2C%3C++%3E%2C{+}%2C%EF%B9%A4p%EF%B9%A5%2C%EF%B9%A4!DOCTYPE+html%EF%B9%A5%2C%EF%B9%A4head%EF%B9%A5%2Ccolon%2C%EF%B9%A4style%EF%B9%A5%2C.html%2CHTML%2CCSS%2CJavaScript%2Cborder&freespace=true&freespaceValue=Web+Design+Master&freespaceRandom=false&width=5&height=5&number=35#results
var data = [
    {"label":"DILEMMAS",  "value":1}, 
    {"label":"KNOWLEDGE ABOUT US",  "value":2}, 
    {"label":"RISKS & OPPORTUNITIES",  "value":3}, 
    {"label":"DILEMMAS",  "value":1}, 
    {"label":"KNOWLEDGE ABOUT US",  "value":2}, 
    {"label":"RISKS & OPPORTUNITIES",  "value":3}, 
    {"label":"DILEMMAS",  "value":1}, 
    {"label":"KNOWLEDGE ABOUT US",  "value":2}, 
    {"label":"RISKS & OPPORTUNITIES",  "value":3}, 
    {"label":"DILEMMAS",  "value":1}, 
    {"label":"KNOWLEDGE ABOUT US", "value":2}, 
    {"label":"RISKS & OPPORTUNITIES", "value":3}
];
var colours = ['#ac0034', '#ffffff', '#c4b3b0', '#ac0034', '#ffffff', '#c4b3b0', '#ac0034', '#ffffff', '#c4b3b0', '#ac0034', '#ffffff', '#c4b3b0'];
var textColours = ['#f6adb6', '#000000', '#ac0034', '#f6adb6', '#000000', '#ac0034', '#f6adb6', '#000000', '#ac0034', '#f6adb6', '#000000', '#ac0034'];
var svg = d3.select('#spinner')
    .append("svg")
    .data([data])
    .attr("width",  w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);
var container = svg.append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")");
var vis = container
    .append("g");

var pie = d3.layout.pie().sort(null).value(function(d){return 1;});
// declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
var arcs = vis.selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice")
    .attr("fill", function(d, i){ return textColours[i]; });

arcs.append("path")
    .attr("fill", function(d, i){ return colours[i]; })
    .attr("d", function (d) { return arc(d); });
// add the text
arcs.append("text").attr("transform", function(d){
    d.innerRadius = 0;
    d.outerRadius = r;
    d.angle = (d.startAngle + d.endAngle)/2;
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -10) +")";
})
.attr("text-anchor", "end")
.text( function(d, i) {
    return data[i].label;
});
//container.on("click", spin);
var pickedArea;
function sendArea()
{
    if ((!lockWheel) && (pickedArea != undefined))
    {
        //if (pickedArea != lastArea)
        {
            spinStarted = false;
            lockWheel = true;
            socket.emit('selectedArea', {
                userName: userName, 
                userSurname: userSurname, 
                teamName: teamName, 
                area: pickedArea
            });
            if (pickedArea == 1)
            {
                document.getElementById('lblArea').innerHTML = 'DILEMMAS';
            }
            if (pickedArea == 2)
            {
                document.getElementById('lblArea').innerHTML = 'KNOWLEDGE ABOUT US';
            }
            if (pickedArea == 3)
            {
                document.getElementById('lblArea').innerHTML = 'RISKS & OPPORTUNITIES';
            }
            document.getElementById('spinner').style.display = 'none';
        }
        /*else
        {console.log('...');
            pickedArea = undefined;
            spinStarted = false;
            spin();
        }*/
    }
    pickedArea = undefined;
}
var spinStarted = false;
function spin(randomSpin = Math.random())
{
    if ((pickedArea == undefined) && !spinStarted)
    {
        var  ps       = 360/data.length,
             pieslice = Math.round(1440/data.length),
             rng      = Math.floor((randomSpin * 1440) + 360);
        rotation = (Math.round(rng / ps) * ps);
        picked = Math.round(data.length - (rotation % 360)/ps);
        picked = picked >= data.length ? (picked % data.length) : picked;
        rotation += 90 - Math.round(ps/2);

        while (data[picked].value == lastArea)
        {
            randomSpin = Math.random();
            rng = Math.floor((randomSpin * 1440) + 360);
            rotation = (Math.round(rng / ps) * ps);
            picked = Math.round(data.length - (rotation % 360)/ps);
            picked = picked >= data.length ? (picked % data.length) : picked;
            rotation += 90 - Math.round(ps/2);console.log(data[picked].value);
        }
        
        spinStarted = true;
        if (!lockWheel)
        {
            socket.emit('startSpin', {
                userName: userName, 
                userSurname: userSurname, 
                teamName: teamName, 
                randomSpin: randomSpin
            });
        }
        vis.transition()
            .duration(3000)
            .attrTween("transform", rotTween)
            .each("end", function(){
                //mark question as seen
                d3.select(".slice:nth-child(" + (picked + 1) + ") path");
                    //.attr("fill", "#111");
                oldrotation = rotation;
                /* Get the result value from object "data" */
                pickedArea = data[picked].value;
                if (lockWheel)
                {
                    pickedArea = undefined;
                }
                try{document.getElementById('circleInfo').innerHTML = 'CLICK TO OPEN "' + ['DILEMMAS', 'KNOWLEDGE ABOUT US', 'RISKS & OPPORTUNITIES'][pickedArea - 1] + '"'}catch{}
                /* Comment the below line for restrict spin to sngle time */
                //container.on("click", spin);
            });
    }
}
var arrowX;
svg.append("g")
    .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h/2)+padding.top) + ")")
    .append("path")
    .attr("d", "M-" + (r*.15) + ",0L0," + (r*.05) + "L0,-" + (r*.05) + "Z")
    .attr("id", "arrowSvg");
container.append("circle")
    .attr("id", 'circle')
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style({"fill":"#ac0034","cursor":"pointer"});

document.getElementById('circle').onclick = function(){
    if (!lockWheel)
    {
        spin();
    }
}
document.getElementById('spinner').onclick = function(){
    if (!lockWheel)
    {
        sendArea();
    }
}
//spin text
container.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .attr("id", "circleText")
    .style({"fill":"#f6adb6", "font-weight":"bold", "font-size":"260%", "cursor":"pointer"});

document.getElementById('circleText').onclick = function(){
    if (!lockWheel)
    {
        spin();
    }
}
function rotTween(to) {
  var i = d3.interpolate(oldrotation % 360, rotation);
  return function(t) {
    return "rotate(" + i(t) + ")";
  };
}