const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchBtn');

const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

const apiKey = '9a56c8c863706ef9cddc09777ebb2622'; // Replace with your OpenWeatherMap API key

searchButton.addEventListener('click',async () => {
    const city = cityInput.value.trim();

    

    if(city==='') {
        alert('Please enter a city name');
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        
       const response = await fetch(url);
       
       const data = await response.json();
       console.log(data);

       if(data.cod !==200)  {
        cityName.textContent = 'City not found';
        temperature.textContent = '';
        description.textContent = '';
        humidity.textContent = '';
        wind.textContent = '';
        return;
       }

         cityName.textContent = data.name;
            temperature.textContent = `Temperature: ${data.main.temp} °C`;
            description.textContent = `Description: ${data.weather[0].description}`;
            humidity.textContent = `Humidity: ${data.main.humidity}%`;
            wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    } catch (error) {
        cityName.textContent = 'Error'
        temperature.textContent = 'Temperature: --';
        description.textContent = 'Condition: something went wrong';
        humidity.textContent = 'Humidity: --';
        wind.textContent = 'Wind: --';
    }
});

    cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
    });     

