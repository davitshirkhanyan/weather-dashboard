let cityName = "";

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
            cityName = cityObj.name;
 } else if (cityValue === "") {
     alert("Please enter the name of the city");
 } else {
    alert(`Error: The city ${cityValue} doesn't exist!`);
 }
}

  
       


   request.send();

};

