const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const { backOff } = require("exponential-backoff");

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting node helper for: " + this.name);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "FETCH_UV_DATA") {
			this.fetchUVData(payload);
		}
	},

	fetchUVData: function(config) {
		const url = `https://currentuvindex.com/api/v1/uvi?latitude=${config.latitude}&longitude=${config.longitude}`;
		const self = this;

		const fetchWithValidation = async () => {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (data.ok === false) {
				throw new Error(`API error: ${JSON.stringify(data)}`);
			}
			return data;
		};

		backOff(fetchWithValidation, {
			numOfAttempts: 5,
			startingDelay: 5000,
			timeMultiple: 2,
			maxDelay: 300000, // 5 minutes max between retries
			jitter: "full",
			retry: (error, attemptNumber) => {
				console.warn(`${self.name}: Attempt ${attemptNumber} failed: ${error.message}. Retrying...`);
				return true;
			}
		})
			.then(data => {
				self.sendSocketNotification("UV_DATA", data);
			})
			.catch(error => {
				console.error(`${self.name}: All retry attempts exhausted: ${error.message}`);
				self.sendSocketNotification("UV_ERROR", { message: error.message, exhaustedRetries: true });
			});
	}
});