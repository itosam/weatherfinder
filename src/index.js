const body = document.body;
const searchInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherBg = document.querySelector(".weather-bg");
const toggle = document.querySelector(".toggle");
const toggleIcon = document.querySelector(".toggle-icon");
const tempText = document.querySelector(".temp");
const humidityText = document.querySelector(".humidity");
const windText = document.querySelector(".wind");
const statusText = document.querySelector(".status");

const defaultCity = "New York";
const darkModeStorageKey = "weatherfinder-dark-mode";

const weatherTypes = {
  clear: {
    icon: "assets/weather/sun.png",
    background: "suncloud-background",
    bgImage: "assets/weather/bgcloud.svg",
  },
  cloudy: {
    icon: "assets/weather/cloud.svg",
    background: "suncloud-background",
    bgImage: "assets/weather/bgcloud.svg",
  },
  rainy: {
    icon: "assets/weather/rain.png",
    background: "rain-background",
    bgImage: "assets/weather/bgcloud.svg",
  },
  snowy: {
    icon: "assets/weather/snowflake.png",
    background: "rain-background",
    bgImage: "assets/weather/bgcloud.svg",
  },
  stormy: {
    icon: "assets/weather/storm.png",
    background: "rain-background",
    bgImage: "assets/weather/bgcloud.svg",
  },
};

function getWeatherType(code) {
  if (code === 0) return "clear";
  if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snowy";
  if (code >= 95 && code <= 99) return "stormy";
  return "cloudy";
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function updateBackground(type) {
  body.classList.remove("suncloud-background", "rain-background");
  body.classList.add(weatherTypes[type].background);
  weatherIcon.src = weatherTypes[type].icon;
  weatherBg.src = weatherTypes[type].bgImage;
}

function setDarkMode(isDarkMode) {
  body.classList.toggle("dark-mode", isDarkMode);
  toggle.setAttribute("aria-pressed", String(isDarkMode));
  toggle.setAttribute("aria-label", isDarkMode ? "Switch to light mode" : "Switch to dark mode");
  toggleIcon.src = isDarkMode ? "assets/toggle2.png" : "assets/toggle.png";
  localStorage.setItem(darkModeStorageKey, String(isDarkMode));
}

async function getLocation(query) {
  const params = new URLSearchParams({
    name: query,
    count: "1",
    language: "en",
    format: "json",
  });
  const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);

  if (!resp.ok) {
    throw new Error("Unable to search for that location.");
  }

  const data = await resp.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No matching city found. Try a city name like Boston or Denver.");
  }

  return data.results[0];
}

async function getWeather(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
  });
  const resp = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!resp.ok) {
    throw new Error("Unable to load weather for that location.");
  }

  return resp.json();
}

async function checkWeather(city = defaultCity) {
  const query = city.trim();

  if (!query) {
    setStatus("Enter a city or ZIP code to search.", true);
    searchInput.focus();
    return;
  }

  setStatus("Loading weather...");
  searchBtn.disabled = true;

  try {
    const location = await getLocation(query);
    const data = await getWeather(location);
    const current = data.current;
    const type = getWeatherType(current.weather_code);

    tempText.textContent = `It's ${Math.round(current.temperature_2m)}°`;
    humidityText.textContent = `${current.relative_humidity_2m}% Humidity`;
    windText.textContent = `${Math.round(current.wind_speed_10m)}mph Wind Speed`;
    searchInput.value = location.name;
    setStatus(`${location.name}${location.admin1 ? `, ${location.admin1}` : ""}`);
    updateBackground(type);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchInput.value);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkWeather(searchInput.value);
  }
});

toggle.addEventListener("click", () => {
  setDarkMode(!body.classList.contains("dark-mode"));
});

setDarkMode(localStorage.getItem(darkModeStorageKey) === "true");
checkWeather(defaultCity);
