// Global functions called when select elements changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}


var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 75, r: 30, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var xAxisG = chartG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');

var yAxisG = chartG.append('g')
    .attr('class', 'y axis');

var transitionScale = d3.transition()
    .duration(600)
    .ease(d3.easeLinear);

d3.csv('./nba_league_avg.csv',
    //Load data and use this function to process each row
    function(row) {

        return {
            'Season': +row['Season'],
            'Age': +row['Age'],
            'FG': +row['FG'],
            'FGA': +row['FGA'],
            '3P': +row['3P'],
            '3PA': +row['3PA'],
            'FT': +row['FT'],
            'FTA': +row['FTA'],
            'FG%': +row['FG%']
        }
    }).then(
    function(dataset){
    

        //**** Your JavaScript code goes here ****

        //Create global variables here
        nba = dataset;

        // Create scales and other functions here
        xScale = d3.scaleLinear()
            .range([0, chartWidth]);
        yScale = d3.scaleLinear()
            .range([chartHeight, 0]);

        // Get min, max here for all dataset columns
        // Fun tip, dataset.columns includes an array of the columns
        domainMap = {};

        dataset.columns.forEach(function(column) {
            domainMap[column] = d3.extent(dataset, function(data_element){
                return data_element[column];
            });
        });

        // Create global object called chartScales to keep state
        chartScales = {x: 'Season', y: 'FGA'};
        updateChart();
    });


function updateChart() {
    // **** Draw and Update your chart here ****
    // Update the scales based on new data attributes
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain([1945, 2020]).nice();

    // Update the axes here first
    xAxisG.transition()
        .duration(750) // Add transition
        .call(d3.axisBottom(xScale));
    yAxisG.transition()
        .duration(750) // Add transition
        .call(d3.axisLeft(yScale));

    // Create and position scatterplot circles
    // User Enter, Update (don't need exit)
    var dots = chartG.selectAll('.dot')
        .data(nba);

    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')
        .on('mouseover', function(d){ // Add hover start event binding
            // Select the hovered g.dot
            var hovered = d3.select(this);
            // Show the text, otherwise hidden
            hovered.select('text')
                .style('visibility', 'visible');
            // Add stroke to circle to highlight it
            hovered.select('circle')
                .style('stroke-width', 2)
                .style('stroke', '#333');

        })
        .on('mouseout', function(d){ // Add hover end event binding
            // Select the hovered g.dot
            var hovered = d3.select(this);
            // Remove the highlighting we did in mouseover
            hovered.select('text')
                .style('visibility', 'hidden');
            hovered.select('circle')
                .style('stroke-width', 0)
                .style('stroke', 'none');

        });

    // Append a circle to the ENTER selection
    dotsEnter.append('circle')
        .attr('r', 3)
        .attr('fill', 'rgba(0, 50, 200, 0.65)')

    // Append a text to the ENTER selection
    dotsEnter.append('text')
        .attr('y', -10)
        .text(function(d) {
            return d['Season'];
        })
        .style('visibility', 'hidden');

    // ENTER + UPDATE selections - bindings that happen on all updateChart calls
    dots.merge(dotsEnter)
        .transition() // Add transition - this will interpolate the translate() on any changes
        .duration(750)
        .attr('transform', function(d) {
            // Transform the group based on x and y property
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        });
}
// Remember code outside of the data callback function will run before the data loads