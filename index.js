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

var YEAR = 2014;
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
    d3.json("topojson/world-topo-min.json"),
    d3.csv("data/olympics.csv"),
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

    var map = d3.map();
    olympics_data.forEach(function (d) {
        if (!map.has(d.Year)) {
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
        .attr("value", function (d) {
            return d;
        }) // WHats going to be stored in the option
        .text(function (d) {
            return d;
        }); // What text is going to be shown to the user

    /*
        topojson.feature converts our RAW geo data into 
        USEABLE geo data. Always pass it data, then
        data.objcets.__something__ then get .features out 
        of it.
    */
	var countries = topojson.feature(country_data, country_data.objects.countries).features

	/*
		Filter the olympic data to include only data
		for the selected year
	*/
	var filtered_olympics_data = olympics_data.filter(function (obj) {
		return (obj.Year == YEAR);
	});
	
    /*
        Add a path for each country
        Shapes -> path
    */
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .on("mouseover", function (data) {
            d3.select(this).classed("selected", true)

            /*
                the topojson file has the country names
                of each state in the properties  
            */
            country_name = data.properties.name;

            /*
                This string interpretation of the html
                that will be appended to the tooltip
            */
            var html = ""


            /*
                we can iterate over the same keys for each object
                since all objects contain the same keys
            */
            var keys = Object.keys(olympics_data[0])
         
            
            /*
                if we found a country for the current year
            */
			var notfound = true;
			
            /*
                iterate through each country in olympics csv
                and check if the country is the same as the 
                the current country and current year selected
            */
            for (var i = 0; i < filtered_olympics_data.length; i++) {
                if (filtered_olympics_data[i].Country == country_name) {
                    for (var key of keys) {
                        html += "<div class=\"tooltip_kv\">";
                        html += "<span class='tooltip_key'>";
                        html += key + ": "
                        html += "</span>";
                        html += "<span class=\"tooltip_value\">";
                        html += filtered_olympics_data[i][key]
                        html += "";
                        html += "</span>";
                        html += "</div>";
                    }
                    notfound = false;
                }
            }

            /*
                We found no current country for this year
                so we only know the date and country name
                default the gold, silver, bronze to 0
            */
            if (notfound) {
                for (var key of keys) {
                    html += "<div class=\"tooltip_kv\">";
                    html += "<span class='tooltip_key'>";
                    html += key + ": "
                    html += "</span>";
                    html += "<span class=\"tooltip_value\">";
                    switch (key) {
                        case 'Country':
                            html += country_name
                            break
                        case 'Year':
                            html += YEAR
                            break
                        default:
                            html += 0
                            break;
                    }
                    
                    html += "";
                    html += "</span>";
                    html += "</div>";
                }        
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

/*
    Generates the tool tip by using jQuery to append
    html to the #tooltip-container div
*/
function generateToolTip() {

}