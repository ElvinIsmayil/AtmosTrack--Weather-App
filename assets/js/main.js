const API_KEY = "29d8ee685b6f4b0a835150704251503";

const weatherResult = document.getElementById("weatherResult");
const button = document.getElementById("button");

async function getWeather(e) {
  e.preventDefault();
  try {
    const city = document.getElementById("city").value.trim();
    if (!city) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please enter a city name!",
      });
      return;
    }

    const BASE_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&lang=az`;
    const data = await getAll(BASE_URL);

    if (data) {
      weatherResult.innerHTML = `
                    <div class="card mt-4 shadow-sm">
                        <div class="card-body text-center">
                            <h4 class="card-title fw-bold">${data.location.name}, ${data.location.country}</h4>
                            <img src="${data.current.condition.icon}" alt="Weather Icon" class="my-2">
                            <p class="fs-5 fw-bold mb-1">🌡 Temperature: ${data.current.temp_c}°C</p>
                            <p class="fs-6 text-muted">🌤 Condition: ${data.current.condition.text}</p>
                        </div>
                    </div>
`;
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "Something went wrong while fetching the weather data.",
    });
  }
}

button.addEventListener("click", getWeather);

async function getAll(BASE_URL) {
  try {
    const response = await axios(BASE_URL);
    return response.data;
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Weather Info Not Found!",
      text: "Please enter a valid city name.",
    });
  }
}
