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
let currentWeatherType = "cloudy";

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
    lightModeBgImage: "assets/weather/bgcloud.svg",
  },
  cloudy: {
    icon: "assets/weather/cloud.svg",
    background: "inclement-background",
    bgImage: "assets/weather/bgcloud.svg",
    lightModeBgImage: "assets/weather/bgog.svg",
  },
  rainy: {
    icon: "assets/weather/rain.png",
    background: "inclement-background",
    bgImage: "assets/weather/bgcloud.svg",
    lightModeBgImage: "assets/weather/bgog.svg",
  },
  snowy: {
    icon: "assets/weather/snowflake.png",
    background: "inclement-background",
    bgImage: "assets/weather/bgcloud.svg",
    lightModeBgImage: "assets/weather/bgog.svg",
  },
  stormy: {
    icon: "assets/weather/storm.png",
    background: "inclement-background",
    bgImage: "assets/weather/bgcloud.svg",
    lightModeBgImage: "assets/weather/bgog.svg",
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
  const isDarkMode = body.classList.contains("dark-mode");

  body.classList.remove("suncloud-background", "rain-background", "inclement-background");
  body.classList.add(weatherTypes[type].background);
  weatherIcon.src = weatherTypes[type].icon;
  weatherBg.src = isDarkMode ? weatherTypes[type].bgImage : weatherTypes[type].lightModeBgImage;
}

function setDarkMode(isDarkMode) {
  body.classList.toggle("dark-mode", isDarkMode);
  toggle.setAttribute("aria-pressed", String(isDarkMode));
  toggle.setAttribute("aria-label", isDarkMode ? "Switch to light mode" : "Switch to dark mode");
  toggleIcon.src = isDarkMode ? "assets/toggle2.png" : "assets/toggle.png";
  weatherBg.src = isDarkMode
    ? weatherTypes[currentWeatherType].bgImage
    : weatherTypes[currentWeatherType].lightModeBgImage;
  localStorage.setItem(darkModeStorageKey, String(isDarkMode));
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
