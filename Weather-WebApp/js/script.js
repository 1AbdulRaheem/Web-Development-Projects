// WeatherVista - my weather app
// Data from Open-Meteo (free API, no key needed)

const byId = (id) => document.getElementById(id);

// Open-Meteo returns a number for weather - this turns it into text + emoji
const WEATHER_INFO = {
  0:  ["Clear sky", "☀️"],
  1:  ["Mainly clear", "🌤️"],
  2:  ["Partly cloudy", "⛅"],
  3:  ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with hail", "⛈️"]
};

const RAIN_CODES = [61, 63, 65, 80, 81, 82, 95, 96, 99];
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

let currentPlace = null;
let currentData = null;
let loading = false;
let toastTimer;

// localStorage can throw in private mode, so always wrap in try/catch
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let favorites = load("weathervista:favorites", []);
let recent = load("weathervista:recent", []);
let unit = load("weathervista:unit", "C");
let isLight = load("weathervista:light", false);

function infoFor(code) {
  return WEATHER_INFO[code] || ["Unknown", "🌡️"];
}

function formatTemp(value) {
  if (value == null) return "—";
  const t = unit === "F" ? (value * 9) / 5 + 32 : value;
  return Math.round(t) + "°";
}

// 12-hour time with AM/PM
function formatTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function formatDay(value) {
  const d = new Date(value + "T12:00:00");
  return isNaN(d.getTime()) ? value : d.toLocaleDateString([], { weekday: "short" });
}

function formatDate(value) {
  const d = new Date(value + "T12:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function uvLabel(v) {
  if (v < 3) return "(Low)";
  if (v < 6) return "(Moderate)";
  if (v < 8) return "(High)";
  return "(Very high)";
}

function directionName(deg) {
  return DIRECTIONS[Math.round(deg / 45) % 8];
}

function setStatus(message, isError) {
  const el = byId("statusMessage");
  el.textContent = message;
  if (isError) {
    el.classList.add("error");
  } else {
    el.classList.remove("error");
  }
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function setLoading(value) {
  loading = value;
  const searchBtn = document.querySelector("#searchForm button");
  const locBtn = byId("locationButton");
  const refreshBtn = byId("refreshButton");

  searchBtn.disabled = value;
  locBtn.disabled = value;
  if (refreshBtn) refreshBtn.disabled = value;
  searchBtn.textContent = value ? "Loading…" : "Search ↗";
}

// switch between home / favorites / settings
function showPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  byId("page-" + name).classList.add("active");

  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === name) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectCity(name) {
  showPage("home");
  loadCity(name);
}

async function searchCity(name) {
  const params = new URLSearchParams({
    name: name,
    count: "1",
    language: "en",
    format: "json"
  });
  const url = "https://geocoding-api.open-meteo.com/v1/search?" + params;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Weather service error (" + res.status + ").");
  }

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('Could not find "' + name + '". Try a nearby city.');
  }
  return data.results[0];
}

async function getForecast(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "7",
    forecast_hours: "24"
  });
  const url = "https://api.open-meteo.com/v1/forecast?" + params;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Weather service error (" + res.status + ").");
  }
  return res.json();
}

function showWeather(place, data) {
  const now = data.current;
  const daily = data.daily;
  const info = infoFor(now.weather_code);

  byId("cityName").textContent = place.name;

  const metaParts = [place.admin1, place.country].filter(Boolean);
  byId("locationMeta").textContent = metaParts.join(", ") || "Selected location";

  byId("currentDate").textContent = new Date(now.time).toLocaleString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  byId("currentIcon").textContent = info[1];
  byId("currentTemp").textContent = formatTemp(now.temperature_2m);
  byId("tempUnitMain").textContent = unit === "C" ? "°C" : "°F";
  byId("conditionText").textContent = info[0];
  byId("feelsLike").textContent = formatTemp(now.apparent_temperature);

  byId("humidity").textContent = now.relative_humidity_2m + "%";
  byId("windSpeed").textContent = Math.round(now.wind_speed_10m) + " km/h";
  byId("pressure").textContent = Math.round(now.pressure_msl) + " hPa";
  byId("cloudCover").textContent = now.cloud_cover + "%";

  byId("highlightFeels").textContent = formatTemp(now.apparent_temperature);
  byId("highlightHumidity").textContent = now.relative_humidity_2m + "%";
  byId("highlightWind").textContent = Math.round(now.wind_speed_10m) + " km/h";

  const uv = daily.uv_index_max && daily.uv_index_max[0];
  byId("uvIndex").textContent = uv != null ? uv + " " + uvLabel(uv) : "—";
  byId("sunrise").textContent = formatTime(daily.sunrise[0]);
  byId("sunset").textContent = formatTime(daily.sunset[0]);

  // precipitation card
  const chance = daily.precipitation_probability_max
    ? daily.precipitation_probability_max[0]
    : 0;
  byId("precipChance").textContent = (chance || 0) + "%";
  byId("precipNow").textContent = (now.precipitation || 0) + " mm";
  byId("precipMax").textContent = (daily.precipitation_sum[0] || 0) + " mm";

  // wind compass - arrow rotates to show where the wind comes from
  const windSpeed = now.wind_speed_10m || 0;
  const gusts = now.wind_gusts_10m || 0;
  const windDeg = now.wind_direction_10m || 0;

  byId("windValue").textContent = Math.round(windSpeed) + " km/h";
  byId("windGusts").textContent = Math.round(gusts) + " km/h";
  byId("windDir").textContent = directionName(windDeg) + " (" + Math.round(windDeg) + "°)";
  byId("windArrow").style.transform = "rotate(" + windDeg + "deg)";

  const fav = byId("favoriteButton");
  if (isFavorite(place.name)) {
    fav.textContent = "♥";
    fav.setAttribute("aria-pressed", "true");
  } else {
    fav.textContent = "♡";
    fav.setAttribute("aria-pressed", "false");
  }

  showHourly(data.hourly, now.time);
  showDaily(daily);
  showInsight(now);
}

function showHourly(hourly, currentTime) {
  const box = byId("hourlyForecast");
  box.innerHTML = "";

  // find the first hour that is >= current time
  let start = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i] >= currentTime) {
      start = i;
      break;
    }
  }

  const end = Math.min(hourly.time.length, start + 6);

  for (let i = start; i < end; i++) {
    const info = infoFor(hourly.weather_code[i]);
    const label = i === start ? "Now" : formatTime(hourly.time[i]);

    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML =
      '<div class="hour-time">' + label + '</div>' +
      '<span class="hour-icon">' + info[1] + '</span>' +
      '<strong>' + formatTemp(hourly.temperature_2m[i]) + '</strong>';
    box.appendChild(card);
  }
}

function showDaily(daily) {
  const box = byId("dailyForecast");
  box.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i];
    const info = infoFor(daily.weather_code[i]);
    const name = i === 0 ? "Today" : formatDay(date);

    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML =
      '<div class="day-name">' + name + '</div>' +
      '<div class="day-date">' + formatDate(date) + '</div>' +
      '<span class="day-icon">' + info[1] + '</span>' +
      '<div class="day-high">' + formatTemp(daily.temperature_2m_max[i]) + '</div>' +
      '<div class="day-low">' + formatTemp(daily.temperature_2m_min[i]) + '</div>';
    box.appendChild(card);
  }
}

function showInsight(now) {
  let icon = "🌤️";
  let title = "Enjoy your day";
  let tip = "Conditions look comfortable. Check the forecast before heading out.";

  if (RAIN_CODES.includes(now.weather_code)) {
    icon = "☔";
    title = "Consider taking an umbrella";
    tip = "Rain or storms are reported. Bring rain protection.";
  } else if (now.temperature_2m >= 32) {
    icon = "🧴";
    title = "Stay cool and hydrated";
    tip = "It's warm outside. Drink water and rest in the shade.";
  } else if (now.temperature_2m <= 8) {
    icon = "🧣";
    title = "Dress for the chill";
    tip = "Cool conditions - consider an extra layer.";
  } else if (now.wind_speed_10m >= 30) {
    icon = "💨";
    title = "Windy conditions";
    tip = "Secure loose items outdoors.";
  }

  byId("insightIcon").textContent = icon;
  byId("insightTitle").textContent = title;
  byId("weatherTip").textContent = tip;
}

function isFavorite(name) {
  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].toLowerCase() === name.toLowerCase()) return true;
  }
  return false;
}

function showFavorites() {
  const box = byId("favoriteList");
  byId("favoriteCount").textContent = favorites.length + " saved";
  box.innerHTML = "";

  if (favorites.length === 0) {
    box.innerHTML = '<p class="muted empty-state">No favorites yet. Search a city and tap the heart ♡ to save it here.</p>';
    return;
  }

  favorites.forEach((name) => {
    const row = document.createElement("div");
    row.className = "saved-city";

    const open = document.createElement("button");
    open.className = "city-open";
    open.type = "button";
    open.textContent = "⌖  " + name;
    open.addEventListener("click", () => selectCity(name));

    const remove = document.createElement("button");
    remove.className = "remove-city";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove " + name);
    remove.addEventListener("click", () => removeFavorite(name));

    row.appendChild(open);
    row.appendChild(remove);
    box.appendChild(row);
  });
}

function showRecent() {
  const box = byId("recentList");
  box.innerHTML = "";

  if (recent.length === 0) {
    box.innerHTML = '<p class="muted empty-state">Your recent searches will appear here.</p>';
    return;
  }

  recent.forEach((name) => {
    const row = document.createElement("div");
    row.className = "recent-city";

    const open = document.createElement("button");
    open.className = "city-open";
    open.type = "button";
    open.textContent = "◷  " + name;
    open.addEventListener("click", () => selectCity(name));

    row.appendChild(open);
    box.appendChild(row);
  });
}

function removeFavorite(name) {
  favorites = favorites.filter((c) => c.toLowerCase() !== name.toLowerCase());
  save("weathervista:favorites", favorites);
  showFavorites();
  if (currentPlace) showWeather(currentPlace, currentData);
  showToast(name + " removed from favorites.");
}

function toggleFavorite() {
  if (!currentPlace) return;
  const name = currentPlace.name;

  if (isFavorite(name)) {
    removeFavorite(name);
    return;
  }

  favorites.unshift(name);
  if (favorites.length > 8) favorites.pop();

  save("weathervista:favorites", favorites);
  showFavorites();
  showWeather(currentPlace, currentData);
  showToast(name + " added to favorites.");
}

function addRecent(name) {
  recent = recent.filter((c) => c.toLowerCase() !== name.toLowerCase());
  recent.unshift(name);
  if (recent.length > 6) recent.pop();
  save("weathervista:recent", recent);
  showRecent();
}

// addToRecent is only true when the user actually typed + pressed Search.
// Page load, refresh, and geolocation do NOT add to the list.
async function loadCity(name, addToRecent) {
  if (loading) return;

  name = name.trim();
  if (!name) {
    setStatus("Enter a city name to search.", true);
    return;
  }

  setLoading(true);
  setStatus("Finding weather for " + name + "…");

  try {
    const place = await searchCity(name);
    const data = await getForecast(place);

    currentPlace = place;
    currentData = data;

    showWeather(place, data);

    if (addToRecent) addRecent(place.name);

    setStatus("Weather updated for " + place.name + ".");
    byId("cityInput").value = "";
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function refreshCurrent() {
  if (!currentPlace || loading) return;

  const refreshBtn = byId("refreshButton");
  setLoading(true);
  setStatus("Refreshing weather…");
  refreshBtn.classList.add("spinning");

  try {
    const data = await getForecast(currentPlace);
    currentData = data;
    showWeather(currentPlace, data);
    setStatus("Weather updated for " + currentPlace.name + ".");
  } catch (error) {
    setStatus(error.message, true);
  }

  refreshBtn.classList.remove("spinning");
  setLoading(false);
}

function useMyLocation() {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported by this browser.", true);
    return;
  }
  if (loading) return;

  setLoading(true);
  setStatus("Getting weather for your location…");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const place = {
          name: "My location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          country: "",
          admin1: ""
        };
        const data = await getForecast(place);
        currentPlace = place;
        currentData = data;
        showWeather(place, data);
        setStatus("Weather updated for your current location.");
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        setLoading(false);
      }
    },
    (error) => {
      setLoading(false);
      if (error.code === 1) {
        setStatus("Location permission denied. Search for a city instead.", true);
      } else {
        setStatus("Could not get your location. Try again.", true);
      }
    }
  );
}

function changeUnit(newUnit) {
  unit = newUnit;
  save("weathervista:unit", unit);

  byId("celsiusButton").classList.toggle("selected", unit === "C");
  byId("fahrenheitButton").classList.toggle("selected", unit === "F");

  if (currentPlace) showWeather(currentPlace, currentData);
}

function toggleTheme() {
  isLight = !isLight;
  save("weathervista:light", isLight);
  document.body.classList.toggle("light-theme", isLight);
  byId("themeToggle").textContent = isLight ? "☀" : "☾";
  byId("themeSettingButton").textContent = isLight ? "☀ Light mode" : "☾ Dark mode";
}

// wiring

byId("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  loadCity(byId("cityInput").value, true); // true = real search
});

byId("locationButton").addEventListener("click", useMyLocation);
byId("favoriteButton").addEventListener("click", toggleFavorite);
byId("refreshButton").addEventListener("click", refreshCurrent);

byId("celsiusButton").addEventListener("click", () => changeUnit("C"));
byId("fahrenheitButton").addEventListener("click", () => changeUnit("F"));

byId("themeToggle").addEventListener("click", toggleTheme);
byId("themeSettingButton").addEventListener("click", toggleTheme);

byId("clearRecent").addEventListener("click", () => {
  recent = [];
  save("weathervista:recent", recent);
  showRecent();
  showToast("Recent searches cleared.");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

document.querySelector(".brand").addEventListener("click", (e) => {
  e.preventDefault();
  showPage("home");
});

// start

if (isLight) {
  document.body.classList.add("light-theme");
  byId("themeToggle").textContent = "☀";
  byId("themeSettingButton").textContent = "☀ Light mode";
}

changeUnit(unit);
showFavorites();
showRecent();
loadCity("Lahore");

// auto-refresh every 10 min
setInterval(() => {
  if (currentPlace && !loading) refreshCurrent();
}, 10 * 60 * 1000);