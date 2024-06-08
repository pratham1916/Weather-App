const weatherAppAPI = "c0d290eeee9dd399b017a6d2ba64be7e";
const googleMapAPI = "AIzaSyAq15HbfCRMW7RqNb5LUNyOLyfzpYI0wl4";

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchButton = document.getElementById('searchButton');
    const locationButton = document.getElementById('locationButton');
    const mapContainer = document.getElementById('mapContainer');
    const bodyContainer = document.getElementById('bodyContainer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorMessage = document.getElementById('errorMessage');

    const celsius = (x) => (x - 273.15).toFixed(2);

    const myToast = (message) => {
        errorMessage.innerText = `${message}`;
        errorMessage.style.display = 'block';
        loadingOverlay.style.display = 'none';
    };


    const displayWeather = (data) => {
        const weatherDetails = document.getElementById('weatherDetails');
        const weatherType = data.weatherData.weather[0].main.toLowerCase();
        let backgroundUrl = '';
        let weatherIcon = '';

        switch (weatherType) {
            case 'clear':
                backgroundUrl = 'url("images/clear-weather.jpg")';
                weatherIcon = '<i class="fas fa-sun"></i>';
                break;
            case 'clouds':
                backgroundUrl = 'url("images/cloud-weather.jpg")';
                weatherIcon = '<i class="fas fa-cloud"></i>';
                break;
            case 'rain':
                backgroundUrl = 'url("images/rain-weather.jpg")';
                weatherIcon = '<i class="fas fa-cloud-showers-heavy"></i>';
                break;
            case 'snow':
                backgroundUrl = 'url("images/snow-weather.jpg")';
                weatherIcon = '<i class="fas fa-snowflake"></i>';
                break;
            case 'thunderstorm':
                backgroundUrl = 'url("images/thunderstorm-weather.jpg")';
                weatherIcon = '<i class="fas fa-bolt"></i>';
                break;
            case 'drizzle':
                backgroundUrl = 'url("images/drizzle-weather.jpg")';
                weatherIcon = '<i class="fas fa-cloud-rain"></i>';
                break;
            case 'haze':
                backgroundUrl = 'url("images/haze-weather.jpg")';
                weatherIcon = '<i class="fas fa-smog"></i>';
                break;
            default:
                backgroundUrl = 'url("images/default.jpg")';
                weatherIcon = '<i class="fas fa-cloud"></i>';
                break;
        }

        weatherDetails.style.backgroundImage = backgroundUrl;
        weatherDetails.style.backgroundSize = 'cover';
        weatherDetails.style.backgroundPosition = 'center';
        weatherDetails.innerHTML = `
        <div class="weather-data1">
            <div class="weather-icon">${weatherIcon}</div>
            <div class="temperature">
                <span>${Math.round(data.weatherData.main.temp - 273)}</span><sup>o</sup> <span>C</span>
            </div>
        </div>
        <div class="weather-data2">
            <h2>${data.weatherData.name}</h2>
            
            <h2>${data.weatherData.weather[0].main}</h2>
        </div>
    `;
    };


    const displayTotalDetails = (data) => {
        const totalDetails = document.getElementById('totalDetails');
        totalDetails.innerHTML = `
            <div class="detail-item"><span>Felt Temp.</span><span>${celsius(data.weatherData.main.feels_like)}<sup>o</sup> C</span></div>
            <div class="detail-item"><span>Humidity</span><span>${data.weatherData.main.humidity}%</span></div>
            <div class="detail-item"><span>Wind</span><span>${(data.weatherData.wind.speed * 3.6).toFixed(2)} Km/h</span></div>
            <div class="detail-item"><span>Visibility</span><span>${(data.weatherData.visibility * 0.001).toFixed(2)} Km</span></div>
            <div class="detail-item"><span>Max Temp.</span><span>${celsius(data.weatherData.main.temp_max)}<sup>o</sup> C</span></div>
            <div class="detail-item"><span>Min Temp.</span><span>${celsius(data.weatherData.main.temp_min)}<sup>o</sup> C</span></div>
        `;
    }

    const displayForecast = (forecastData) => {
        const forecast = document.getElementById('forecast');
        forecast.innerHTML = forecastData.map(day => {
            const date = new Date(day.dt * 1000);
            const formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            return `
                <div class="forecast-item">
                    <div class="forecast-item-top">
                        <h2>${formattedDate}</h2>
                        <p>${dayName}</p>
                    </div>
                    <div class="forecast-item-bottom">
                        <p><i class="fa-solid fa-sun"></i>${Math.round(day.temp.day)}<sup>o</sup> C</p>
                        <p><i class="fa-solid fa-moon"></i>${Math.round(day.temp.night)}<sup>o</sup> C</p>
                        <h2>${day.weather[0].main}</h2>
                    </div>
                </div>
            `;
        }).join('');
    };


    const displayMap = (city) => {
        mapContainer.innerHTML = `
            <iframe
                width="100%"
                height="300"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed/v1/place?key=${googleMapAPI}&q=${city}">
            </iframe>
        `;
    };

    const getWeatherByCity = async (city) => {
        try {
            showLoading();
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAppAPI}`);
            if (!weatherResponse.ok) {
                myToast("City data doesn't exist");
                return;
            }
            const weatherData = await weatherResponse.json();
            const { lon, lat } = weatherData.coord;

            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${weatherAppAPI}`);
            if (!forecastResponse.ok) {
                myToast("Forecast data fetch error");
                return;
            }
            const forecastData = await forecastResponse.json();
            const payload = { weatherData, forecastData: forecastData.daily };

            displayWeather(payload);
            displayTotalDetails(payload);
            displayForecast(payload.forecastData);
            displayMap(city);

            loadingOverlay.style.display = 'none';
            bodyContainer.style.display = 'block';

        } catch (err) {
            console.error(err);
            myToast(err.message);
        }
    };

    const getWeatherByLocation = async () => {
        const success = async (position) => {
            try {
                showLoading();

                const { latitude, longitude } = position.coords;
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherAppAPI}`);
                if (!weatherResponse.ok) {
                    myToast("Weather data fetch error");
                    return;
                }
                const weatherData = await weatherResponse.json();

                const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${weatherAppAPI}`);
                if (!forecastResponse.ok) {
                    myToast("Forecast data fetch error");
                    return;
                }
                const forecastData = await forecastResponse.json();
                const payload = { weatherData, forecastData: forecastData.daily };

                displayWeather(payload);
                displayTotalDetails(payload);
                displayForecast(payload.forecastData);
                displayMap(weatherData.name);

                loadingOverlay.style.display = 'none';
                bodyContainer.style.display = 'block';

            } catch (err) {
                console.error(err);
                myToast("Failed to fetch location weather data");
            }
        };

        const error = (err) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            myToast("Please turn on your location");
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            myToast("Geolocation is not supported by this browser.");
        }
    };

    const showLoading = () => {
        loadingOverlay.style.display = 'block';
        bodyContainer.style.display = 'none';
        errorMessage.style.display = 'none';
    };

    const handleInputChange = () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            myToast("Please enter a city name");
            bodyContainer.style.display = 'none';
        }
    };

    const handleLocationData = () => {
        getWeatherByLocation();
    };

    const checkAndFetchLocationWeather = () => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted') {
                    getWeatherByLocation();
                } else if (result.state === 'prompt') {
                    handleLocationData();
                } else {
                    myToast("Location access denied");
                }
            });
        } else {
            myToast("Geolocation permissions API not supported");
        }
    };

    searchButton.addEventListener('click', handleInputChange);

    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleInputChange();
        }
    });

    locationButton.addEventListener('click', handleLocationData);

    checkAndFetchLocationWeather();
    bodyContainer.style.display = 'none';
});
