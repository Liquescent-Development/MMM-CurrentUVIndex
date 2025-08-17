# MMM-CurrentUVIndex

A MagicMirror² module that displays real-time UV index data from currentuvindex.com. This module provides current UV index readings with color-coded severity levels and optional forecasts, matching the clean aesthetic of your MagicMirror display.

![UV Index Display Example](screenshot.png)

## Features

- Real-time UV index display with automatic updates
- Color-coded severity levels (Low, Moderate, High, Very High, Extreme)
- Optional UV forecast for upcoming days
- Multiple language support (English, German, Spanish, French)
- Clean, minimalist design matching MagicMirror's default aesthetic
- No API key required
- Configurable update intervals

## Installation

1. Navigate to your MagicMirror's modules folder:
```bash
cd ~/MagicMirror/modules/
```

2. Clone this repository:
```bash
git clone https://github.com/liquescent/MMM-CurrentUVIndex.git
```

3. Navigate to the module folder and install dependencies:
```bash
cd MMM-CurrentUVIndex
npm install
```

## Configuration

Add the following configuration to your `config/config.js` file:

```javascript
{
    module: "MMM-CurrentUVIndex",
    position: "top_right",
    config: {
        latitude: 40.6943,
        longitude: -73.9249,
        updateInterval: 600000,
        showForecast: false,
        colored: true
    }
}
```

### Configuration Options

| Option | Description | Type | Default |
|--------|-------------|------|---------|
| `latitude` | **Required** - Latitude of your location | Number | `null` |
| `longitude` | **Required** - Longitude of your location | Number | `null` |
| `updateInterval` | How often to fetch new data (milliseconds) | Number | `600000` (10 minutes) |
| `retryDelay` | Delay before retrying after error (milliseconds) | Number | `5000` (5 seconds) |
| `animationSpeed` | Speed of update animations (milliseconds) | Number | `1000` |
| `showForecast` | Show UV forecast for upcoming days | Boolean | `false` |
| `forecastDays` | Number of forecast days to display (1-5) | Number | `2` |
| `showHourly` | Show hourly UV forecast (current + next hours) | Boolean | `true` |
| `hourlyHours` | Number of future hours to display (1-12) | Number | `4` |
| `showIcon` | Display sun icon next to UV value | Boolean | `true` |
| `colored` | Use color coding for UV levels | Boolean | `true` |
| `roundValue` | Round UV values to nearest integer | Boolean | `false` |
| `label` | Label text before UV value | String | `"UV INDEX"` |
| `compactMode` | Use compact layout for center positions | Boolean | `true` |
| `showHeader` | Show module header | Boolean | `false` |
| `appendLocationNameToHeader` | Add location name to module header | Boolean | `false` |
| `locationName` | Name of location for header | String | `""` |
| `header` | Custom header text (overrides default) | String | `""` |

### Example Configurations

#### Basic Configuration
```javascript
{
    module: "MMM-CurrentUVIndex",
    position: "top_right",
    config: {
        latitude: 40.6943,
        longitude: -73.9249
    }
}
```

#### With Daily Forecast
```javascript
{
    module: "MMM-CurrentUVIndex",
    position: "top_right",
    config: {
        latitude: 40.6943,
        longitude: -73.9249,
        showForecast: true,
        forecastDays: 3,
        showHourly: false,
        colored: true
    }
}
```

#### With Hourly Forecast (Default)
```javascript
{
    module: "MMM-CurrentUVIndex",
    position: "top_center",
    config: {
        latitude: 40.6943,
        longitude: -73.9249,
        showHourly: true,
        hourlyHours: 4,
        showForecast: false,
        colored: true
    }
}
```

#### Minimal Display
```javascript
{
    module: "MMM-CurrentUVIndex",
    position: "top_bar",
    config: {
        latitude: 40.6943,
        longitude: -73.9249,
        showIcon: false,
        colored: false,
        roundValue: true,
        label: "UV:"
    }
}
```

## UV Index Levels

The module displays UV index levels according to WHO standards:

| UV Index | Risk Level | Color |
|----------|------------|-------|
| 0-2 | Low | Green |
| 3-5 | Moderate | Yellow |
| 6-7 | High | Orange |
| 8-10 | Very High | Red |
| 11+ | Extreme | Purple |

## API Information

This module uses the free [currentuvindex.com](https://currentuvindex.com) API which provides:
- Current UV index
- 5-day hourly forecast
- 24-hour historical data
- No API key required
- Rate limit: 500 requests per IP per day

## Styling

The module includes default CSS that matches MagicMirror's aesthetic. You can customize the appearance by adding styles to your `custom.css` file:

```css
.MMM-CurrentUVIndex .uv-value {
    font-size: 20px;
    font-weight: bold;
}

.MMM-CurrentUVIndex .uv-status {
    text-transform: uppercase;
}
```

## Troubleshooting

### No data displayed
- Ensure `latitude` and `longitude` are correctly configured
- Check your internet connection
- Verify you haven't exceeded the API rate limit (500 requests/day)

### Module not loading
- Check the browser console for errors (F12)
- Ensure all dependencies are installed (`npm install`)
- Verify the module is correctly added to `config.js`

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- UV data provided by [currentuvindex.com](https://currentuvindex.com) under CC BY 4.0 license
- Weather icons from [Weather Icons](https://erikflowers.github.io/weather-icons/)
- Built for [MagicMirror²](https://magicmirror.builders/)

## Author

Liquescent

## Changelog

### Version 1.0.1
- Improved layout for center positions
- Added horizontal forecast display
- Added hourly UV forecast (current + next 4 hours)
- Now displays real-time current UV value from API
- Added showHourly and hourlyHours configuration options
- Added compactMode and showHeader options
- Better space utilization
- Updated default label to "UV INDEX"

### Version 1.0.0
- Initial release
- Current UV index display
- Optional forecast
- Multi-language support
- Color-coded severity levels