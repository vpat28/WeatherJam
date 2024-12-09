import './style.css'

//API KEY: abb58a5c63ca46dfad6150352240512

const searchbar = document.querySelector(".searchbar");
const cityElement = document.getElementById("city");
const dateElement = document.getElementById("date");
const timeElement = document.getElementById("time");
const tempElement = document.getElementById("todays-weather");
const weatherDesc = document.getElementById("weather-desc");
const humidityElement = document.getElementById("humidity");
const windspeedElement = document.getElementById("windspeed");
const weatherIcon = document.getElementById("weather-icon");
const feelsLikeElement = document.getElementById("feels-like");
const high = document.getElementById("high");
const low = document.getElementById("low");

const weeklyForecastContainer = document.getElementById("weekly-forecast");
//const hourlyForecastContainer = document.getElementById("hourly-forecast");
const hourlyForecastContainer = document.querySelector(".hourly-fc-reel");

const country = document.getElementById("country")
const localTime = document.getElementById("time");

const searchHistoryDropdown = document.getElementById("search-history");
const localStorageKey = "weatherSearchHistory";

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

    // Populate main weather container elements
    cityElement.textContent = `${data.location.name}, ${data.location.region}`;
    country.textContent = data.location.country;
    tempElement.innerHTML = `${data.current.temp_f}° F`;
    weatherDesc.textContent = data.current.condition.text;
    humidityElement.textContent = `${data.current.humidity}%`;
    feelsLikeElement.textContent = data.current.feelslike_f;
    windspeedElement.textContent = data.current.wind_mph + " mph";
    weatherIcon.src = data.forecast.forecastday[0].day.condition.icon;

    let highValue = Math.max(data.forecast.forecastday[0].day.maxtemp_f, data.current.temp_f);
    let lowValue = Math.min(data.forecast.forecastday[0].day.mintemp_f, data.current.temp_f);

    // Populate high-low elements
    high.textContent = highValue;
    low.textContent = lowValue;

    // Calculatge marker position as a percentage
    const range = highValue - lowValue;
    const currTemp = data.current.temp_f;

    // Avoid division by zero in case high == low
    let markerPosition = 0;
    if (range !== 0) {
        markerPosition = ((highValue - currTemp) / range) * 100;
    }

    const clampedPosition = Math.max(0, Math.min(markerPosition, 100));     // Clamp the position to stay within bounds (0% to 100%)

    // Set the marker's position
    const highlowMarker = document.querySelector('.highlow-marker');
    highlowMarker.style.position = 'absolute';
    highlowMarker.style.left = `${clampedPosition}%`;

    
    // Populate date and time elements
    dateElement.textContent = getFormattedDate();
    timeElement.textContent = getCurrentTime();

    // Populate widgets
    populateWeeklyForecast(data);
    updateHourly(data);
    renderHourlyChart(data);
    populateMoreStats(data);
};



// { LISTENER FOR 'ENTER' KEY IN SEARCHBAR }
searchbar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchbar.value.trim();
        if (city) {
            saveToSearchHistory(city);
            getWeather(city,7);
            searchHistoryDropdown.classList.add("hidden");
        } else {
            alert("Please enter a city name.");
        }
    }
});


// { FUNCTION TO RETURN TODAY'S DATE }
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


// { FUNCTION TO RETURN CURRENT TIME }
function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Determine AM/PM and convert hours to 12-hour format
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 (midnight) to 12

    return `${hours}:${minutes} ${amPm}`;
}


// { FUNCTION RUNS ON PAGE INITIALIZATION }
document.addEventListener("DOMContentLoaded", function() {
    updateSearchHistoryUI();
    // Default search
    getWeather("Deerfield Beach", 7);
});


function trimTime(bigTimeString,isNum){
    var trimmedTime = "";
    for (var i = 5; i > 0; i--) {
        if (i ==3 && isNum) {
            trimmedTime = trimmedTime + ".";
        }
        else {
            trimmedTime = trimmedTime + bigTimeString[bigTimeString.length - i];
        }
    }

    return trimmedTime;
}


// { FUNCTION TO POPULATE HOURLY FORECAST }
const updateHourly = (data) => {
    if (!hourlyForecastContainer) {
        console.error("hourlyForecastContainer is null. Check the HTML and ensure the class is correct.");
        return;
    }
  
    hourlyForecastContainer.textContent = "";
  
    const currentTime = new Date(data.location.localtime);
    const currentHour = currentTime.getHours();
    timeElement.textContent = "Local Time: " + trimTime(data.location.localtime,false);
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
        <p>${hourTemp}° <span class="scale-temp">F</span></p>
        `;

        // Append to the hourly forecast reel
        hourlyForecastContainer.appendChild(hourCard);
    }
};


// { FUNCTION TO POPULATE WEEKLY FORECAST WIDGET }
const populateWeeklyForecast = (data) => {
    // console.log(weeklyForecastContainer);
    if (!weeklyForecastContainer) {
        console.error("weeklyForecastContainer is null. Check the HTML and ensure the ID is correct.");
        return;
    }

    weeklyForecastContainer.textContent = "";

    data.forecast.forecastday.forEach((day, index) => {
        // Create a new forecast row
        const forecastRow = document.createElement("div");
        forecastRow.className = "forecast-row";

        // Format the day
        const date = new Date(day.date + "T00:00:00");
        const options = { weekday: "short" };
        const dayName = date.toLocaleDateString(undefined, options);

        // Build the forecast row content
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


// { FUNCTION TO POPULATE OTHER STATS WIDGET }
const populateMoreStats = (data) => {
    const sunrise = document.getElementById("sunrise");
    const sunset = document.getElementById("sunset");
    const chanceRain = document.getElementById("chance-rain");
    const totalRain = document.getElementById("total-rain");
    const chanceSnow = document.getElementById("chance-snow");
    const totalSnow = document.getElementById("total-snow");
    const maxWind = document.getElementById("max-wind");
    const uvIndex = document.getElementById("uv-index");

    sunrise.textContent = data.forecast.forecastday[0].astro.sunrise;
    sunset.textContent = data.forecast.forecastday[0].astro.sunset;
    chanceRain.textContent = data.forecast.forecastday[0].day.daily_chance_of_rain + "%";
    totalRain.textContent = data.forecast.forecastday[0].day.totalprecip_in + " in";
    chanceSnow.textContent = data.forecast.forecastday[0].day.daily_chance_of_snow + "%";
    totalSnow.textContent = Math.round((data.forecast.forecastday[0].day.totalsnow_cm / 2.54) * 100) / 100 + " in";
    maxWind.textContent = data.forecast.forecastday[0].day.maxwind_mph + " mph";
    uvIndex.textContent = data.forecast.forecastday[0].day.uv;
}

const renderHourlyChart = async (data) => {
    try {
        await loadChartJs(); // Load Chart.js dynamically
        console.log("Chart.js loaded, rendering chart...");

        const ctx = document.getElementById("hourlyTempChart").getContext("2d");

        const hourlyLabels = data.forecast.forecastday[0].hour.map((hour) => {
            const time = new Date(hour.time);
            return time.toLocaleTimeString([], { hour: "numeric", hour12: true });
        });

        const hourlyTemperatures = data.forecast.forecastday[0].hour.map(
            (hour) => hour.temp_f
        );

        console.log("Hourly Labels:", hourlyLabels);
        console.log("Hourly Temperatures:", hourlyTemperatures);
  
        new Chart(ctx, {
            type: "line",
            data: {
                labels: hourlyLabels,
                datasets: [
                {
                    label: "Temperature (°F)",
                    data: hourlyTemperatures,
                    borderColor: "#007BFF",
                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: "#007BFF",
                    fill: true, 
                },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // Prevents the chart from stretching vertically
                scales: {
                x: {
                    grid: { display: false },
                },
                y: {
                    grid: { color: "#e0e0e0" },
                    ticks: { beginAtZero: false },
                },
                },
                plugins: {
                legend: { display: false },
                },
            },
        });
    } 
    catch (error) {
        console.error("Error rendering chart:", error);
    }
};
  
  
const loadChartJs = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => {
            console.log("Chart.js loaded successfully");
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Chart.js"));
        document.head.appendChild(script);
    });
};

// Search History Functionality

const saveToSearchHistory = (city) => {
    const history = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  
    // Avoid duplicates
    if (!history.includes(city)) {
      history.unshift(city); // Add to beginning
      if (history.length > 5) history.pop(); // Limit to last 5 searches
      localStorage.setItem(localStorageKey, JSON.stringify(history));
    }
  
    updateSearchHistoryUI();
  };

// Update the search history dropdown
const updateSearchHistoryUI = () => {
    const history = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    searchHistoryDropdown.innerHTML = ""; // Clear existing dropdown
  
    // Clear Search Button Functionality
    if (history.length > 0) {
        const clearButton = document.createElement("button");
        clearButton.textContent = "Clear Search History";
        clearButton.addEventListener("click", () => {
        localStorage.removeItem(localStorageKey);
        searchHistoryDropdown.innerHTML = "";
        searchHistoryDropdown.classList.add("hidden");
    });
    searchHistoryDropdown.appendChild(clearButton);
  }

    history.forEach((city) => {
      const listItem = document.createElement("li");
      listItem.textContent = city;
      listItem.addEventListener("click", () => {
        searchbar.value = city;
        searchHistoryDropdown.classList.add("hidden");
        getWeather(city, 7); // Trigger search
      });
      searchHistoryDropdown.appendChild(listItem);
    });
  
      searchHistoryDropdown.classList.add("hidden");
  };

// Show dropdown on search bar focus
searchbar.addEventListener("focus", () => {
    const history = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    if (history.length > 0) {
      searchHistoryDropdown.classList.remove("hidden");
    }
});

// Hide dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!searchbar.contains(e.target) && !searchHistoryDropdown.contains(e.target)) {
      searchHistoryDropdown.classList.add("hidden");
    }
});

// Prevent hiding when interacting with dropdown
searchHistoryDropdown.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent click event from bubbling up
});