// ----------------------------------------------------------------------
// Canvas
// ----------------------------------------------------------------------
var Canvas = function(htmlContainer) {
    // --------------------------------------------------
    // Public Properties
    // --------------------------------------------------
    var pub = {};
    
    pub.container = htmlContainer || "body";

    pub.dimensions = {
	   width: 960,
	   height: 800,
	   position: $(pub.container + " " + "svg").offset()
    };

    pub.svg = {
	   base: d3.select(pub.container).append("svg")
		  .attr("width", pub.dimensions.width)
		  .attr("height", pub.dimensions.height)
		  // .call(d3.behavior.zoom().on("zoom", onZoom))
    };
	   // Simple zoom by encapsulating in a group and transforming
    pub.svg.transformed = pub.svg.base.append("g");
    
    

    // --------------------------------------------------
    // Private Function
    // --------------------------------------------------
    function onZoom() {
	   pub.svg.transformed.attr("transform",
			  "translate(" + d3.event.translate + ")"
			  + " scale(" + d3.event.scale + ")");
    }

    function updateWindow(){
	   // This actually shouldn't change
	   pub.dimensions.position =
		  $(pub.container + " " + "svg").offset();

	   pub.dimensions.width =
		  $(window).width() - 40;
	   pub.dimensions.height =
		  $(window).height() - 40;

	   pub.svg.base
		  .attr("width", pub.dimensions.width)
		  .attr("height", pub.dimensions.height);
    }
    window.onresize = updateWindow;
    // might want to append as oppose to overwrite the event here
    
    updateWindow();
    
    // --------------------------------------------------
    // Public Function
    // --------------------------------------------------
    function remove(container) {
	   pub.svg.base.remove();
    }

    // --------------------------------------------------
    // Publicize 
    // --------------------------------------------------
    return pub;
};
var canvas = Canvas("#svg");

$( "#dialog" ).dialog({
    autoOpen: false,
    minHeight: 0,
    minWidth: 500,
      show: {
        effect: "fade",
        duration: 1000
      },
      hide: {
        effect: "fade",
        duration: 1000
      }
    });



var data = [];
var dataAgg = [];

var labels = [1, 2, 3,
		    10, 11, 12,
		    20, 21, 22,
		    30];

var numbers, bars, scale, numberSize;

function createData() {
    data = [];
    dataAgg = [];
    for(i = 0; i < 100; i++) {
	   var k = Math.floor(Math.random() * 10);
	   var temp = {index: i,
				number: k,
				label: labels[k],
				x: 0.5,
				y: 0.5,
				r: Math.floor(i / 10), // Row
				c: i % 10		 	   // Column
			    };
	   data.push(temp);
    }

    dataAgg = _.map(d3.range(10), function(x) {
	   return {number: x,
			 count: _.reduce(data, function(memo, num) {
				return num.number == x ? ++memo : memo;}, 0)};
    });
    
    numberSize = Math.floor(canvas.dimensions.height/15);    
}

function initalDisplayNumbers() {
    scale = {x: d3.scale.linear(),
		   y: d3.scale.linear(),
		   color: d3.scale.category10()};
    
    scale.x.domain([0,1]);
    scale.y.domain([0,1]);

    scale.x.range([20, canvas.dimensions.width+20]);
    scale.y.range([20, canvas.dimensions.height+20]);
    
    numbers = canvas.svg.transformed.selectAll(".text")
        .data(data)
        .enter()
	   .append("text")
        .attr("class", "text")
	   .style("text-anchor", "middle")
	   .style("font-size", numberSize + "px")
	   .style("fill-opacity", 0)
	   .attr("x", function(d) {return scale.x(d.x);})
	   .attr("y", function(d) {return scale.y(d.y);})
	   .text(function(d) { return d.label; });


    scale.x = d3.scale.ordinal();
    scale.y = d3.scale.ordinal();

    scale.x.domain(d3.range(10));
    scale.y.domain(d3.range(10));

    scale.x.rangeBands([150, canvas.dimensions.width - 50]);
    scale.y.rangeBands([50, canvas.dimensions.height + 50]);


    numbers.transition().duration(5000)
        .style("fill-opacity", 1)
	   .attr("x", function(d) {return scale.x(d.c);})
	   .attr("y", function(d) {return scale.y(d.r);});

    $(document).click(function() {
	   $(document).unbind();
	   colorNumbers();
    });
}


function colorNumbers() {
    numbers.transition().duration(3000)
	   .style("fill", function(d, i) {
		  return scale.color(d.number);});

     $(document).click(function() {
	   $(document).unbind();
	   barChart();
    });
}


function barChart() {
    numbers.transition().duration(5000)
	   .attr("x", function(d) {return scale.x(d.number);})
	   .attr("y", function(d) {return scale.y(9);});

    scale.y = d3.scale.linear()
		  .range([canvas.dimensions.height-80, 40])
		  .domain([0, d3.max(dataAgg,
						 function(d) { return d.count; })]);

    var yAxis = d3.svg.axis()
		  .scale(scale.y)
		  .orient("left")
		  .ticks(10);

    canvas.svg.transformed.append("g")
	   .attr("transform", "translate(100, 0)")
	   .style("fill-opacity", 0)
	   .style("opacity", 0)
	   .attr("class", "y axis")
	   .call(yAxis);
    // .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", ".71em")
    //   .style("text-anchor", "end")
    // .text("Count");

    bars = canvas.svg.transformed.selectAll(".bar")
		  .data(dataAgg)
		  .enter().append("rect")
		  .attr("class", "bar")
		  .style("fill-opacity", 0)
		  .style("fill", function(d) {
			 return scale.color(d.number);})
		  .attr("x", function(d) { return scale.x(d.number) -
							  scale.x.rangeBand() / 3; })
		  .attr("width", scale.x.rangeBand()*2/3)
		  .attr("y", function(d) { return scale.y(0); })
		  .attr("height", function(d) {
			 return 0; });


    bars.transition().delay(1000).duration(5000)
	   .style("fill-opacity", 1)
	   .attr("y", function(d) { return scale.y(d.count); })
	   .attr("height", function(d) {
		  return canvas.dimensions.height-80 - scale.y(d.count); });


    canvas.svg.transformed.selectAll(".axis")
	   .transition().delay(4000).duration(1000)
	   .style("fill-opacity", 1)
	   .style("opacity", 1);

     $(document).click(function() {
	   $(document).unbind();
	   sortBarChart();
    });

}


function sortBarChart() {
    scale.x.domain(
	   _.chain(dataAgg)
		  .sortBy(function(x) {return -x.count;})
		  .pluck("number")
		  .map(function(x) {return x - 1;})
		  .value());
    
    numbers.transition().duration(5000)
	   .attr("x", function(d) {return scale.x(d.number-1);});
    
    bars.transition().duration(5000)
		  .attr("x", function(d) { return scale.x(d.number-1) -
							  scale.x.rangeBand() / 3; });

    $(document).click(function() {
	   $(document).unbind();
	   destroyVisuals();
	   createData();
	   _.delay(initalDisplayNumbers, 5000);
    });
}

function destroyVisuals() {
    numbers.transition().duration(1500).style("fill-opacity", 0).remove();
    bars.transition().duration(2000).style("fill-opacity", 0).remove();

    canvas.svg.transformed.selectAll(".axis").transition().duration(2000)
	   .style("fill-opacity", 0)
	   .style("opacity", 0)
	   .remove();
}

function play() {
    createData();
    initalDisplayNumbers();
    
    displayDialog(
    	   "<p>There exists a <i>black hole between data and knowledge</i>. Data"
    		  + " visualizations are meant to bridge the gaps between"
    		  + " <b>data</b>, <b>information</b>, <b>knowledge</b> and"
    		  + " <b>wisdom</b>.</p>" 
    		  + "<p>Not just for aesthetics, visualizations facilitate "
    		  + "<b>quick</b> and <b>clear</b>"
    		  + " understanding.</p>",
    	   15000);

        _.delay(displayDialog, 17000,
    			 "<p>Take for instance these 100 numbers.</p>" +
    			 "<p>How quickly can you describe their"
    			 + " distribution? Which are the <b>most</b> and"
    			 + " <b>least</b> common numbers?</p>", 9000);
    
    _.delay(colorNumbers, 30000);
    _.delay(displayDialog, 30000, "<p>The human brain has evolved to process"
    		  + " visual information quite well over the years however it is"
    		  + " better in some ways than others.</p>"
    		  + "<p>For instance the brain can distinguish variations between "
    		  + "<b>color</b> better than <b>shapes</b></p>",
    		  10000);
    
    _.delay(barChart, 50000);
    _.delay(displayDialog, 50000, "<p><b>Size</b>, <b>orientation</b>, and"
    		  + " <b>color</b> help the brain infer information. </p>" +
    		  "<p>Because of this, even a simple bar chart is easier to process"
    		  + " than the original list of numbers.</p> ", 15000);

    _.delay(displayDialog, 70000,
    		  "<p>Did you find the most and least common numbers?<p>"
    		  + "<p>How about the second most frequent?</p>"
    		  + "<p>Or which numbers have the same frequency?</p>"
    		  + "<p>Data visualization is meant to relieve users of this"
    		  + " <i>information anxiety.</i></p>", 15000);

    _.delay(sortBarChart, 70000);
    
    _.delay(destroyVisuals, 90000);

    _.delay(displayDialog, 89000,
    		  "<p>Care to play with 1,000 numbers?</p>", 4000);
    
    _.delay(play, 97000);
}

function displayDialog(text, delay) {
    $( "#dialog" ).empty();
    $( "#dialog" ).append(text);
    $( "#dialog" ).dialog("open");
    _.delay( function() {$( "#dialog" ).dialog("close");}, delay);
}

// play();


$(document).click(function() {
    $(document).unbind();
    createData();
    initalDisplayNumbers();
});
