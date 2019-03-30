/* 
    Global Data Variables 
*/
var filtered_olympics_data; 
var olympics_data;
var country_data;
var topo,projection,path,svg,g;
var DEFAULT_YEAR = 1896;
var selected = false;

var zoom = d3.zoom()
    .scaleExtent([1, 9])
    .on("zoom", move);

var c = document.getElementById('container');
var width = c.offsetWidth;
var height = width / 2;

function setup(width,height){
  projection = d3.geoMercator()
    .translate([(width/2), (height/2)])
    .scale( width / 2 / Math.PI);

  path = d3.geoPath().projection(projection);

  svg = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(zoom)
      .append("g");

  g = svg.append("g")
         .on("click", click);

}

/*
    Read in world.topojson
    Read in olympics.csv
    Ready function handles data processing
*/
Promise.all([
    d3.json("topojson/world-topo-min.json"),
    d3.csv("data/olympics.csv"),
]).then(ready).catch(handleError)

function filterData(year) {
    /*
		Filter the olympic data to include only data
		for the selected year
    */
	filtered_olympics_data = olympics_data.filter(function (obj) {
		return (obj.Year == year);
    });
}


function isSelected() {
    selected = true;
}

function printMap(desired_year, countries) {

    setup(width, height);

    if(selected) {
        filterData(desired_year);
    } else {
        filterData(DEFAULT_YEAR);
    }

    /*
        Get the total medal counts for each
        country who won medals in a desired
        year
    */
    var countryMedals = [];
    var keys = Object.keys(olympics_data[0])
    filtered_olympics_data.forEach(element => {
        var medalCount = 0;
        for (var key of keys) {
            switch(key) {
                case 'Gold':
                    medalCount += +element[key];
                    break;
                case 'Silver':
                    medalCount += +element[key];
                    break;
                case 'Bronze':
                    medalCount += +element[key];
                    break;
            }
        }
        countryMedals.push(medalCount);
        medalCount = 0;
    });

    /*
        Create the color scale using the min and max
        of the total medal counts for the filtered
        olympic data
    */
   
    var colorScale = d3.scaleLinear()
        .range(['lightgreen', 'darkgreen'])
        .domain([Math.min(...countryMedals), Math.max(...countryMedals)]);

     /*
        Add a path for each country
        Shapes -> path
    */
    g.selectAll(".country")
    .data(countries)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .style("fill", function(d) {
        /*
            Get the total medal count for a
            country and assign it the correct color
            based on the color scale
        */
        var medalCount = 0;
        var keys = Object.keys(olympics_data[0])
        
        filtered_olympics_data.forEach(element => {
            if (element.Country == d.properties.name) {
                for (var key of keys) {
                    switch(key)
                    {
                        case 'Gold':
                            medalCount += +element[key];
                            break;
                        case 'Silver':
                            medalCount += +element[key];
                            break;
                        case 'Bronze':
                            medalCount += +element[key];
                            break;
                    }
                }
            }
        });
        return colorScale(medalCount);
    })
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
        var country_not_found = true;
        
        /*
            iterate through each country in olympics csv
            and check if the country is the same as the 
            the current country and current year selected
        */
           filtered_olympics_data.forEach(element => {
            if (element.Country == country_name) {
                for (var key of keys) {
                    html += "<div class=\"tooltip_kv\">";
                    html += "<span class='tooltip_key'>";
                    html += key + ": "
                    html += "</span>";
                    html += "<span class=\"tooltip_value\">";
                    html += element[key]
                    html += "";
                    html += "</span>";
                    html += "</div>";
                }
                country_not_found = false;
            }
        });

        /*
            We found no current country for this year
            so we only know the date and country name
            default the gold, silver, bronze to 0
        */
        if (country_not_found) {
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
                        html += desired_year
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

        displayToolTip(html);
        translateToolbox()
    })
    .on("mouseout", function (data) {
        d3.select(this).classed("selected", false)
        $("#tooltip-container").hide();
    })
}


/*
    Handle processing
    data[0] = world.json data
    data[1] = olympics.csv data
*/
function ready(data) {
    /* 
        Intializes global data variables 
    */
    country_data = data[0]
    olympics_data = data[1]

    /* 
        Creates map for filtering drop down menu options 
    */
	var map = d3.map();
    
    /* 
        Filters unique values for drop down menu 
    */
    olympics_data.forEach(function (d) {
        if (!map.has(d.Year)) {
            map.set(d.Year, [d.Country])
        } else {
            map.get(d.Year).push(d.Country);
        }
    });

    /* 
        Displays the year selector 
    */
    var year_option_select = d3.select('#dropdown-menu').append("select").attr("class", "year-option-select");
        
    year_option_select.selectAll("option")
        .data(map.keys())
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });

    filterData(DEFAULT_YEAR);    

    var countries = topojson.feature(country_data, country_data.objects.countries).features

    d3.select(window).on("resize", throttle(DEFAULT_YEAR, countries));

    year_option_select.on("change", function() {
        /* 
            The menu has been changed, now grab the year from the drop down menu 
        */
        selected = true;
        
        /* 
            Redraw the map with the selected year 
        */
        redraw($("#dropdown-menu").find(".year-option-select").val(), countries); 
    });
}

/*
    Handle error
*/
function handleError(data) {}

/* 
    Redraws the map after the drop down menu is changed 
*/
function redraw(year, countries) {
    d3.select('svg').remove();
    printMap(year, countries);
}

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

/*
	Display the tooltip with the generated html
*/

function displayToolTip(html){
	$("#tooltip-container").html(html);
	$("#tooltip-container").show();
	$("#tooltip-container").css("background", "lightsteelblue");
}

var throttleTimer;
function throttle(desired_year, countries) {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw(desired_year, countries);
    }, 200);
}

function move() {

    var t = [d3.event.transform.x,d3.event.transform.y];
    var s = d3.event.transform.k;
    zscale = s;
    var h = height/4;
  
    t[0] = Math.min(
      (width/height)  * (s - 1), 
      Math.max( width * (1 - s), t[0] )
    );
  
    t[1] = Math.min(
      h * (s - 1) + h * s, 
      Math.max(height  * (1 - s) - h * s, t[1])
    );
  
    g.attr("transform", "translate(" + t + ")scale(" + s + ")");
  
}

function click() {
    var latlon = projection.invert(d3.mouse(this));
    console.log(latlon);
}
  