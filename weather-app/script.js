const cityInput = document.getElementById('cityInput');
const stateSelect = document.getElementById('stateSelect');
const cityPreset = document.getElementById('cityPreset');
const languageSelect = document.getElementById('languageSelect');
const searchButton = document.getElementById('searchBtn');
const unitButton = document.getElementById('unitBtn');
const shareButton = document.getElementById('shareBtn');
const cityLabel = document.getElementById('cityLabel');
const stateLabel = document.getElementById('stateLabel');
const quickPickLabel = document.getElementById('quickPickLabel');
const languageLabel = document.getElementById('languageLabel');

const weatherCard = document.getElementById('weatherCard');
const weatherStatus = document.getElementById('weatherStatus');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feelsLike');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const weatherIcon = document.getElementById('weatherIcon');
const conditionLabel = document.getElementById('conditionLabel');
const forecastList = document.getElementById('forecastList');

const apiKey = '9a56c8c863706ef9cddc09777ebb2622';
const translations = {
    en: {
        intro: 'Search for a city, choose a state, and view the weather with a clearer, more visual interface.',
        city: 'City',
        state: 'State',
        anyState: 'Any state',
        quickPick: 'Quick pick',
        example: 'Choose an example',
        language: 'Language',
        search: 'Search Weather',
        unitMetric: 'Show Fahrenheit',
        unitImperial: 'Show Celsius',
        share: 'Share',
        ready: 'Ready to explore',
        waiting: 'Waiting for weather',
        pickCity: 'Pick a city',
        chooseCity: 'Choose a city to see the current weather.',
        emptyHint: 'Try a city like Chicago, Miami, or Dallas to load the forecast.',
        feelsLike: 'Feels like',
        humidity: 'Humidity',
        wind: 'Wind',
        condition: 'Condition',
        forecastTitle: '5-Day Forecast',
        forecastCopy: 'Quick summary for the next few days.',
        nowShowing: 'Now showing',
        cityMissing: 'Please enter a city name',
        cityNotFound: 'City not found',
        loadError: 'Error loading weather',
        copied: 'Weather copied to clipboard.',
        noData: 'No weather data yet.',
        forecastLabel: '5-Day Forecast',
        weatherTitle: 'Weather App'
    },
    es: {
        intro: 'Busca una ciudad, elige un estado y mira el clima con una interfaz mas clara, visual y facil de entender.',
        city: 'Ciudad',
        state: 'Estado',
        anyState: 'Cualquier estado',
        quickPick: 'Ejemplo rapido',
        example: 'Elige un ejemplo',
        language: 'Idioma',
        search: 'Buscar clima',
        unitMetric: 'Mostrar Fahrenheit',
        unitImperial: 'Mostrar Celsius',
        share: 'Compartir',
        ready: 'Listo para explorar',
        waiting: 'Esperando clima',
        pickCity: 'Elige una ciudad',
        chooseCity: 'Elige una ciudad para ver el clima actual.',
        emptyHint: 'Prueba una ciudad como Chicago, Miami o Dallas para cargar el pronostico.',
        feelsLike: 'Se siente como',
        humidity: 'Humedad',
        wind: 'Viento',
        condition: 'Condicion',
        forecastTitle: 'Pronostico de 5 dias',
        forecastCopy: 'Resumen rapido para ver que viene en los proximos dias.',
        nowShowing: 'Mostrando',
        cityMissing: 'Por favor escribe una ciudad',
        cityNotFound: 'Ciudad no encontrada',
        loadError: 'Error al cargar el clima',
        copied: 'Clima copiado al portapapeles.',
        noData: 'Todavia no hay datos del clima.',
        forecastLabel: 'Pronostico de 5 dias',
        weatherTitle: 'App del Clima'
    }
};
const states = [
    ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
    ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
    ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
    ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
    ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
    ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
    ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
    ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
    ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
    ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
    ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
    ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
    ['WI', 'Wisconsin'], ['WY', 'Wyoming']
];

let currentUnit = 'metric';
let currentLanguage = 'en';
let currentWeatherData = null;
let currentForecastData = [];

function t(key) {
    return translations[currentLanguage][key];
}

function populateStates() {
    stateSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = t('anyState');
    stateSelect.appendChild(defaultOption);

    states.forEach(function(entry) {
        const option = document.createElement('option');
        option.value = entry[0];
        option.textContent = `${entry[1]} (${entry[0]})`;
        stateSelect.appendChild(option);
    });
}

function updateStaticText() {
    document.documentElement.lang = currentLanguage;
    document.title = t('weatherTitle');
    document.querySelector('.intro-copy').textContent = t('intro');
    cityLabel.textContent = t('city');
    stateLabel.textContent = t('state');
    quickPickLabel.textContent = t('quickPick');
    languageLabel.textContent = t('language');
    cityPreset.options[0].textContent = t('example');
    searchButton.textContent = t('search');
    shareButton.textContent = t('share');
    unitButton.textContent = currentUnit === 'metric' ? t('unitMetric') : t('unitImperial');
    document.querySelector('.forecast-heading h2').textContent = t('forecastTitle');
    document.querySelector('.forecast-heading p').textContent = t('forecastCopy');
    document.querySelector('.detail-pill:nth-child(1) span').textContent = t('humidity');
    document.querySelector('.detail-pill:nth-child(2) span').textContent = t('wind');
    document.querySelector('.detail-pill:nth-child(3) span').textContent = t('condition');
}

function convertTemperature(temp) {
    if(currentUnit === 'imperial'){
        return (temp * 9 / 5) + 32;
    }

    return temp;
}

function getUnitSymbol() {
    return currentUnit === 'metric' ? 'C' : 'F';
}

function getSearchQuery() {
    const city = cityInput.value.trim();
    const state = stateSelect.value.trim();

    if(state === ''){
        return city;
    }

    return `${city},${state},US`;
}

function getWeatherTheme(mainCondition) {
    const main = mainCondition.toLowerCase();

    if(main === 'clear'){
        return 'clear';
    }

    if(main === 'clouds'){
        return 'clouds';
    }

    if(main === 'rain' || main === 'drizzle'){
        return 'rain';
    }

    if(main === 'thunderstorm'){
        return 'storm';
    }

    if(main === 'snow'){
        return 'snow';
    }

    return 'mist';
}

function getWeatherEmoji(mainCondition, descriptionText) {
    const main = mainCondition.toLowerCase();
    const text = descriptionText.toLowerCase();

    if(main === 'clear'){
        return '\u2600\uFE0F';
    }

    if(main === 'clouds'){
        return text.includes('few') ? '\u26C5' : '\u2601\uFE0F';
    }

    if(main === 'rain'){
        return '\uD83C\uDF27\uFE0F';
    }

    if(main === 'drizzle'){
        return '\uD83C\uDF26\uFE0F';
    }

    if(main === 'thunderstorm'){
        return '\u26C8\uFE0F';
    }

    if(main === 'snow'){
        return '\u2744\uFE0F';
    }

    if(main === 'mist' || main === 'fog' || main === 'haze' || main === 'smoke'){
        return '\uD83C\uDF2B\uFE0F';
    }

    return '\uD83C\uDF24\uFE0F';
}

function updateWeatherTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);

    weatherCard.classList.remove(
        'weather-clear',
        'weather-rain',
        'weather-clouds',
        'weather-snow',
        'weather-storm',
        'weather-mist'
    );
    weatherCard.classList.add(`weather-${theme}`);
}

function showEmptyMessage(message) {
    updateWeatherTheme('mist');
    weatherStatus.textContent = t('waiting');
    cityName.textContent = message;
    temperature.textContent = '--°';
    feelsLike.textContent = `${t('feelsLike')} --°`;
    description.textContent = t('emptyHint');
    humidity.textContent = '--';
    wind.textContent = '--';
    conditionLabel.textContent = '--';
    weatherIcon.textContent = getWeatherEmoji('clear', 'clear sky');
    forecastList.innerHTML = '';
}

function displayWeather() {
    if(currentWeatherData === null){
        return;
    }

    const temp = convertTemperature(currentWeatherData.main.temp).toFixed(1);
    const feelsTemp = convertTemperature(currentWeatherData.main.feels_like).toFixed(1);
    const stateText = stateSelect.value.trim();
    const weatherMain = currentWeatherData.weather[0].main;
    const weatherDescription = currentWeatherData.weather[0].description;
    const theme = getWeatherTheme(weatherMain);
    const emoji = getWeatherEmoji(weatherMain, weatherDescription);

    updateWeatherTheme(theme);
    weatherStatus.textContent = `${t('nowShowing')} ${weatherMain}`;
    cityName.textContent = stateText === '' ? currentWeatherData.name : `${currentWeatherData.name}, ${stateText.toUpperCase()}`;
    temperature.textContent = `${temp}°${getUnitSymbol()}`;
    feelsLike.textContent = `${t('feelsLike')} ${feelsTemp}°${getUnitSymbol()}`;
    description.textContent = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
    humidity.textContent = `${currentWeatherData.main.humidity}%`;
    wind.textContent = `${currentWeatherData.wind.speed} m/s`;
    conditionLabel.textContent = weatherMain;
    weatherIcon.textContent = emoji;
}

function getFiveDayForecast(list) {
    const dailyForecast = [];
    const usedDates = [];

    list.forEach(function(item){
        const date = item.dt_txt.split(' ')[0];
        const time = item.dt_txt.split(' ')[1];

        if(!usedDates.includes(date) && time === '12:00:00'){
            usedDates.push(date);
            dailyForecast.push(item);
        }
    });

    return dailyForecast.slice(0, 5);
}

function displayForecast() {
    forecastList.innerHTML = '';

    if(currentForecastData.length === 0){
        return;
    }

    currentForecastData.forEach(function(day){
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');

        const date = new Date(day.dt_txt);
        const temp = convertTemperature(day.main.temp).toFixed(1);
        const weatherMain = day.weather[0].main;
        const weatherDescription = day.weather[0].description;
        const emoji = getWeatherEmoji(weatherMain, weatherDescription);

        forecastCard.innerHTML = `
            <h3>${date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
            <p>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <div class="forecast-icon" aria-hidden="true">${emoji}</div>
            <p>${temp}°${getUnitSymbol()}</p>
            <small>${weatherDescription}</small>
        `;

        forecastList.appendChild(forecastCard);
    });
}

function getWeatherSummary() {
    if(currentWeatherData === null){
        return t('noData');
    }

    const forecastText = currentForecastData.map(function(day){
        const date = new Date(day.dt_txt);
        const temp = convertTemperature(day.main.temp).toFixed(1);
        return `${date.toLocaleDateString('en-US')}: ${temp}°${getUnitSymbol()}, ${day.weather[0].description}`;
    }).join('\n');

    return `${cityName.textContent}
${temperature.textContent}
${description.textContent} ${weatherIcon.textContent}
${feelsLike.textContent}
${t('humidity')}: ${humidity.textContent}
${t('wind')}: ${wind.textContent}

${t('forecastLabel')}:
${forecastText}`;
}

async function searchWeather() {
    const city = cityInput.value.trim();

    if(city === '') {
        alert(t('cityMissing'));
        return;
    }

    const query = encodeURIComponent(getSearchQuery());
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric&lang=${currentLanguage}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric&lang=${currentLanguage}`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        const forecastResponse = await fetch(forecastUrl);
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        if(weatherData.cod !== 200)  {
            currentWeatherData = null;
            currentForecastData = [];
            showEmptyMessage(t('cityNotFound'));
            return;
        }

        currentWeatherData = weatherData;
        currentForecastData = Array.isArray(forecastData.list) ? getFiveDayForecast(forecastData.list) : [];

        displayWeather();
        displayForecast();
    } catch (error) {
        currentWeatherData = null;
        currentForecastData = [];
        showEmptyMessage(t('loadError'));
    }
}

cityPreset.addEventListener('change', function() {
    if(cityPreset.value === ''){
        return;
    }

    const parts = cityPreset.value.split(',');
    cityInput.value = parts[0] || '';
    stateSelect.value = parts[1] || '';
});

searchButton.addEventListener('click', searchWeather);

unitButton.addEventListener('click', function(){
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitButton.textContent = currentUnit === 'metric' ? t('unitMetric') : t('unitImperial');
    displayWeather();
    displayForecast();
});

shareButton.addEventListener('click', async function(){
    const text = getWeatherSummary();

    try {
        if(navigator.share){
            await navigator.share({
                title: t('weatherTitle'),
                text: text
            });
            return;
        }

        if(navigator.clipboard){
            await navigator.clipboard.writeText(text);
            alert(t('copied'));
            return;
        }
    } catch(error) {
        console.log('Share was cancelled or blocked.');
    }

    prompt('Copy the weather:', text);
});

cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

languageSelect.addEventListener('change', function() {
    currentLanguage = languageSelect.value;
    updateStaticText();
    populateStates();

    if(currentWeatherData !== null) {
        searchWeather();
        return;
    }

    showEmptyMessage(t('pickCity'));
});

updateStaticText();
populateStates();
showEmptyMessage(t('pickCity'));
