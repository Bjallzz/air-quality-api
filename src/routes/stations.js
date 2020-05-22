import express from "express";
import fetch from "node-fetch";
import { fetchStation, fetchStationMeasurements } from "../processing.js";
import {
	findAverageMeasurementForDay,
	findAverageMeasurementFromTo,
} from "../database.js";
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
		res.send(await fetchStation(req.params.id));
	} catch (error) {
		next(error);
	}
});

router.get("/station/:id/data", async (req, res, next) => {
	try {
		if (req.query.from && req.query.to) {
			res.json(
				findAverageMeasurementFromTo(
					req.params.id,
					req.query.from,
					req.query.to
				)
			);
		} else if (req.query.day) {
			let average = await findAverageMeasurementForDay(
				req.params.id,
				req.query.day
			);
			console.log(average);
			res.json(average);
		} else {
			res.json(await fetchStationMeasurements(req.params.id));
		}
	} catch (error) {
		next(error);
	}
});

export default router;
