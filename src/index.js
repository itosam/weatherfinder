const body = document.body;
const searchInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherBg = document.querySelector(".weather-bg");
const toggle = document.querySelector(".toggle");
const tempText = document.querySelector(".temp");
const humidityText = document.querySelector(".humidity");
const windText = document.querySelector(".wind");
const statusText = document.querySelector(".status");

const defaultCity = "New York";
const unitStorageKey = "weatherfinder-unit";
const unitOptions = {
  imperial: {
    temperatureUnit: "fahrenheit",
    windSpeedUnit: "mph",
    tempLabel: "F",
    windLabel: "mph",
    nextLabel: "Celsius",
  },
  metric: {
    temperatureUnit: "celsius",
    windSpeedUnit: "kmh",
    tempLabel: "C",
    windLabel: "kph",
    nextLabel: "Fahrenheit",
  },
};
let currentWeatherType = "cloudy";
let currentUnit = localStorage.getItem(unitStorageKey) === "metric" ? "metric" : "imperial";
let currentLocation = null;
let currentQuery = defaultCity;

const usStates = {
  al: "Alabama",
  alaska: "Alaska",
  ak: "Alaska",
  arizona: "Arizona",
  az: "Arizona",
  arkansas: "Arkansas",
  ar: "Arkansas",
  california: "California",
  ca: "California",
  colorado: "Colorado",
  co: "Colorado",
  connecticut: "Connecticut",
  ct: "Connecticut",
  delaware: "Delaware",
  de: "Delaware",
  florida: "Florida",
  fl: "Florida",
  georgia: "Georgia",
  ga: "Georgia",
  hawaii: "Hawaii",
  hi: "Hawaii",
  idaho: "Idaho",
  id: "Idaho",
  illinois: "Illinois",
  il: "Illinois",
  indiana: "Indiana",
  in: "Indiana",
  iowa: "Iowa",
  ia: "Iowa",
  kansas: "Kansas",
  ks: "Kansas",
  kentucky: "Kentucky",
  ky: "Kentucky",
  louisiana: "Louisiana",
  la: "Louisiana",
  maine: "Maine",
  me: "Maine",
  maryland: "Maryland",
  md: "Maryland",
  massachusetts: "Massachusetts",
  ma: "Massachusetts",
  michigan: "Michigan",
  mi: "Michigan",
  minnesota: "Minnesota",
  mn: "Minnesota",
  mississippi: "Mississippi",
  ms: "Mississippi",
  missouri: "Missouri",
  mo: "Missouri",
  montana: "Montana",
  mt: "Montana",
  nebraska: "Nebraska",
  ne: "Nebraska",
  nevada: "Nevada",
  nv: "Nevada",
  "new hampshire": "New Hampshire",
  nh: "New Hampshire",
  "new jersey": "New Jersey",
  nj: "New Jersey",
  "new mexico": "New Mexico",
  nm: "New Mexico",
  "new york": "New York",
  ny: "New York",
  "north carolina": "North Carolina",
  nc: "North Carolina",
  "north dakota": "North Dakota",
  nd: "North Dakota",
  ohio: "Ohio",
  oh: "Ohio",
  oklahoma: "Oklahoma",
  ok: "Oklahoma",
  oregon: "Oregon",
  or: "Oregon",
  pennsylvania: "Pennsylvania",
  pa: "Pennsylvania",
  "rhode island": "Rhode Island",
  ri: "Rhode Island",
  "south carolina": "South Carolina",
  sc: "South Carolina",
  "south dakota": "South Dakota",
  sd: "South Dakota",
  tennessee: "Tennessee",
  tn: "Tennessee",
  texas: "Texas",
  tx: "Texas",
  utah: "Utah",
  ut: "Utah",
  vermont: "Vermont",
  vt: "Vermont",
  virginia: "Virginia",
  va: "Virginia",
  washington: "Washington",
  wa: "Washington",
  "west virginia": "West Virginia",
  wv: "West Virginia",
  wisconsin: "Wisconsin",
  wi: "Wisconsin",
  wyoming: "Wyoming",
  wy: "Wyoming",
};

const weatherTypes = {
  clear: {
    icon: "assets/weather/sun.png",
    background: "suncloud-background",
    bgImage: "assets/weather/bgcloud.svg",
  },
  cloudy: {
    icon: "assets/weather/cloud.svg",
    background: "inclement-background",
    bgImage: "assets/weather/bgog.svg",
  },
  rainy: {
    icon: "assets/weather/rain.png",
    background: "inclement-background",
    bgImage: "assets/weather/bgog.svg",
  },
  snowy: {
    icon: "assets/weather/snowflake.png",
    background: "inclement-background",
    bgImage: "assets/weather/bgog.svg",
  },
  stormy: {
    icon: "assets/weather/storm.png",
    background: "inclement-background",
    bgImage: "assets/weather/bgog.svg",
  },
};

function getWeatherType(code) {
  if (code === 0) return "clear";
  if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
  if ((code >= 71 && code <= 79) || (code >= 85 && code <= 90)) return "snowy";
  if ((code >= 51 && code <= 69) || (code >= 80 && code <= 84)) return "rainy";
  if (code >= 95 && code <= 99) return "stormy";
  return "cloudy";
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function updateBackground(type) {
  currentWeatherType = type;

  body.classList.remove("suncloud-background", "rain-background", "inclement-background");
  body.classList.add(weatherTypes[type].background);
  weatherIcon.src = weatherTypes[type].icon;
  weatherBg.src = weatherTypes[type].bgImage;
}

function setUnit(unit) {
  currentUnit = unit;
  body.classList.toggle("metric-units", unit === "metric");
  toggle.setAttribute("aria-pressed", String(unit === "metric"));
  toggle.setAttribute("aria-label", `Switch to ${unitOptions[unit].nextLabel}`);
  localStorage.setItem(unitStorageKey, unit);
}

function normalizeText(value) {
  return value.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
}

function getStateName(value = "") {
  return usStates[normalizeText(value)] || "";
}

function parseLocationQuery(query) {
  const zipMatch = query.match(/\b\d{5}(?:-\d{4})?\b/);
  const zip = zipMatch ? zipMatch[0].slice(0, 5) : "";
  const queryWithoutZip = query.replace(/\b\d{5}(?:-\d{4})?\b/, "").trim();
  const parts = queryWithoutZip
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  let city = parts[0] || queryWithoutZip;
  let state = getStateName(parts[1] || "");

  if (!state && city) {
    const words = city.split(/\s+/);

    for (let length = Math.min(2, words.length); length > 0; length -= 1) {
      const stateCandidate = words.slice(-length).join(" ");
      state = getStateName(stateCandidate);

      if (state) {
        city = words.slice(0, -length).join(" ");
        break;
      }
    }
  }

  return {
    city: city.trim(),
    state,
    zip,
  };
}

function isStateMatch(location, state) {
  return (
    !state ||
    normalizeText(location.admin1 || "") === normalizeText(state) ||
    normalizeText(location.name || "") === normalizeText(state)
  );
}

async function getZipLocation(zip) {
  const resp = await fetch(`https://api.zippopotam.us/us/${zip}`);

  if (!resp.ok) {
    throw new Error("No matching ZIP code found. Try a city and state instead.");
  }

  const data = await resp.json();
  const place = data.places && data.places[0];

  if (!place) {
    throw new Error("No matching ZIP code found. Try a city and state instead.");
  }

  return {
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    name: place["place name"],
    admin1: place.state,
  };
}

async function getCityLocation(city, state) {
  const params = new URLSearchParams({
    name: city,
    count: "10",
    language: "en",
    format: "json",
  });
  const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);

  if (!resp.ok) {
    throw new Error("Unable to search for that location.");
  }

  const data = await resp.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No matching location found. Try a city, state, or ZIP code.");
  }

  const location = state
    ? data.results.find((result) => result.country_code === "US" && isStateMatch(result, state))
    : data.results[0];

  if (!location) {
    throw new Error(`No matching city found in ${state}. Try adding a ZIP code.`);
  }

  return location;
}

async function getLocationName(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    language: "en",
    format: "json",
  });
  const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?${params}`);

  if (!resp.ok) {
    return null;
  }

  const data = await resp.json();
  return data.results && data.results[0] ? data.results[0] : null;
}

function getUserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 30 * 60 * 1000,
      timeout: 8000,
    });
  });
}

async function getLocation(query) {
  const locationQuery = parseLocationQuery(query);

  if (locationQuery.zip) {
    try {
      return await getZipLocation(locationQuery.zip);
    } catch (error) {
      if (!locationQuery.city) {
        throw error;
      }
    }
  }

  return getCityLocation(locationQuery.city || query, locationQuery.state);
}

async function getWeather(location) {
  const selectedUnit = unitOptions[currentUnit];
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    temperature_unit: selectedUnit.temperatureUnit,
    wind_speed_unit: selectedUnit.windSpeedUnit,
  });
  const resp = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!resp.ok) {
    throw new Error("Unable to load weather for that location.");
  }

  return resp.json();
}

function displayWeather(location, current) {
  const type = getWeatherType(current.weather_code);
  const selectedUnit = unitOptions[currentUnit];

  tempText.textContent = `It's ${Math.round(current.temperature_2m)}°`;
  humidityText.textContent = `${current.relative_humidity_2m}% Humidity`;
  windText.textContent = `${Math.round(current.wind_speed_10m)}${selectedUnit.windLabel} Wind Speed`;
  searchInput.value = location.name;
  setStatus(`${location.name}${location.admin1 ? `, ${location.admin1}` : ""}`);
  updateBackground(type);
}

async function refreshCurrentWeather() {
  if (!currentLocation) {
    checkWeather(currentQuery);
    return;
  }

  setStatus("Loading weather...");
  searchBtn.disabled = true;

  try {
    const data = await getWeather(currentLocation);
    displayWeather(currentLocation, data.current);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    searchBtn.disabled = false;
  }
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
    const location = currentLocation && query === currentQuery ? currentLocation : await getLocation(query);
    const data = await getWeather(location);

    currentLocation = location;
    currentQuery = query;
    displayWeather(location, data.current);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    searchBtn.disabled = false;
  }
}

async function loadEstimatedLocationWeather() {
  setStatus("Finding your area...");
  searchBtn.disabled = true;

  try {
    const position = await getUserPosition();
    const { latitude, longitude } = position.coords;
    const locationName = await getLocationName(latitude, longitude);
    const location = {
      latitude,
      longitude,
      name: locationName ? locationName.name : "Your area",
      admin1: locationName ? locationName.admin1 : "",
    };
    const data = await getWeather(location);

    currentLocation = location;
    currentQuery = location.name;
    displayWeather(location, data.current);
  } catch (error) {
    setStatus("Using default location.");
    checkWeather(defaultCity);
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
  setUnit(currentUnit === "imperial" ? "metric" : "imperial");
  refreshCurrentWeather();
});

setUnit(currentUnit);
loadEstimatedLocationWeather();
