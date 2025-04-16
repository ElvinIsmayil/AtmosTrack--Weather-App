document.addEventListener("DOMContentLoaded", function () {
    // API Configuration
    const API_KEY = "29d8ee685b6f4b0a835150704251503";
    const BASE_URL = "https://api.weatherapi.com/v1";

    // DOM Elements
    const weatherResult = document.getElementById("weatherResult");
    const searchBtn = document.getElementById("searchBtn");
    const cityInput = document.getElementById("city");
    const loadingSpinner = document.getElementById("loading");
    
    // Current Weather Elements
    const locationEl = document.getElementById("location");
    const temperatureEl = document.getElementById("temperature");
    const conditionEl = document.getElementById("condition");
    const weatherIconEl = document.getElementById("weatherIcon");
    const currentDateEl = document.getElementById("currentDate");
    
    // Weather Details Elements
    const feelsLikeEl = document.getElementById("feels-like");
    const windSpeedEl = document.getElementById("wind-speed");
    const humidityEl = document.getElementById("humidity");
    const pressureEl = document.getElementById("pressure");
    
    // Sunrise/Sunset Elements
    const sunriseEl = document.getElementById("sunrise");
    const sunsetEl = document.getElementById("sunset");
    const sunPositionEl = document.getElementById("sunPosition");
    
    // Forecast Elements
    const forecastContainer = document.getElementById("forecastContainer");
    
    // Map Element
    const weatherMapEl = document.getElementById("weather-map");
    
    // Weather Animation Background
    const weatherBg = document.getElementById("weatherBg");
    
    // App Configuration
    let currentUnit = localStorage.getItem('weatherUnit') || 'metric'; // 'metric' (°C) or 'imperial' (°F)
    const unitsDropdown = document.getElementById("unitsDropdown");
    
    // Weather Map
    let weatherMap = null;
    let weatherMarker = null;
    let currentMapLocation = { lat: 0, lon: 0 };
    
    // Set initial unit display
    unitsDropdown.textContent = currentUnit === 'metric' ? '°C' : '°F';
    
    // ✅ Event Listeners
    searchBtn.addEventListener("click", getWeather);
    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") getWeather(e);
    });
    
    // Unit Toggle Listeners
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const newUnit = this.getAttribute('data-unit');
            currentUnit = newUnit;
            localStorage.setItem('weatherUnit', newUnit);
            unitsDropdown.textContent = newUnit === 'metric' ? '°C' : '°F';
            
            // If we have weather data displayed, update it
            if (!weatherResult.classList.contains('d-none')) {
                const city = cityInput.value.trim();
                if (city) fetchWeatherData(city);
            }
        });
    });

    // ✅ Fetch Weather Data
    async function getWeather(e) {
        e.preventDefault();

        const city = cityInput.value.trim();
        if (!city) {
            showAlert("warning", "Oops...", "Please enter a city name!");
            return;
        }

        // ✅ Show Loading Spinner & Hide Previous Result
        loadingSpinner.style.display = "block";
        weatherResult.classList.add("d-none");

        fetchWeatherData(city);
    }

    // ✅ Debounced API Call (Prevents Spam)
    let debounceTimer;
    async function fetchWeatherData(city) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                // Check if we're using coordinates
                let queryParam = city;
                if (cityInput.dataset.lat && cityInput.dataset.lon) {
                    queryParam = `${cityInput.dataset.lat},${cityInput.dataset.lon}`;
                    // Clear coordinates after use
                    delete cityInput.dataset.lat;
                    delete cityInput.dataset.lon;
                }
                
                // Get current weather
                const currentWeatherUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${queryParam}`;
                const currentData = await fetchWeather(currentWeatherUrl);
                
                // Get forecast (includes astronomy data for sunrise/sunset)
                const forecastUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${queryParam}&days=7`;
                const forecastData = await fetchWeather(forecastUrl);

                if (currentData && currentData.location && forecastData) {
                    // Combine the data
                    const combinedData = {
                        current: currentData.current,
                        location: currentData.location,
                        forecast: forecastData.forecast,
                        astronomy: forecastData.forecast.forecastday[0].astro
                    };
                    
                    // Store coordinates for map
                    currentMapLocation = {
                        lat: currentData.location.lat,
                        lon: currentData.location.lon
                    };
                    
                    displayWeather(combinedData);
                    
                    // Create weather animations based on condition
                    createWeatherAnimation(currentData.current.condition.code);
                    
                    // Initialize or update the map
                    initializeWeatherMap(currentData);
                }
            } catch (error) {
                console.error("API Fetch Error:", error);
                showAlert("error", "Error!", "Something went wrong while fetching the weather data.");
            } finally {
                loadingSpinner.style.display = "none"; // ✅ Hide spinner after fetch
            }
        }, 500); // 500ms delay before making the API request
    }

    // ✅ Fetch Weather from API
    async function fetchWeather(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Weather API Error:", error);
            showAlert("error", "Weather Info Not Found!", "Please enter a valid city name.");
            loadingSpinner.style.display = "none";
            return null;
        }
    }

    // ✅ Display Weather in UI
    function displayWeather(data) {
        // Location and basic info
        locationEl.textContent = `${data.location.name}, ${data.location.country}`;
        weatherIconEl.src = data.current.condition.icon.replace('64x64', '128x128'); // Get larger icon
        
        // Set temperature based on unit preference
        const tempValue = currentUnit === 'metric' ? data.current.temp_c : data.current.temp_f;
        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        temperatureEl.textContent = `${tempValue}${tempUnit}`;
        
        conditionEl.textContent = data.current.condition.text;
        
        // Current date and time
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const localTime = new Date(data.location.localtime);
        currentDateEl.textContent = localTime.toLocaleDateString(undefined, dateOptions) + 
                                    `, ${localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        // Weather details
        const feelsLikeTemp = currentUnit === 'metric' ? data.current.feelslike_c : data.current.feelslike_f;
        feelsLikeEl.textContent = `${feelsLikeTemp}${tempUnit}`;
        
        const windSpeedValue = currentUnit === 'metric' ? data.current.wind_kph : data.current.wind_mph;
        const windSpeedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
        windSpeedEl.textContent = `${windSpeedValue} ${windSpeedUnit}`;
        
        humidityEl.textContent = `${data.current.humidity}%`;
        pressureEl.textContent = `${data.current.pressure_mb} hPa`;
        
        // Sunrise and sunset
        sunriseEl.textContent = data.astronomy.sunrise;
        sunsetEl.textContent = data.astronomy.sunset;
        
        // Position the sun based on current time
        positionSunBasedOnTime(data.astronomy.sunrise, data.astronomy.sunset, data.location.localtime);
        
        // Display forecast
        displayForecast(data.forecast.forecastday);
        
        // Unhide the results
        weatherResult.classList.remove("d-none");
        weatherResult.classList.add("animate__animated", "animate__fadeIn");
        
        // Animate elements to appear with staggered delay
        const animatedElements = document.querySelectorAll('.weather-detail, .forecast-card');
        animatedElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                // Trigger reflow
                void el.offsetWidth;
                
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    // Initialize or update the weather map
    function initializeWeatherMap(weatherData) {
        if (!weatherMapEl) return;
        
        const lat = weatherData.location.lat;
        const lon = weatherData.location.lon;
        const locationName = weatherData.location.name;
        const conditionText = weatherData.current.condition.text;
        const conditionIcon = weatherData.current.condition.icon;
        const temp = currentUnit === 'metric' ? 
            `${weatherData.current.temp_c}°C` : 
            `${weatherData.current.temp_f}°F`;
        
        // If map doesn't exist yet, create it
        if (!weatherMap) {
            // Create the map centered at the location
            weatherMap = L.map('weather-map').setView([lat, lon], 10);
            
            // Add the tile layer (map style)
            const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
            const tileLayer = isDarkMode ?
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                }) :
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                });
            
            tileLayer.addTo(weatherMap);
            
            // Make global for theme changes
            window.weatherMap = weatherMap;
        } else {
            // Update map view to new location
            weatherMap.setView([lat, lon], 10);
            
            // Remove old marker if it exists
            if (weatherMarker) {
                weatherMap.removeLayer(weatherMarker);
            }
        }
        
        // Create custom icon for the marker
        const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="map-marker-content" style="background:var(--glass-bg); backdrop-filter:blur(5px); padding:8px 12px; border-radius:10px; box-shadow:0 3px 10px rgba(0,0,0,0.1); border:1px solid var(--glass-border);">
                    <div style="display:flex; align-items:center;">
                        <img src="${conditionIcon}" style="width:40px; height:40px; margin-right:8px;">
                        <div>
                            <div style="font-weight:600; color:var(--text-primary);">${locationName}</div>
                            <div style="font-size:0.9rem; color:var(--text-secondary);">${conditionText}, ${temp}</div>
                        </div>
                    </div>
                   </div>`,
            iconSize: [120, 60],
            iconAnchor: [60, 30]
        });
        
        // Add marker at the weather location
        weatherMarker = L.marker([lat, lon], { icon: customIcon }).addTo(weatherMap);
        
        // Fix map rendering issues - force a redraw after display
        setTimeout(() => {
            weatherMap.invalidateSize();
        }, 100);
    }
    
    // Position the sun visualization based on sunrise, sunset and current time
    function positionSunBasedOnTime(sunrise, sunset, currentTime) {
        // Parse times
        const sunriseTime = parseTimeString(sunrise);
        const sunsetTime = parseTimeString(sunset);
        const currentDateTime = new Date(currentTime);
        
        const currentHour = currentDateTime.getHours();
        const currentMinute = currentDateTime.getMinutes();
        
        // Calculate total minutes for each
        const sunriseMinutes = sunriseTime.hours * 60 + sunriseTime.minutes;
        const sunsetMinutes = sunsetTime.hours * 60 + sunsetTime.minutes;
        const currentMinutes = currentHour * 60 + currentMinute;
        
        // Calculate daylight duration in minutes
        const daylightMinutes = sunsetMinutes - sunriseMinutes;
        
        // Check if it's daytime
        if (currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes) {
            // Calculate position percentage
            const percentage = (currentMinutes - sunriseMinutes) / daylightMinutes;
            
            // Position the sun (using CSS arc)
            const sunArc = document.querySelector('.sun-arc');
            const arcWidth = sunArc.offsetWidth;
            
            // Calculate x position along the arc (0% to 100%)
            const xPos = percentage * 100;
            
            // Calculate y position using a parabola (y = -4 * (x - 0.5)² + 1) mapped to height
            const normalizedX = percentage - 0.5; // -0.5 to 0.5
            const yPercent = -4 * (normalizedX * normalizedX) + 1; // 0 to 1 parabola
            
            const arcHeight = 160; // Height of the arc (matches CSS)
            const yPos = arcHeight - (yPercent * arcHeight);
            
            // Position the sun ball
            sunPositionEl.style.bottom = `${yPos}px`;
            sunPositionEl.style.left = `${xPos}%`;
            sunPositionEl.style.opacity = '1';
        } else {
            // It's nighttime, hide or position the sun at the bottom
            sunPositionEl.style.opacity = '0.2';
            
            // Position at the left or right bottom depending on time
            if (currentMinutes < sunriseMinutes) {
                sunPositionEl.style.left = '0%';
                sunPositionEl.style.bottom = '0px';
            } else {
                sunPositionEl.style.left = '100%';
                sunPositionEl.style.bottom = '0px';
            }
        }
    }
    
    // Helper function to parse time strings like "06:45 AM"
    function parseTimeString(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
        
        // Convert to 24-hour format if PM
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return { hours, minutes };
    }
    
    // Display 7-day forecast
    function displayForecast(forecastData) {
        forecastContainer.innerHTML = '';
        
        forecastData.forEach((day, index) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
            const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            
            // Get temperature based on unit preference
            const tempValue = currentUnit === 'metric' ? day.day.avgtemp_c : day.day.avgtemp_f;
            const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.setAttribute('data-aos', 'fade-up');
            forecastCard.setAttribute('data-aos-delay', `${index * 100}`);
            
            forecastCard.innerHTML = `
                <p class="forecast-date">${index === 0 ? 'Today' : dayName}<br>${monthDay}</p>
                <img src="${day.day.condition.icon}" class="forecast-icon" alt="${day.day.condition.text}">
                <p class="forecast-temp">${tempValue}${tempUnit}</p>
                <p class="forecast-condition">${day.day.condition.text}</p>
            `;
            
            forecastContainer.appendChild(forecastCard);
        });
    }
    
    // Create weather animations based on weather condition
    function createWeatherAnimation(conditionCode) {
        // Clear previous animations
        weatherBg.innerHTML = '';
        
        // Determine the type of weather
        if (conditionCode >= 1000 && conditionCode < 1003) {
            // Sunny or clear
            createSunnyAnimation();
        } else if (conditionCode >= 1003 && conditionCode < 1030) {
            // Cloudy
            createCloudyAnimation();
        } else if ((conditionCode >= 1063 && conditionCode < 1070) || 
                   (conditionCode >= 1150 && conditionCode < 1201)) {
            // Rainy
            createRainyAnimation();
        } else if (conditionCode >= 1114 && conditionCode < 1150 || 
                   conditionCode >= 1210 && conditionCode < 1250) {
            // Snowy
            createSnowyAnimation();
        } else if (conditionCode >= 1273 && conditionCode < 1300) {
            // Thunderstorm
            createThunderstormAnimation();
        } else {
            // Default/fallback - gentle clouds
            createCloudyAnimation(3);
        }
    }
    
    // Weather animation creators
    function createSunnyAnimation() {
        const sun = document.createElement('div');
        sun.className = 'sun';
        sun.style.top = '10%';
        sun.style.left = '75%';
        sun.style.opacity = '0.8';
        
        weatherBg.appendChild(sun);
        
        // Animate in
        setTimeout(() => { sun.style.opacity = '1'; }, 100);
        
        // Add a few light clouds
        for (let i = 0; i < 3; i++) {
            createCloud(10 + (i * 30), 20 + (i * 10), 0.3 + (i * 0.1), 60 + (i * 40));
        }
    }
    
    function createCloudyAnimation(count = 8) {
        for (let i = 0; i < count; i++) {
            const top = Math.random() * 50; // 0-50% from top
            const left = Math.random() * 100; // 0-100% from left
            const opacity = 0.4 + (Math.random() * 0.4); // 0.4-0.8
            const size = 80 + (Math.random() * 120); // 80-200px
            
            createCloud(top, left, opacity, size);
        }
    }
    
    function createRainyAnimation() {
        // Add some clouds first
        createCloudyAnimation(5);
        
        // Add raindrops
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const raindrop = document.createElement('div');
                raindrop.className = 'rain';
                
                // Random starting position
                raindrop.style.left = `${Math.random() * 100}%`;
                raindrop.style.top = `-10px`;
                raindrop.style.height = `${10 + (Math.random() * 20)}px`;
                raindrop.style.opacity = '0';
                
                weatherBg.appendChild(raindrop);
                
                // Animate the raindrop
                setTimeout(() => {
                    raindrop.style.opacity = '0.7';
                    raindrop.style.animation = `fallRain ${1 + Math.random()}s linear forwards`;
                    
                    // Remove after animation
                    setTimeout(() => {
                        raindrop.remove();
                    }, 2000);
                }, 10);
            }, i * 100); // Stagger raindrops
        }
    }
    
    function createSnowyAnimation() {
        // Add some light clouds
        createCloudyAnimation(4);
        
        // Add snowflakes
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const snowflake = document.createElement('div');
                snowflake.className = 'snow';
                
                // Random starting position
                snowflake.style.left = `${Math.random() * 100}%`;
                snowflake.style.top = `-10px`;
                snowflake.style.opacity = '0';
                
                weatherBg.appendChild(snowflake);
                
                // Animate the snowflake
                setTimeout(() => {
                    snowflake.style.opacity = '0.9';
                    snowflake.style.animation = `fallSnow ${3 + Math.random() * 4}s linear forwards`;
                    
                    // Remove after animation
                    setTimeout(() => {
                        snowflake.remove();
                    }, 8000);
                }, 10);
            }, i * 200); // Stagger snowflakes
        }
    }
    
    function createThunderstormAnimation() {
        // Dark clouds
        createCloudyAnimation(6);
        
        // Rain
        createRainyAnimation();
        
        // Lightning flashes
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                // Create lightning flash
                const flash = document.createElement('div');
                flash.style.position = 'absolute';
                flash.style.top = '0';
                flash.style.left = '0';
                flash.style.width = '100%';
                flash.style.height = '100%';
                flash.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                flash.style.opacity = '0';
                flash.style.zIndex = '1';
                flash.style.pointerEvents = 'none';
                
                weatherBg.appendChild(flash);
                
                // Flash animation
                setTimeout(() => {
                    flash.style.opacity = '0.8';
                    flash.style.transition = 'opacity 0.1s ease-out';
                    
                    setTimeout(() => {
                        flash.style.opacity = '0';
                        
                        // Remove after animation
                        setTimeout(() => {
                            flash.remove();
                        }, 100);
                    }, 100);
                }, 10);
            }, 1000 + (i * 3000)); // Random lightning intervals
        }
    }
    
    function createCloud(top, left, opacity, size) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${top}%`;
        cloud.style.left = `${left}%`;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;
        cloud.style.opacity = '0';
        
        weatherBg.appendChild(cloud);
        
        // Animate in
        setTimeout(() => { cloud.style.opacity = opacity.toString(); }, 100 + (Math.random() * 500));
    }

    // ✅ Show SweetAlert Messages
    function showAlert(icon, title, text) {
        Swal.fire({ 
            icon, 
            title, 
            text,
            background: document.body.getAttribute('data-theme') === 'dark' ? '#1e1e1e' : '#fff',
            color: document.body.getAttribute('data-theme') === 'dark' ? '#fff' : '#111'
        });
    }
});
