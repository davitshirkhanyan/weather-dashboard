// OpenWeather API key. This is a static site, so the key is visible to anyone
// who loads the page; restrict/rotate it in your OpenWeather account as needed.
const API_KEY = "46c83042b2cdf276d685079cb38dbf65";
const API_BASE = "https://api.openweathermap.org/data/2.5";
const HISTORY_KEY = "cityHistory";
const LAST_CITY_KEY = "lastCity";

// ---------- search history (localStorage) ----------

let loadHistory = function() {
    try {
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(history) ? history.filter(function(city) {
            return typeof city === "string" && city.trim() !== "";
        }) : [];
    } catch (e) {
        return [];
    }
};

let saveCity = function(cityName) {
    let history = loadHistory().filter(function(city) {
        return city.toLowerCase() !== cityName.toLowerCase();
    });
    history.push(cityName);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        localStorage.setItem(LAST_CITY_KEY, cityName);
    } catch (e) {
        // storage unavailable (private mode, quota) - history just won't persist
    }
    renderCityButton(cityName);
};

// add a button to the list unless that city is already there
let renderCityButton = function(cityName) {
    let exists = false;
    $("#cityList .cityList").each(function() {
        if ($(this).text().toLowerCase() === cityName.toLowerCase()) {
            exists = true;
            return false; // break out of .each
        }
    });

    if (!exists) {
        let cityListEl = $("<button>")
            .attr("type", "button")
            .attr("class", "btn btn-secondary border cityList")
            .attr("data-city", cityName)
            .text(cityName);
        $("#cityList").append(cityListEl);
    }
};

// ---------- events ----------

// search on button click or Enter key
$("#searchForm").on("submit", function(event) {
    event.preventDefault();
    let cityValue = $("#cityInput").val().trim();

    if (cityValue === "") {
        alert("Please enter the name of the city");
        return;
    }

    cityWeatherInfo(cityValue);
    $("#cityInput").val("");
});

// load a city from the history list
$("#cityList").on("click", "button", function() {
    cityWeatherInfo($(this).attr("data-city"));
});

// ---------- weather ----------

// format a unix timestamp (seconds) in the city's own time zone
let cityDate = function(unixSeconds, tzOffsetSeconds) {
    return moment.utc((unixSeconds + tzOffsetSeconds) * 1000);
};

let cityWeatherInfo = function(cityValue) {
    $.ajax({
        url: `${API_BASE}/weather?q=${encodeURIComponent(cityValue)}&units=imperial&appid=${API_KEY}`,
        method: "GET",
        dataType: "json"
    }).done(function(cityObj) {
        let cityName = cityObj.name;
        let latitude = cityObj.coord.lat;
        let longitude = cityObj.coord.lon;
        let date = cityDate(cityObj.dt, cityObj.timezone).format("L");

        saveCity(cityName);

        $("#cityName").text(`${cityName} (${date})`);
        $("#cityName").append(
            $("<img>")
                .attr("src", `https://openweathermap.org/img/wn/${cityObj.weather[0].icon}@2x.png`)
                .attr("alt", cityObj.weather[0].description)
        );
        $("#temp").attr("class", "font-weight-normal").html(` ${Math.round(cityObj.main.temp)}&#176;F`);
        $("#humidity").attr("class", "font-weight-normal").text(` ${cityObj.main.humidity}%`);
        $("#windSpeed").attr("class", "font-weight-normal").text(` ${cityObj.wind.speed} MPH`);

        fiveDayForecast(latitude, longitude);
    }).fail(function(xhr) {
        if (xhr.status === 404) {
            alert(`Error: The city ${cityValue} doesn't exist!`);
        } else if (xhr.status === 401) {
            alert("Error: The weather service rejected the API key.");
        } else {
            alert("Error: Unable to reach the weather service. Please try again later.");
        }
    });
};

// 5 day forecast from the free /forecast endpoint (3-hour steps over 5 days).
// We pick one reading per day: the one closest to midday in the city's time zone.
let fiveDayForecast = function(latitude, longitude) {
    $.ajax({
        url: `${API_BASE}/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${API_KEY}`,
        method: "GET",
        dataType: "json"
    }).done(function(response) {
        let tz = response.city.timezone;
        let today = cityDate(Math.floor(Date.now() / 1000), tz).format("YYYY-MM-DD");
        let days = {};

        response.list.forEach(function(item) {
            let local = cityDate(item.dt, tz);
            let dayKey = local.format("YYYY-MM-DD");
            if (dayKey === today) {
                return;
            }
            let distanceFromNoon = Math.abs(local.hours() - 12);
            if (!days[dayKey] || distanceFromNoon < days[dayKey].distance) {
                days[dayKey] = { item: item, local: local, distance: distanceFromNoon };
            }
        });

        $("#fiveDayForecast").empty();

        Object.keys(days).sort().slice(0, 5).forEach(function(dayKey) {
            let day = days[dayKey];
            let fiveDayDiv = $("<div>").attr("class", "fiveDayForecast");

            fiveDayDiv.append($("<h5>").text(day.local.format("L")));
            fiveDayDiv.append(
                $("<img>")
                    .attr("src", `https://openweathermap.org/img/wn/${day.item.weather[0].icon}@2x.png`)
                    .attr("alt", day.item.weather[0].description)
            );
            fiveDayDiv.append($("<p>").html(`Temp: ${Math.round(day.item.main.temp)}&#176;F`));
            fiveDayDiv.append($("<p>").text(`Humidity: ${day.item.main.humidity}%`));
            $("#fiveDayForecast").append(fiveDayDiv);
        });
    }).fail(function() {
        $("#fiveDayForecast").empty().append(
            $("<p>").text("Forecast is unavailable right now.")
        );
    });
};

// ---------- startup ----------

loadHistory().forEach(renderCityButton);

let lastCity = null;
try {
    lastCity = localStorage.getItem(LAST_CITY_KEY);
} catch (e) {
    lastCity = null;
}
// older versions of the app could save the literal string "null"
if (lastCity && lastCity !== "null") {
    renderCityButton(lastCity);
    cityWeatherInfo(lastCity);
}
