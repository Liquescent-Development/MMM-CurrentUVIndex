Module.register("MMM-CurrentUVIndex", {
	defaults: {
		latitude: null,
		longitude: null,
		updateInterval: 600000,
		retryDelay: 5000,
		animationSpeed: 1000,
		showForecast: false,
		forecastDays: 2,
		showHourly: true,
		hourlyHours: 4,
		showIcon: true,
		showSpectrum: true,
		colored: true,
		roundValue: false,
		label: "UV INDEX",
		compactMode: true,
		showHeader: false,
		appendLocationNameToHeader: false,
		locationName: "",
		header: ""
	},

	requiresVersion: "2.1.0",

	start: function() {
		Log.info("Starting module: " + this.name);
		this.uvData = null;
		this.loaded = false;
		this.error = null;
		
		if (this.config.latitude && this.config.longitude) {
			this.scheduleUpdate();
		} else {
			this.error = "MISSING_COORDS";
		}
	},

	scheduleUpdate: function(delay) {
		var nextLoad = delay || 0;
		var self = this;
		
		setTimeout(function() {
			self.sendSocketNotification("FETCH_UV_DATA", {
				latitude: self.config.latitude,
				longitude: self.config.longitude
			});
			self.scheduleUpdate(self.config.updateInterval);
		}, nextLoad);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "uv-index-wrapper";

		if (this.error) {
			wrapper.innerHTML = this.translate(this.error);
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.uvData || !this.uvData.now) {
			wrapper.innerHTML = this.translate("NO_DATA");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var currentUV = this.uvData.now.uvi;
		var uvLevel = this.getUVLevel(currentUV);

		var uvContainer = document.createElement("div");
		uvContainer.className = "uv-current";

		if (this.config.showIcon) {
			var iconSpan = document.createElement("span");
			iconSpan.className = "uv-icon wi wi-day-sunny";
			uvContainer.appendChild(iconSpan);
		}

		var labelSpan = document.createElement("span");
		labelSpan.className = "uv-label";
		labelSpan.innerHTML = this.config.label;
		uvContainer.appendChild(labelSpan);

		var valueSpan = document.createElement("span");
		valueSpan.className = "uv-value";
		if (this.config.colored) {
			valueSpan.className += " uv-" + uvLevel.class;
		}
		valueSpan.innerHTML = this.config.roundValue ? Math.round(currentUV) : currentUV.toFixed(1);
		uvContainer.appendChild(valueSpan);

		var statusSpan = document.createElement("span");
		statusSpan.className = "uv-status";
		if (this.config.colored) {
			statusSpan.className += " uv-" + uvLevel.class;
		}
		statusSpan.innerHTML = this.translate(uvLevel.label);
		uvContainer.appendChild(statusSpan);

		wrapper.appendChild(uvContainer);

		// Add UV spectrum bar
		if (this.config.showSpectrum) {
			var spectrumContainer = document.createElement("div");
			spectrumContainer.className = "uv-spectrum-container";
			
			var spectrumBar = document.createElement("div");
			spectrumBar.className = "uv-spectrum-bar";
			spectrumContainer.appendChild(spectrumBar);
			
			var indicator = document.createElement("div");
			indicator.className = "uv-spectrum-indicator";
			// Calculate position based on UV value (0-11 scale, cap at 11 for display)
			var position = Math.min(currentUV / 11 * 100, 100);
			indicator.style.left = position + "%";
			spectrumContainer.appendChild(indicator);
			
			// Add scale labels
			var labels = document.createElement("div");
			labels.className = "uv-spectrum-labels";
			labels.innerHTML = "<span>0</span><span>3</span><span>6</span><span>8</span><span>11+</span>";
			spectrumContainer.appendChild(labels);
			
			wrapper.appendChild(spectrumContainer);
		}

		if (this.config.showHourly && this.uvData.forecast) {
			var hourlyContainer = document.createElement("div");
			hourlyContainer.className = "uv-hourly";
			
			var hourlyData = this.getHourlyForecast(this.uvData.forecast);
			
			hourlyData.forEach(function(hour) {
				var hourDiv = document.createElement("div");
				hourDiv.className = "uv-hourly-item";
				
				var timeSpan = document.createElement("span");
				timeSpan.className = "uv-hourly-time";
				timeSpan.innerHTML = hour.time;
				hourDiv.appendChild(timeSpan);
				
				var valueSpan = document.createElement("span");
				valueSpan.className = "uv-hourly-value";
				var hourLevel = this.getUVLevel(hour.uvi);
				if (this.config.colored) {
					valueSpan.className += " uv-" + hourLevel.class;
				}
				valueSpan.innerHTML = this.config.roundValue ? Math.round(hour.uvi) : hour.uvi.toFixed(1);
				hourDiv.appendChild(valueSpan);
				
				hourlyContainer.appendChild(hourDiv);
			}.bind(this));
			
			wrapper.appendChild(hourlyContainer);
		}

		if (this.config.showForecast && this.uvData.forecast) {
			var forecastContainer = document.createElement("div");
			forecastContainer.className = "uv-forecast";

			var today = new Date();
			var forecastData = this.processForecastData(this.uvData.forecast);
			
			for (var i = 1; i <= Math.min(this.config.forecastDays, forecastData.length - 1); i++) {
				if (forecastData[i]) {
					var forecastDay = document.createElement("div");
					forecastDay.className = "uv-forecast-day";

					var dayLabel = document.createElement("span");
					dayLabel.className = "uv-forecast-label";
					var forecastDate = new Date(today);
					forecastDate.setDate(today.getDate() + i);
					dayLabel.innerHTML = this.getDayName(forecastDate);
					forecastDay.appendChild(dayLabel);

					var dayValue = document.createElement("span");
					dayValue.className = "uv-forecast-value";
					var maxUV = forecastData[i].max;
					var dayLevel = this.getUVLevel(maxUV);
					if (this.config.colored) {
						dayValue.className += " uv-" + dayLevel.class;
					}
					dayValue.innerHTML = this.config.roundValue ? Math.round(maxUV) : maxUV.toFixed(1);
					forecastDay.appendChild(dayValue);

					forecastContainer.appendChild(forecastDay);
				}
			}
			
			wrapper.appendChild(forecastContainer);
		}

		return wrapper;
	},

	processForecastData: function(forecast) {
		var dailyMax = {};
		
		forecast.forEach(function(item) {
			var date = new Date(item.time);
			var dateKey = date.toDateString();
			
			if (!dailyMax[dateKey] || item.uvi > dailyMax[dateKey]) {
				dailyMax[dateKey] = item.uvi;
			}
		});

		var result = [];
		var dates = Object.keys(dailyMax);
		dates.sort();
		
		dates.forEach(function(date) {
			result.push({
				date: date,
				max: dailyMax[date]
			});
		});

		return result;
	},

	getDayName: function(date) {
		var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[date.getDay()];
	},

	getHourlyForecast: function(forecast) {
		var now = new Date();
		var result = [];
		
		// Get next hours from forecast (excluding current hour)
		var hoursAdded = 0;
		for (var i = 0; i < forecast.length && hoursAdded < this.config.hourlyHours; i++) {
			var forecastTime = new Date(forecast[i].time);
			
			// Only include future hours
			if (forecastTime > now) {
				var hours = forecastTime.getHours();
				var ampm = hours >= 12 ? "pm" : "am";
				hours = hours % 12;
				hours = hours ? hours : 12;
				
				result.push({
					time: hours + ampm,
					uvi: forecast[i].uvi
				});
				hoursAdded++;
			}
		}
		
		return result;
	},

	getUVLevel: function(uvi) {
		if (uvi <= 2) {
			return { label: "LOW", class: "low" };
		} else if (uvi <= 5) {
			return { label: "MODERATE", class: "moderate" };
		} else if (uvi <= 7) {
			return { label: "HIGH", class: "high" };
		} else if (uvi <= 10) {
			return { label: "VERY_HIGH", class: "very-high" };
		} else {
			return { label: "EXTREME", class: "extreme" };
		}
	},

	getHeader: function() {
		if (!this.config.showHeader) {
			return "";
		}
		if (this.config.header) {
			return this.config.header;
		}
		var header = this.translate("TITLE");
		if (this.config.appendLocationNameToHeader && this.config.locationName) {
			header += " - " + this.config.locationName;
		}
		return header;
	},

	getStyles: function() {
		return ["MMM-CurrentUVIndex.css"];
	},

	getTranslations: function() {
		return {
			en: "translations/en.json",
			de: "translations/de.json",
			es: "translations/es.json",
			fr: "translations/fr.json"
		};
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "UV_DATA") {
			this.uvData = payload;
			this.loaded = true;
			this.error = null;
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "UV_ERROR") {
			this.error = "FETCH_ERROR";
			this.updateDom(this.config.animationSpeed);
			this.scheduleUpdate(this.config.retryDelay);
		}
	},

	notificationReceived: function(notification, payload, sender) {
		if (notification === "MODULE_DOM_CREATED") {
			if (this.config.latitude && this.config.longitude) {
				this.sendSocketNotification("FETCH_UV_DATA", {
					latitude: this.config.latitude,
					longitude: this.config.longitude
				});
			}
		}
	}
});