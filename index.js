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

var YEAR = 1896;
var DEFAULT_COLOR_START = "white"
var DEFAULT_COLOR_END = "DarkRed"
var selected = false; // by default, changes when user selects year

/* Global Data Variables */
var filtered_olympics_data; 
var olympics_data;
var country_data;
var countries;
// {name: , medals: }
var gold_country;
var silver_country;
var bronze_country;

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
    Initialize the dimensions of the map
    Add margins to height and width
*/
var svg;

/*
    Draw the color picker and generate
    its functionality
*/
drawColorPicker();

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

function printMap(countries) {
    
    svg = d3.select("#map")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    
    filterData(YEAR);

    var countryMedals = [];
    var keys = Object.keys(olympics_data[0])

    // initialize the medal winners to the first country
    gold_country = { name: olympics_data[0].Country, medals: +olympics_data[0].Gold }
    silver_country = { name: olympics_data[0].Country, medals: +olympics_data[0].Silver }
    bronze_country = { name: olympics_data[0].Country, medals: +olympics_data[0].Bronze }

    filtered_olympics_data.forEach(element => {
        var medalCount = 0;
        for (var key of keys) {
            switch(key) {
                case 'Gold':
                    medalCount += +element[key];
                    if(+element[key] > gold_country.medals)
                        gold_country = { name: element.Country, medals: +element[key] }
                    break;
                case 'Silver':
                    medalCount += +element[key];
                    if(+element[key] > silver_country.medals)
                        silver_country = { name: element.Country, medals: +element[key] }
                    break;
                case 'Bronze':
                    medalCount += +element[key];
                    if(+element[key] > bronze_country.medals)
                        bronze_country = { name: element.Country, medals: +element[key] }
                    break;
            }
        }
        countryMedals.push(medalCount);
        medalCount = 0;
    });

    /*
        Update medal winners list
    */
    $("#gold-medal-country-text").text(gold_country.name + ": " + gold_country.medals);
    $("#silver-medal-country-text").text(silver_country.name + ": " + silver_country.medals);
    $("#bronze-medal-country-text").text(bronze_country.name + ": " + bronze_country.medals);

    /*
        Create the color scale using the min and max
        of the total medal counts for the filtered
        olympic data
    */
   
    var colorScale = d3.scaleLinear()
        .range([DEFAULT_COLOR_START, DEFAULT_COLOR_END])
        .domain([Math.min(...countryMedals), Math.max(...countryMedals)]);

     /*
        Add a path for each country
        Shapes -> path
    */
    svg.selectAll(".country")
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
        // add the css class selected to this object to color
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

        displayToolTip(html);
        translateToolbox()
    })
    .on("mouseout", function (data) {
        // remove the css class selected to this object to remove color
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
    /* Intializes global data variables */
    country_data = data[0]
    olympics_data = data[1]

    /* Creates map for filtering drop down menu options */
	var map = d3.map();
    
    /* Filters unique values for drop down menu */
    olympics_data.forEach(function (d) {
        if (!map.has(d.Year)) {
            map.set(d.Year, [d.Country])
        } else {
            map.get(d.Year).push(d.Country);
        }
    });

    /* Displays the year selector */
    var year_option_select = d3.select('#dropdown-menu').append("select").attr("class", "year-option-select");
        
    year_option_select.selectAll("option")
        .data(map.keys()) // was test-data
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        }) // What is going to be stored in the option
        .text(function (d) {
            return d;
        }); // What text is going to be shown to the user

    /*
        topojson.feature converts our RAW geo data into 
        USEABLE geo data. Always pass it data, then
        data.objcets.__something__ then get .features out 
        of it.
    */
	countries = topojson.feature(country_data, country_data.objects.countries).features

	/*
		Filter the olympic data to include only data
		for the selected year
    */
    /* Initialize the filtered data for default year */
    filterData(YEAR);    

    /*
        Add a path for each country
        Shapes -> path
    */
   
    printMap(countries); // initial drawing
    
    year_option_select.on("change", function() {
        /* The menu has been changed, now grab the year from the drop down menu */
        selected = true;
        
        /* Redraw the map with the selected year */
        YEAR = $("#dropdown-menu").find(".year-option-select").val()
        redraw(); 
    });
}

/*
    Handle error
*/
function handleError(data) {}

/* Redraws the map after the drop down menu is changed */
function redraw() {
    d3.select('svg').remove();
    printMap(countries);
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
	Display the tooltip with the generated html
*/
function displayToolTip(html){
	$("#tooltip-container").html(html);
	$("#tooltip-container").show();
	$("#tooltip-container").css("background", "lightsteelblue");
}

/*
    Generate the color picker 
*/
function drawColorPicker(){
    var bCanPreview = true; // can preview
    // create canvas and context objects
    var canvas = document.getElementById('picker');
    var ctx = canvas.getContext('2d');
    // drawing active image
    var image = new Image();
    image.onload = function () {
        ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
    }
    // select desired colorwheel
    var imageSrc = 'images/colorwheel.png';
    image.src = imageSrc;
    $('.preview').css('backgroundColor', DEFAULT_COLOR_END);
    $('#picker').mousemove(function(e) { // mouse move handler
        if (bCanPreview) {
            // get coordinates of current position
            var canvasOffset = $(canvas).offset();
            var canvasX = Math.floor(e.pageX - canvasOffset.left);
            var canvasY = Math.floor(e.pageY - canvasOffset.top);
            // get current pixel
            var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
            var pixel = imageData.data;
            // update preview color
            var pixelColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
            
            $('.preview').css('backgroundColor', pixelColor);
            // update controls
            $('#rVal').val(pixel[0]);
            $('#gVal').val(pixel[1]);
            $('#bVal').val(pixel[2]);
            $('#rgbVal').val(pixel[0]+','+pixel[1]+','+pixel[2]);
            var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
            $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
        }
    });
    $('#picker').click(function(e) { // click event handler
        bCanPreview = !bCanPreview;
        // get coordinates of current position
        var canvasOffset = $(canvas).offset();
        var canvasX = Math.floor(e.pageX - canvasOffset.left);
        var canvasY = Math.floor(e.pageY - canvasOffset.top);
        // get current pixel
        var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
        var pixel = imageData.data;
        // update preview color
        var pixelColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
        var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
        $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
        DEFAULT_COLOR_END = $('#hexVal').val()
        $('.colorpicker').hide()
        redraw();
    });
    $('.preview').click(function(e) { // preview click
        $('.colorpicker').toggle("slow", "linear");
        bCanPreview = true;
    });
}
