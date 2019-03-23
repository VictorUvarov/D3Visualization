d3.csv("data/olympics.csv").then(function (data) {
    dataSet = data.map(function (data) {
        return {
            year: new Date(+data.Year, 0, 1), // convert "Year" column to Date
            country: data.Country, // strings are fine
            gold: +data.Gold, // convert "Gold" column to number
            silver: +data.Silver, // convert "Silver" column to number
            bronze: +data.Bronze // convert "Bronze" column to number
        };
    });
    dataSet.forEach(element => {
        console.log(element);
        // console.log(element.year);
        // console.log(element.country);
        // console.log(element.gold);
        // console.log(element.silver);
        // console.log(element.bronze);
    });
});