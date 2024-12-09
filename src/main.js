import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

//API KEY: abb58a5c63ca46dfad6150352240512

const searchBar = document.querySelector(".searchbar");
const cityElement = document.getElementById("city");
const dateElement = document.getElementById("date");
const timeElement = document.getElementById("time");
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
//const hourlyForecastContainer = document.getElementById("hourly-forecast");
const hourlyForecastContainer = document.querySelector(".hourly-fc-reel");

const country = document.getElementById("country")
const localTime = document.getElementById("time");

const API_KEY = "abb58a5c63ca46dfad6150352240512";
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";


const getWeather = async (city,days) => {
    console.log(city,days);
    var data = "";
    console.log("URL: " + `${BASE_URL}?key=${API_KEY}&q=${city}&days=${days}&aqi=yes`);

    try 
    {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${city}&days=${days}&aqi=yes`);
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

    // Set date and time
    dateElement.textContent = getFormattedDate();
    timeElement.textContent = getCurrentTime();

    // Forecast stuff
    updateForecast(data);
    updateHourly(data);
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
    const month = today.toLocaleString('default', { month: 'short' });

    // Return the formatted date
    return `${month} ${day}, ${year}`;
}

function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Determine AM/PM and convert hours to 12-hour format
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 (midnight) to 12

    return `${hours}:${minutes} ${amPm}`;
}

// On initialization
document.addEventListener("DOMContentLoaded", function() {
    // Default search
    getWeather("Deerfield Beach", 7);
});

function trimTime(bigTimeString,isNum){
    var trimmedTime = ""
    for (var i = 5; i > 0; i--) {
      if(i ==3 && isNum){
        trimmedTime = trimmedTime + "."
      }else{
        trimmedTime = trimmedTime + bigTimeString[bigTimeString.length - i];
      }
      
  }
  
  console.log("IN METHOD: " + trimmedTime)
  return trimmedTime
}

// const updateHourly = (data) =>{
//     console.log(hourlyForecastContainer);
//     if (!hourlyForecastContainer) {
//         console.error("hourlyForecastContainer is null. Check the HTML and ensure the ID is correct.");
//         return;
//       }
//       hourlyForecastContainer.textContent = ""
//       const bigTimeString = data.location.localtime;
//       console.log(bigTimeString)
//       console.log(bigTimeString[11])
//       var currTime = ""
//       var numTime = " "
   
//     currTime = trimTime(bigTimeString,false);
//     console.log(currTime);
//     numTime = trimTime(bigTimeString,true);
//     // console.log(trimTime)
//     localTime.textContent = "Local Time " + currTime;
//     const startHourlyFrom = Math.ceil(Number(numTime) + Number.EPSILON);
//       console.log(startHourlyFrom);
//       for(var i = startHourlyFrom; i<=23;i++){
//         const hourRow =document.createElement("div");
//         hourRow.className = "hour-row";
//         const time = data.forecast.forecastday[0].hour[i].time;
//         const temp =data.forecast.forecastday[0].hour[i].temp_f;
//         console.log()
//         hourRow.innerHTML = `
//         <div class="fc-hour">
//             ${trimTime(time,false)}
//         </div>
//         <div class="fc-hourtemp">
//             <p id="fc-temp">${temp}°F</p>
            
//         </div>
//       `;
  
      
//       hourlyForecastContainer.appendChild(hourRow);
//       }
//     const midnightMessageRow = document.createElement("div");
//     midnightMessageRow.className = "hour-row special-message";
//     midnightMessageRow.innerHTML = `
//         <div class="fc-hour">
//             24:00
//         </div>
//         <div class="fc-hourtemp">
//             <p id="fc-temp">The hourly forecast will be updated at midnight!</p>
//         </div>
//     `;

//     hourlyForecastContainer.appendChild(midnightMessageRow);
// }

const updateHourly = (data) => {
    if (!hourlyForecastContainer) {
      console.error("hourlyForecastContainer is null. Check the HTML and ensure the class is correct.");
      return;
    }
  
    // Clear any existing content
    hourlyForecastContainer.textContent = "";
  
    // Get the current hour
    const currentTime = new Date(data.location.localtime);
    const currentHour = currentTime.getHours();
  
    // Populate hourly forecast from the current hour
    for (let i = currentHour; i < data.forecast.forecastday[0].hour.length; i++) {
      const hourData = data.forecast.forecastday[0].hour[i];
      const hourTime = new Date(hourData.time).toLocaleTimeString([], { hour: "numeric", hour12: true });
      const hourTemp = hourData.temp_f;
      const hourIcon = hourData.condition.icon;
  
      // Create hourly forecast card
      const hourCard = document.createElement("div");
      hourCard.className = "hour-fc";
      hourCard.innerHTML = `
        <p>${hourTime}</p>
        <img src="${hourIcon}" alt="Weather Icon" draggable="false">
        <p>${hourTemp}°F</p>
      `;
  
      // Append to the hourly forecast reel
      hourlyForecastContainer.appendChild(hourCard);
    }
  };
  
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
            <img src="${day.day.condition.icon}" alt="icon">
            ${dayName}
        </div>
        <div class="fc-highlow">
            <p id="fc-high">${day.day.maxtemp_f}°</p>
            <p id="fc-low">${day.day.mintemp_f}°</p>
        </div>
      `;
  
      // Append the row to the weekly forecast container
      weeklyForecastContainer.appendChild(forecastRow);
    });
  };
  

//const getPrecipitation = ()