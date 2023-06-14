
const apiUrl ="https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const body = document.body;
const searchQuery =  document.querySelector(".search input")
const searchBtn = document.querySelector(".search button")
const searchInput =  document.querySelector(".search input")
const weatherIcon =  document.querySelector(".weather-icon")
const weatherBg =  document.querySelector(".weather-bg")
const toggle =  document.querySelector(".toggle")
async function checkWeather (city) {
    const resp = await fetch(apiUrl + city + `&appid=${apiKey}`);
    let data = await resp.json();
    document.querySelector(".temp").innerHTML ="It's "+Math.round(data.main.temp) +"°";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "% Humidity";
    document.querySelector(".wind").innerHTML = Math.round(data.wind.speed * 2.237)+"mph Wind Speed";

    if (data.weather[0].main == "Clouds") {
      weatherIcon.src = "assets/weather/cloud.svg";
      body.classList.add("suncloud-background");
      weatherBg.src = "assets/weather/bgcloud.svg";
    } else if (data.weather[0].main == "Clear") {
      weatherIcon.src = "assets/weather/sun.png";
       body.classList.add("suncloud-background");
       weatherBg.src = "assets/weather/bgcloud.svg";
    } else if (data.weather[0].main == "rain") {
      weatherIcon.src = "assets/weather/rain.png";
      body.classList.add("rain-background");
      weatherBg.src = "assets/weather/bgcloud.svg";
    } else if (data.weather[0].main == "Drizzle") {
      weatherIcon.src = "assets/weather/sunrain.png"
       body.classList.add("rain-background");
      weatherBg.src = "assets/weather/bgcloud.svg";;
    } else if (data.weather[0].main == "Mist") {
      weatherIcon.src = "assets/weather/sunrain.png";
    }


    //  if (data.weather[0].main == "Clouds") {
    //    weatherBg.src = "assets/weather/bgcloud.svg";
    //  } else if (data.weather[0].main == "Clear") {
    //    weatherBg.src = "assets/weather/sun.png";
    //  } else if (data.weather[0].main == "rain") {
    //    weatherBg.src = "assets/weather/rain.png";
    //  } else if (data.weather[0].main == "Drizzle") {
    //    weatherBg.src = "assets/weather/sunrain.png";
    //  } else if (data.weather[0].main == "Mist") {
    //    weatherBg.src = "assets/weather/sunrain.png";
    //  }


}


//want the search button to send info to the api call for the city weather
searchBtn.addEventListener("click", ()=> {
    checkWeather(searchQuery.value)
})



searchInput.addEventListener("keypress", (e)=>{
    if (e.key === "Enter") {
       checkWeather(searchQuery.value);
    }
})

checkWeather();