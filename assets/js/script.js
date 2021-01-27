// add function to search for cities
$("#searchBtn").on("click", function() {
    let cityValue = $("input").val();
    cityWeatherInfo(cityValue);
    $("input").val("");
});


// add function to get the cities information
let cityWeatherInfo = function(cityValue) {
    let apiKey = "46c83042b2cdf276d685079cb38dbf65";
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&units=imperial&appid=${apiKey}`;
    
    let request = new XMLHttpRequest();
    request.open('GET', apiUrl, true);
    request.onload = function() {
        let cityObj = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
            let cityName = cityObj.name;
            let lantitude = cityObj.coord.lat;
            let longitude = cityObj.coord.lon;
            
            $("#cityName").text(`${cityName} (${moment().format("L")})`);
            $("#cityName").append($("<img>").attr("src", `https://openweathermap.org/img/wn/${cityObj.weather[0].icon}@2x.png`));
            $("#temp").attr("class", "font-weight-normal").html(` ${cityObj.main.temp}&#176F`);
            $("#humidity").attr("class", "font-weight-normal").text(` ${cityObj.main.humidity}%`);
            $("#windSpeed").attr("class", "font-weight-normal").text(` ${cityObj.wind.speed}MPH`);
            uvIndexInfo(lantitude, longitude);
            fiveDayForecast(lantitude, longitude);
 } else if (cityValue === "") {
     alert("Please enter the name of the city");
 } else {
    alert(`Error: The city ${cityValue} doesn't exist!`);
 }
}
   request.send();
};

// add function to get UV index
let uvIndexInfo = function(lantitude, longitude) {
    let apiKey = "46c83042b2cdf276d685079cb38dbf65";
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/uvi?lat=${lantitude}&lon=${longitude}&appid=${apiKey}`,
        method: "GET"
    }).then((function(response) {
        let uvIndex = response.value;
    
        if(uvIndex <= 2) {
            $("#uvIndex").append("<span>").attr("class", "bg-success rounded p-1 text-light").text(`Low - ${uvIndex}`);
        }
        else if(uvIndex > 2 && uvIndex <= 5) {
            $("#uvIndex").append("<span>").attr("class", "bg-warning rounded p-1 text-light").text(`Moderate - ${uvIndex}`);
        }
        else if(uvIndex > 5 && uvIndex <= 7) {
            $("#uvIndex").append("<span>").attr("class", "bg-danger rounded p-1 text-light").text(`High - ${uvIndex}`);
        }
        else if(uvIndex > 7 && uvIndex <= 10) {
            $("#uvIndex").append("<span>").attr("class", "very-high rounded p-1 text-light").text(`Very High - ${uvIndex}`);
        } else {
            $("#uvIndex").append("<span>").attr("class", "bg-info rounded p-1 text-light").text(`Extreme - ${uvIndex}`);
        }
    }));
};

// add function to get five days info
let fiveDayForecast = function(lantitude, longitude) {
    $(".fiveDayForecast").remove();
    let apiKey = "46c83042b2cdf276d685079cb38dbf65";
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lantitude}&lon=${longitude}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`,
        method: "GET"
    }).then((function(response) {
        let fiveDay = response.daily;

        for(let i = 1; i <= 5; i++) {
            let fiveDayDiv = $("<div>").attr("class", "fiveDayForecast");
            let date = String(moment().add(i, 'day').format('L'));

            fiveDayDiv.append($("<h5>").text(date));
            fiveDayDiv.append($("<img>").attr("src", `https://openweathermap.org/img/wn/${fiveDay[i].weather[0].icon}@2x.png`));
            fiveDayDiv.append($("<p>").html(`Temp: ${fiveDay[i].temp.day}&#176F`));
            fiveDayDiv.append($("<p>").html(`Humidity: ${fiveDay[i].humidity}%`));
            $("#fiveDayForecast").append(fiveDayDiv);
        }
    }));
};


