/*
    Default variables
*/
var margin = {
    top: 50,
    bottom: 50,
    right: 50,
    left: 50
};
var height = 800;
var width = 800;

/*
    Initialize the dimensions of the map
    Add margins to height and width
*/
var svg = d3.select("#map")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")

/*
    Read in world.topojson
    Read in olympics.csv
    Ready function handles data processing
*/
Promise.all([
    d3.json("topojson/world.json"),
    d3.csv("data/olympics.csv"),
    d3.csv("data/countries.csv")
]).then(ready).catch(handleError)

/*
    Create a new projection using Mercator (geoMercator)
    and center it (translate)
    and zoom in a certain amount (scale) 
*/
var projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .scale(100)

/*
    create a path (geoPath)
    using the projection
*/
var path = d3.geoPath()
    .projection(projection)

/*
    Handle processing
    data[0] = world.json data
    data[1] = olympics.csv data
*/
function ready(data) {
    var country_data = data[0]
    var olympics_data = data[1]
    var country_name_data = data[2]

    var map = d3.map();
    olympics_data.forEach(function(d){
        if (!map.has(d.Year)){
            map.set(d.Year, [d.Country])
        } else {
            map.get(d.Year).push(d.Country);
        }
    });


    // Displays the year selector
    var year_option_select = d3.select('#dropdown-menu').append("select")
    .selectAll("option")
    .data(map.keys()) // was test-data
    .enter()
    .append("option")
    .attr("value", function(d){ return d;}) // WHats going to be stored in the option
    .text(function(d){ return d; });    // What text is going to be shown to the user

    /*
        topojson.feature converts our RAW geo data into 
        USEABLE geo data. Always pass it data, then
        data.objcets.__something__ then get .features out 
        of it.
    */
    var countries = topojson.feature(country_data, country_data.objects.countries).features

    /*
        Add a path for each country
        Shapes -> path
    */
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .data(olympics_data) //now that it is drawn, change data to olympic data
        .on("mouseover", function (data) {
            d3.select(this).classed("selected", true)
            var html = ""

            /* 
                Loop through each key in the current data object
                and create a simple div to be displayed
            */

            // TODO: this doesn't map the correct countries
            for (var key in data) {
                html += "<div class=\"tooltip_kv\">";
                html += "<span class='tooltip_key'>";
                html += key + ": "
                html += "</span>";
                html += "<span class=\"tooltip_value\">";
                html += data[key]
                html += "";
                html += "</span>";
                html += "</div>";
            }

            /*
                Use Jquery to add our created html from above
                to create the tool tip. Then show it.
            */
            $("#tooltip-container").html(html);
            $("#tooltip-container").show();
            $("#tooltip-container").css("background", "lightsteelblue");

            translateToolbox()
        })
        .on("mouseout", function (data) {
            d3.select(this).classed("selected", false)
            $("#tooltip-container").hide();
        })
}

/*
    Handle error
*/
function handleError(data) {}

/*
    Translate the tooltip to where we hover
*/
function translateToolbox() {
    if (d3.event.layerX < width / 2) {
        d3.select("#tooltip-container")
            .style("top", (d3.event.layerY + 15) + "px")
            .style("left", (d3.event.layerX + 15) + "px");
    } else {
        var tooltip_width = $("#tooltip-container").width();
        d3.select("#tooltip-container")
            .style("top", (d3.event.layerY + 15) + "px")
            .style("left", (d3.event.layerX - tooltip_width - 30) +
                "px");
    }
}