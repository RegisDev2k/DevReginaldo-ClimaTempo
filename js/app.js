
// API key - use your own if you have one
const apiKey = 'fb560290ac4eea65fbe1ea901aa85297'; // This is a demo key, replace with your own

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherContainer = document.getElementById('weather-container');
const forecastContainer = document.getElementById('forecast-container');
const loadingElement = document.querySelector('.loading');
const errorMsg = document.getElementById('error-msg');

// Event listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchWeather();
});

// Initialize with a default city if geolocation is not available
function initializeApp() {
    if (navigator.geolocation) {
        loadingElement.style.display = 'block';
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon);
        }, error => {
            // If geolocation fails, use a default city
            getWeatherByCity('São Paulo');
        });
    } else {
        // Geolocation not supported
        getWeatherByCity('São Paulo');
    }
}

// Get weather data by coordinates
function getWeatherByCoords(lat, lon) {
    loadingElement.style.display = 'block';
    errorMsg.style.display = 'none';

    // Current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível obter os dados do clima');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);

            // Get forecast
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível obter os dados de previsão');
            }
            return response.json();
        })
        .then(forecastData => {
            displayForecast(forecastData);
            loadingElement.style.display = 'none';
        })
        .catch(error => {
            showError(error.message);
            loadingElement.style.display = 'none';
        });
}

// Get weather data by city name
function getWeatherByCity(city) {
    loadingElement.style.display = 'block';
    errorMsg.style.display = 'none';

    // Current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.');
                } else {
                    throw new Error('Não foi possível obter os dados do clima');
                }
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);

            // Get forecast
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível obter os dados de previsão');
            }
            return response.json();
        })
        .then(forecastData => {
            displayForecast(forecastData);
            loadingElement.style.display = 'none';
        })
        .catch(error => {
            showError(error.message);
            loadingElement.style.display = 'none';
        });
}

// Search weather function
function searchWeather() {
    const city = cityInput.value.trim();
    if (city !== '') {
        getWeatherByCity(city);
    } else {
        showError('Por favor, digite o nome de uma cidade.');
    }
}

// Display current weather data
function displayWeather(data) {
    const location = document.getElementById('location');
    const date = document.getElementById('date');
    const temperature = document.getElementById('temperature');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherCondition = document.getElementById('weather-condition');
    const feelsLike = document.getElementById('feels-like');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const pressure = document.getElementById('pressure');
    const lastUpdated = document.getElementById('last-updated');

    // Format the date
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('pt-BR', options);

    // Set values
    location.textContent = `${data.name}, ${data.sys.country}`;
    date.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    weatherCondition.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    pressure.textContent = `${data.main.pressure} hPa`;

    // Format time of update
    const updateTime = new Date();
    lastUpdated.textContent = `Atualizado: ${updateTime.getHours().toString().padStart(2, '0')}:${updateTime.getMinutes().toString().padStart(2, '0')}`;

    // Show the weather container
    weatherContainer.style.display = 'block';
}

// Display forecast data
function displayForecast(data) {
    const forecastItems = document.getElementById('forecast-items');
    forecastItems.innerHTML = ''; // Clear previous forecast

    // Get data for the next 5 days (by taking one reading per day)
    const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';

        forecastItem.innerHTML = `
                    <div class="forecast-day">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</div>
                    <div class="forecast-icon">
                        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" width="50">
                    </div>
                    <div class="forecast-temp">
                        <span class="forecast-max">${Math.round(day.main.temp_max)}°</span>
                        <span class="forecast-min">${Math.round(day.main.temp_min)}°</span>
                    </div>
                `;

        forecastItems.appendChild(forecastItem);
    });

    // Show the forecast container
    forecastContainer.style.display = 'block';
}

// Show error message
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';

    // Hide the containers if there's an error
    weatherContainer.style.display = 'none';
    forecastContainer.style.display = 'none';
}

// Initialize the app
initializeApp();
