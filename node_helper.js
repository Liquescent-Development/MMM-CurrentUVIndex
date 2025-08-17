const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

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

		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				if (data.ok === false) {
					console.error("UV API returned error:", data);
					self.sendSocketNotification("UV_ERROR", data);
				} else {
					self.sendSocketNotification("UV_DATA", data);
				}
			})
			.catch(error => {
				console.error("Error fetching UV data:", error);
				self.sendSocketNotification("UV_ERROR", error.message);
			});
	}
});