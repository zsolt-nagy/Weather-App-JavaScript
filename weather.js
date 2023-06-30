const form = document.querySelector(".js-city-form");
let cityInputField = document.querySelector('[name="city"]');
let errorField = document.querySelector(".js-error");
let citySection = document.querySelector(".js-city-data");
let weatherSection = document.querySelector(".js-weather-data");

let weatherCodeMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle: Light intensity",
    53: "Drizzle: Moderate intensity",
    55: "Drizzle: Dense intensity",
    56: "Freezing Drizzle: Light intensity",
    57: "Freezing Drizzle: Dense intensity",
    61: "Rain: Slight intensity",
    63: "Rain: Moderate  intensity",
    65: "Rain: Heavy intensity",
    66: "Freezing Rain: Light  intensity",
    67: "Freezing Rain: Geavy intensity",
    71: "Snow fall: Slight intensity",
    73: "Snow fall: Moderate intensity",
    75: "Snow fall: Heavy intensity",
    77: "Snow grains",
    80: "Rain showers: Slight",
    81: "Rain showers: Moderate",
    82: "Rain showers: violent",
    85: "Snow showers slight",
    86: "Snow showers heavy",
    95: "Thunderstorm: Slight",
    96: "Thunderstorm: Moderate",
    99: "Thunderstorm with slight and heavy hail",
};

function getCityEndpoint(cityName) {
    return `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`;
}

function getWeatherEndpoint(latitude, longitude) {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto`;
}

function renderCity(cityData) {
    citySection.innerHTML = `
        <h2>${cityData.name}</h2>
        <p>Latitude: ${cityData.latitude}</p>
        <p>Longitude: ${cityData.longitude}</p>
        <p>Elevation: ${cityData.elevation}</p>
        <p>Country: ${cityData.country}</p>
    `;
}

function getTimeFromIso8601(iso8601String) {
    return iso8601String.split("T")[1];
}

function generate7DayForecast(daily, dailyUnits) {
    let html = `
        <table class="weather-table">
            <thead>
                <tr>
                    <th class="weather-table-cell">Time</th>
                    <th class="weather-table-cell">Min Temperature</th>
                    <th class="weather-table-cell">Max Temperature</th>
                    <th class="weather-table-cell">Sunrise</th>
                    <th class="weather-table-cell">Sunset</th>
                    <th class="weather-table-cell">Precipitation</th>
                    <th class="weather-table-cell">Weather Code</th>
                </tr>
            </thead>
            <tbody>    
    `;

    for (let i = 0; i < daily.time.length; ++i) {
        html += `
            <tr>
                <td class="weather-table-cell">${daily.time[i]}</td>
                <td class="weather-table-cell">${daily.temperature_2m_min[i]} ${dailyUnits.temperature_2m_min}</td>
                <td class="weather-table-cell">${daily.temperature_2m_max[i]} ${dailyUnits.temperature_2m_max}</td>
                <td class="weather-table-cell">${getTimeFromIso8601(daily.sunrise[i])}</td>
                <td class="weather-table-cell">${getTimeFromIso8601(daily.sunset[i])}</td>
                <td class="weather-table-cell">${daily.precipitation_sum[i]} ${dailyUnits.precipitation_sum}</td>
                <td class="weather-table-cell">${weatherCodeMap[daily.weathercode[i]] ?? "-"}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>`;

    return html;
}

function renderWeather(weatherData) {
    weatherSection.innerHTML = `
        <section>Timezone: ${weatherData.timezone}</section>
        ${generate7DayForecast(weatherData.daily, weatherData.daily_units)}
    `;
}

function fetchWeather(cityData) {
    fetch(getWeatherEndpoint(cityData.latitude, cityData.longitude))
        .then((x) => x.json())
        .then(renderWeather); // response is passed as the first argument of renderWeather
}

function fetchCity(cityName) {
    fetch(getCityEndpoint(cityName))
        .then((x) => x.json())
        .then((response) => {
            let results = response.results;
            if (Array.isArray(results) && results.length > 0) {
                let cityData = results[0];
                // 1. Display city data
                renderCity(cityData);
                // 2. Fetch weather data
                fetchWeather(cityData);
            } else {
                errorField.innerText = `Location ${cityName} does not exist.`;
                weatherSection.innerHTML = "";
                citySection.innerHTML = "";
            }
        });
}

function formSubmitted(event) {
    event.preventDefault();

    let city = cityInputField.value.trim();

    if (city.length > 0) {
        errorField.innerText = "";
        cityInputField.value = "";
        fetchCity(city);
    } else {
        errorField.innerText = "Enter a valid city name.";
    }
}

form.addEventListener("submit", formSubmitted);
