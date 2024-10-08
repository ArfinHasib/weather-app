const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWEatherDiv = document.querySelector(".current-weather");
const hourlyWeather = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "8eafc46362f24388bb192610241908";

// Weather Codes for mapping to outcome icons
const weatherCodes = {
	clear: [1000],
	clouds: [1003, 1006, 1009],
	mist: [1030, 1135, 1147],
	rain: [
		1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246,
		1273, 1276,
	],
	moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
	snow: [
		1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222,
		1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
	],
	thunder: [1087, 1279, 1282],
	thunder_rain: [1273, 1276],
};

// Display the hourly forecast for the next 24 hours
const displayHourlyForeCast = (hourlyData) => {
	const currentHour = new Date().setMinutes(0, 0, 0);
	const next24Hours = currentHour + 24 * 60 * 60 * 1000;

	// Filter the hourly data to only include the next 24 hours
	const next24HoursData = hourlyData.filter(({ time }) => {
		const foreCastTime = new Date(time).getTime();
		return foreCastTime >= currentHour && foreCastTime <= next24Hours;
	});

	// Generate HTML for each hourly forecast and display them
	hourlyWeather.innerHTML = next24HoursData
		.map((item) => {
			const temperature = Math.floor(item.temp_c);
			const time = item.time.split(" ")[1].substring(0, 5);
			const weatherIcon = Object.keys(weatherCodes).find((icon) =>
				weatherCodes[icon].includes(item.condition.code)
			);
			return `
            <li class="weather-item">
                <p class="time">${time}</p>
                <img src="icons/${weatherIcon}.svg" class="weather-icon" />
                <p class="temperature">${temperature}°</p>
            </li>
        `;
		})
		.join("");
};

// Fetch and display the weather details
const getWeatherDetails = async (API_URL) => {
	window.innerWidth <= 768 && searchInput.blur();

	try {
		// Fetch the weather data from the API and parse the response as JSON
		const response = await fetch(API_URL);
		const data = await response.json();

		// Extract current weather details
		const temperature = Math.floor(data.current.temp_c);
		const description = data.current.condition.text;
		const weatherIcon = Object.keys(weatherCodes).find((icon) => {
			return weatherCodes[icon].includes(data.current.condition.code);
		});

		// Update the current weather display
		currentWEatherDiv.querySelector(
			".weather-icon"
		).src = `icons/${weatherIcon}.svg`;

		currentWEatherDiv.querySelector(
			".temperature"
		).innerHTML = `${temperature}<span>°C</span>`;

		currentWEatherDiv.querySelector(".description").innerText = description;

		// Combine hourly data from today and tommorrow
		const combineHourlyData = [
			...data.forecast?.forecastday[0]?.hour,
			...data.forecast?.forecastday[1]?.hour,
		];

		searchInput.value = data.location.name;
		displayHourlyForeCast(combineHourlyData);
	} catch (error) {
		document.body.classList.add("show-no-results");
	}
};

// Set up the weather request for a specific city
const setWeatherRequest = (cityName) => {
	const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;

	getWeatherDetails(API_URL);
};

// Handle user input in the search box
searchInput.addEventListener("keyup", (e) => {
	const cityName = searchInput.value.trim();

	if (e.key == "Enter" && cityName) {
		setWeatherRequest(cityName);
	}
});

// Location detector when the button is clicked
locationButton.addEventListener("click", () => {
	navigator.geolocation.getCurrentPosition((position) => {
		const { latitude, longitude } = position.coords;
		const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
		getWeatherDetails(API_URL);
		window.innerWidth >= 768 && searchInput.focus();
	});
});

// Initial Weather request for LONDON (or any other city) as the default city
setWeatherRequest("London");
