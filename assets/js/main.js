const API_KEY = "29d8ee685b6f4b0a835150704251503"; 

const weatherResult = document.getElementById("weatherResult");
const button = document.getElementById("button");


async function getWeather(){
    try {
        const city = document.getElementById("city").value.trim(); 
        if (!city) {
            alert("Please enter a city name.");
            return;  
        }
        const BASE_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&lang=az`;
        const data = await getAll(BASE_URL);
        console.log(data)
        
    } catch (error) {
        console.error(error)
    }
}



button.addEventListener("click", getWeather)

async function getAll(BASE_URL){
    try {
        const response = await axios(BASE_URL)
        return response.data
    } catch (error) {
        console.error(error)
    }
}

