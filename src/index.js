const apiKey = "1f983766b2b266f5326233c7e508f86b";
const apiUrl ="https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const searchQuery =  document.querySelector(".search input")
const searchBtn = document.querySelector(".search button")
const weatherIcon =  document.querySelector(".weather-icon")
const toggle =  document.querySelector(".toggle")
async function checkWeather (city) {
    const resp = await fetch(apiUrl + city + `&appid=${apiKey}`);
    let data = await resp.json();

    console.log(data);

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°F";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = Math.round(data.wind.speed * 2.237)+"mph";

    if (data.weather[0].main == "Clouds") {
      weatherIcon.src = "assets/weather/clouds.png";
    } else if (data.weather[0].main == "Clear") {
      weatherIcon.src = "assets/weather/sun.png";
    } else if (data.weather[0].main == "rain") {
      weatherIcon.src = "assets/weather/rain.png";
    } else if (data.weather[0].main == "Drizzle") {
      weatherIcon.src = "assets/weather/sunrain.png";
    } else if (data.weather[0].main == "Mist") {
      weatherIcon.src = "assets/weather/sunrain.png";
    }
}


//want the search button to send info to the api call for the city weather
searchBtn.addEventListener("click", ()=> {
    checkWeather(searchQuery.value)
})

toggle.addEventListener("click", ()=>{
    
})

checkWeather();