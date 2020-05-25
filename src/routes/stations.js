import express from "express";
import {
	fetchStation,
	fetchStationMeasurements,
	fetchAllStations,
} from "../processing.js";
import {
	findAverageMeasurementForDay,
	findAverageMeasurementFromTo,
	db,
} from "../database.js";
let router = express.Router();

router.get("/", (req, res) =>
	res.send(`Air condition API<br><br>
	Available routes:<br>
	/station returns all stations<br>
	/station/{id} returns station with a given id<br>
	/station/{id}/data returns data for all sensors on station with given id<br>
	/station/{id}/data?day={date in format YYYY-MM-DD} returns average data for all sensors on station with given id on a given day<br>
	/station/{id}/data?from={date in format YYYY-MM-DD}&to={date in format YYYY-MM-DD} returns average data for all sensors on station with given id in specified time period`)
);

router.get("/station", async (req, res, next) => {
	try {
		res.send(await fetchAllStations());
	} catch (error) {
		next(error);
	}
});

router.get("/station/:id", async (req, res, next) => {
	try {
		res.send(await fetchStation(req.params.id));
	} catch (error) {
		next(error);
	}
});

router.get("/station/:id/data", async (req, res, next) => {
	try {
		if (req.query.from && req.query.to) {
			res.json(
				await findAverageMeasurementFromTo(
					req.params.id,
					req.query.from,
					req.query.to,
					db
				)
			);
		} else if (req.query.day) {
			res.json(
				await findAverageMeasurementForDay(req.params.id, req.query.day, db)
			);
		} else {
			let response = await fetchStationMeasurements(req.params.id);
			for (let sensor of response) {
				let latestValue = sensor.values[0];
				delete sensor.values;
				sensor.date = latestValue.date;
				sensor.value = latestValue.value;
			}
			res.json(response);
		}
	} catch (error) {
		next(error);
	}
});

export default router;
