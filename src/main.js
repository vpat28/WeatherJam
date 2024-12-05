import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

//API KEY: abb58a5c63ca46dfad6150352240512

const searchBar = document.querySelector(".searchbar");
const cityElement = document.getElementById("city");
const dateElement = document.getElementById("date");
const tempElement = document.getElementById("todays-weather");
//const weatherDescElement = document.getElementById("weather-desc");
const humidityElement = document.getElementById("humidity");
const windspeedElement = document.getElementById("windspeed");
const weatherIcon = document.getElementById("weather-icon");
const feelsLikeElement = document.getElementById("feels-like");
const high = document.getElementById("high");
const low = document.getElementById("low");
const precipitation = document.getElementById("precipitation");
const snow = document.getElementById("snow");

const weeklyForecastContainer = document.getElementById("weekly-forecast");

const country = document.getElementById("country")

const API_KEY = "abb58a5c63ca46dfad6150352240512";
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";


const getWeather = async (city,days) => {
    console.log(city,days);
    var data = "";
    console.log("URL: " + `${BASE_URL}?key=${API_KEY}&q=${city}&days=${days}&aqi=no`);

    try 
    {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${city}&days=${days}&aqi=no`);
        if (!response.ok) throw new Error("Failed to fetch weather data");
        data = await response.json();
        console.log(data);
    } 
    catch (error) 
    {
        console.error("Error fetching weather data:", error);
        alert("Could not fetch weather data. Please try again.");
    }

    cityElement.textContent = `${data.location.name}, ${data.location.region}`;
    tempElement.textContent = `${data.current.temp_f}° F`;
    humidityElement.textContent = `${data.current.humidity}%`;
    feelsLikeElement.textContent = data.current.feelslike_f;
    windspeedElement.textContent = data.current.wind_mph + " mph";
    weatherIcon.src = data.forecast.forecastday[0].day.condition.icon
    high.textContent = data.forecast.forecastday[0].day.maxtemp_f;
    low.textContent = data.forecast.forecastday[0].day.mintemp_f;
    precipitation.textContent = data.forecast.forecastday[0].day.daily_chance_of_rain + "%";
    snow.textContent = data.forecast.forecastday[0].day.daily_chance_of_snow + "%";
    country.textContent = data.location.country;
    console.log("CHECKING DATE:     " + data.forecast.forecastday[1]);
    //console.log("slay" + data.forecast.forecastday[1].day.condition.icon);

    // Forecast stuff
    updateForecast(data);
};



// Listen for Enter key press in the search bar
searchBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBar.value.trim();
        if (city) {
            getWeather(city,7);
        } else {
            alert("Please enter a city name.");
        }
    }
});

// Get today's date
function getFormattedDate() {
    const today = new Date();

    // Get the day, month, and year
    const day = today.getDate();
    const year = today.getFullYear();

    // Format the month name
    const month = today.toLocaleString('default', { month: 'long' });

    // Return the formatted date
    return `${month} ${day}, ${year}`;
}

// On initialization
document.addEventListener("DOMContentLoaded", function() {
    // Set date
    dateElement.textContent = getFormattedDate();

    // Default search
    getWeather("Deerfield Beach", 7);
});





const updateForecast = (data) => {

    console.log(weeklyForecastContainer);
    if (!weeklyForecastContainer) {
        console.error("weeklyForecastContainer is null. Check the HTML and ensure the ID is correct.");
        return;
      }

    weeklyForecastContainer.textContent = "";
    //console.log(data.forecast.forecastday[1]);
    
    data.forecast.forecastday.forEach((day, index) => {
      // Create a new forecast row
      const forecastRow = document.createElement("div");
      forecastRow.className = "forecast-row";
  
      // Format the day
      const date = new Date(day.date);
      const options = { weekday: "short" };
      const dayName = date.toLocaleDateString(undefined, options);
  
      // Build the forecast row content
      // <img src="${day.condition.icon}" alt="icon">
      forecastRow.innerHTML = `
        <div class="fc-day">
            ${dayName}
        </div>
        <div class="fc-highlow">
            <p id="fc-high">H: ${day.day.maxtemp_f}°</p>
            <p id="fc-low">L: ${day.day.mintemp_f}°</p>
        </div>
      `;
  
      // Append the row to the weekly forecast container
      weeklyForecastContainer.appendChild(forecastRow);
    });
  };
  

//const getPrecipitation = ()