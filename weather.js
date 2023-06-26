const form = document.querySelector(".js-city-form");
let cityInputField = document.querySelector('[name="city"]');
let errorField = document.querySelector(".js-error");
let citySection = document.querySelector(".js-city-data");
let weatherSection = document.querySelector(".js-weather-data");

function getCityEndpoint(cityName) {
    return `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`;
}

function getWeatherEndpoint(latitude, longitude) {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York`;
}

function renderCity(cityData) {
    citySection.innerHTML = `
        <h2>${cityData.name}</h2>
        <p>Latitude: ${cityData.latitude}</p>
        <p>Longitude: ${cityData.longitude}</p>
        <p>Elevation: ${cityData.elevation}</p>
        <p>Timezone: ${cityData.timezone}</p>
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
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>`;

    return html;
}

function renderWeather(weatherData) {
    weatherSection.innerHTML = generate7DayForecast(weatherData.daily, weatherData.daily_units);
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
                console.log(cityData);
            } else {
                errorField.innerText = `Location ${cityName} does not exist.`;
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
