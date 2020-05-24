import express from "express";
import { fetchStation, fetchStationMeasurements, fetchAllStations } from "../processing.js";
import { findAverageMeasurementForDay, findAverageMeasurementFromTo } from "../database.js";
let router = express.Router();

router.get("/station", async (req, res) => {
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
					req.query.to
				)
			);
		} else if (req.query.day) {
			res.json(
				await findAverageMeasurementForDay(req.params.id, req.query.day)
			);
		} else {
			let response = await fetchStationMeasurements(req.params.id);
			/*for(let sensor of response) {
				let latestValue = sensor.values[0];
				delete sensor.values;
				sensor.date = latestValue.date;
				sensor.value = latestValue.value;
			}*/
			res.json(response);
		}
	} catch (error) {
		next(error);
	}
});

export default router;
