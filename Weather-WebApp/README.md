# ClimaVanta - My Weather App

This is a weather app I built to practice my front-end skills. It gets live weather data from a free API and shows it on a clean dashboard. 

I built this using only plain HTML, CSS, and JavaScript. No frameworks like React or jQuery.

## What it can do

- **Search:** Look up the weather for any city.
- **My Location:** Click a button to get the weather where you are right now.
- **Current Weather:** See the temperature, wind speed, humidity, and pressure.
- **Forecasts:** See the next 6 hours and the next 7 days.
- **Wind & Rain:** A cool compass that shows wind direction, and a card for rain chance.
- **Favorites & Recent:** Save up to 8 cities to your favorites. The lists scroll inside their boxes so they don't make the page super long.
- **Settings:** Switch between °C/°F and Dark/Light mode. It remembers your choices.
- **Auto-Refresh:** It refreshes the weather by itself every 10 minutes.

## Tools I used

- **HTML5** for the layout.
- **CSS3** for styling (Grid, Flexbox, and media queries for mobile).
- **Vanilla JavaScript** for the logic.
- **Open-Meteo API** for the weather data (it's free and doesn't need an API key).

## How to run it

You don't need to install anything. Just download the folder and double-click `index.html` to open it in your browser. 

(If you use VS Code, I recommend using the "Live Server" extension).

## Folder setup

```text
climavanta/
│
├── index.html          # The main page
├── README.md           # This file
│
├── css/
│   └── style.css       # All the styling
│
├── js/
│   └── script.js       # All the logic and API calls
│
└── images/
    └── logo.png        # The logo