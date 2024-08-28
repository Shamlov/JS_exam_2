// извиняюсь за CSS оформление и нелогичное название переменных, упор сделан на JS. все принципы работы понятны.  

let apiKey = 'e90c7b53ce9d733658f7b90d4a8cbcf0'

const app = document.querySelector('#app')

// формируем первоначальный код
app.innerHTML = `
<div class="wrapper" id="wrapper">
        <div class="header">
            <h1>Моя погода</h1>
            <p id="cityNameApi"></p>
            <input type="text" id="searchField">
            <button id="btnSearch">поиск</button>
        </div>
        <div class="under-header">
            <p id = "btnFullDetails">сегодня</p>
            <p id = "btnAbbreviatedDetails">прогоз на 5 дней</p>
        </div>
        <div class="weather-now-block">
            <div class="head-now">
                <h3>Погода сейчас в <span id="weatherUserCity"></span></h3>
                <p class="date" id="weatherUserTime">18.05.2024</p>
            </div>
            <div class="weather-now-data-block">
                <div class="left">
                    <div class="img"></div>
                    <p id="userLocationForecast">Нет данных</p>
                </div>
                <div class="center">
                    <p id="userLocationTemperature">29 C</p>
                    <p>Ощущается</p>
                </div>
                <div class="right">
                    <p>восход не задействован</p>
                    <p>закат не задействован</p>
                    <p>длительность дня не задействован</p>
                </div>
            </div>
        </div>
`
const wrapper = document.querySelector('#wrapper')
// находим блоки с текущей погодой. т.к. они используются несколько раз, сохраним их
const weatherUserCity = document.querySelector('#weatherUserCity')
const weatherUserTime = document.querySelector('#weatherUserTime')
const userLocationForecast = document.querySelector('#userLocationForecast')
const userLocationTemperature = document.querySelector('#userLocationTemperature')


// опеделяем текущее местоположение
navigator.geolocation.getCurrentPosition(
    function (position) {
        weatherUserCityShow(position.coords.latitude, position.coords.longitude)
    },
    function (error) {
        console.error("Ошибка получения местоположения:", error)
    }
);

// сфоримруем заголовки блока погноз на 5 дней
let divFiveDays = document.createElement('div') 
divFiveDays.className = 'hourly-weather-block'
// divFiveDays.id = 'hourlyWeatherBlock'
divFiveDays.innerHTML = `
            <div class="hourly-weather-column">
                <p>время</p>
                <p>прогноз</p>
                <p>температура</p>
                <p>ощущается</p>
                <p>ветер</p>
            </div>
`

// переключатель показа блоков. делаю без делигирования. хотя тут нужно использовать метод делигирования
const weatherNowBlock = document.querySelector('.weather-now-block')
const btnFullDetails = document.querySelector('#btnFullDetails')
const btnAbbreviatedDetails = document.querySelector('#btnAbbreviatedDetails')
btnFullDetails.addEventListener('click', ()=> {
    weatherNowBlock.classList.remove('d-none')
})
btnAbbreviatedDetails.addEventListener('click', ()=> {
    weatherNowBlock.classList.add('d-none')
})



// строим повторяющийся код циклом
function fiveDaysWeatherConstructionHTML(data) {
    for(let i = 0; i <= 4; i++) {                  
        let div = document.createElement('div') 
        div.className = 'hourly-weather-column'
        div.className = 'hourly-weather-info-column'
        // div.id = 'hourlyWeatherDetailsBlock'
        div.innerHTML = `
                    <p id="time">${data.list[i].dt_txt}</p>
                    <p id="forecast">${data.list[i].weather[0].description}</p>
                    <p id="temp">${((data.list[i].main.temp) - 273).toFixed(0)}</p>
                    <p id="feeling">${((data.list[i].main.feels_like) - 273).toFixed(0)}</p>
                    <p id="wind">${data.list[i].wind.speed}</p>
        `
        divFiveDays.append(div)
    }
}
wrapper.append(divFiveDays)



// очистка блока с погодой на 5 дней. т.к. на этом этапе стало понятно , что не совсем правильно сверстал HTML , использую метод querySelectorAll. хоть он и дополнительно загружает браузер
function clearBlockFiveDays() {
    let hourlyWeatherBlock = document.querySelectorAll('.hourly-weather-info-column')
    hourlyWeatherBlock.forEach((el)=> {
        el.innerHTML = ''
    })
}

// находим поля и кнопку
let btnSearch = document.querySelector('#btnSearch')
let searchField = document.querySelector('#searchField')
let cityNameApi = document.querySelector('#cityNameApi')


// вывод погоды на экран по координатам

async function weatherUserCityShow(lat, lon) {
    let response  = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}&lang=ru&appid=e90c7b53ce9d733658f7b90d4a8cbcf0`)
    console.log(response)
    let data = await response.json()
    fiveDaysWeatherConstructionHTML(data)
    weatherNow(data)
}

// Блок погоды сейчас
function weatherNow(data) {
    console.log(data.city.name)
    weatherUserCity.textContent = data.city.name
    weatherUserTime.textContent = data.list[0].dt_txt 
    userLocationForecast.textContent = data.list[0].weather[0].description
    userLocationTemperature.textContent = ((data.list[0].main.temp) - 273).toFixed(0)
}

// поиск координат города по названию при клике на поиск
btnSearch.addEventListener('click', cityRequest )
async function cityRequest() {
    let userCityInput = searchField.value
    let response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${userCityInput}&appid=e90c7b53ce9d733658f7b90d4a8cbcf0`)
    if(!response.ok) {
        alert('ошибка запроса. возможно не ввели название города')
    }
    let data = await response.json()
    if(data.length == 0) {
        alert('Город не найден')
    } else {
        cityNameApi.textContent = data[0].local_names.ru
    }
    showWeather (data[0].lat, data[0].lon)

}

// запрос погоды по координатам на сервер...........
async function showWeather (lat, lon) {
    let response  = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=ru&appid=e90c7b53ce9d733658f7b90d4a8cbcf0`)
    let data = await response.json()
    clearBlockFiveDays()
    fiveDaysWeatherConstructionHTML(data)
    weatherNow(data)
}


