let express = require("express");
const fetch = require("node-fetch");
const processing = require("../processing");
let router = express.Router();

router.get("/station", (req, res) => {
	fetch("http://api.gios.gov.pl/pjp-api/rest/station/findAll")
		.then((response) => {
			if (response.ok) return response.json();
			else throw new Error(response.status);
		})
		.then((data) => {
			res.send(data);
		})
		.catch((error) => {
			res.status(500).send(error);
		});
});

router.get("/station/:id", async (req, res, next) => {
	/*fetch(`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${req.params.id}`)
		.then((response) => {
			if (response.ok) return response.json();
			else
				throw new Error({
					status: response.status,
					message: response.statusText,
				});
		})
		.then((data) => {
			res.send(data);
		})
		.catch((error) => {
			res.status(404).send();
        });*/
	try {
		res.send(await processing.fetchStation(req.params.id));
	} catch (error) {
		next(error);
	}
});

router.get("/station/:id/data", async (req, res, next) => {
	try {
		let sensors = [];
		let station = await processing.fetchStation(req.params.id);
		station.forEach((sensor) => {
			sensors.push(sensor.id);
		});	
		res.json(await processing.fetchSensorsValue(sensors));
	} catch (error) {
		next(error);
	}
});

module.exports = router;
