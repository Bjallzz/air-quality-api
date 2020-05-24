import mongodb from "mongodb";
import { fetchAllStations, fetchStationMeasurements } from "./processing.js";
const url = "mongodb://localhost:27017";
const databaseName = "weather-api-database";
const collectionName = "stations";
let db;

const openConnection = (callback) => {
	mongodb.MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			if (err) return console.log(err);
			db = client.db(databaseName);
			console.log(`Connected MongoDB: ${url}`);
			console.log(`Database: ${databaseName}`);
			callback();
		}
	);
};

const setupDatabase = async () => {
	console.log("Database setup started");
	let stations = await fetchAllStations();
	let query = [];
	for (let station of stations) {
		query.push({
			updateOne: {
				filter: { stationId: station.id },
				update: { $setOnInsert: { stationId: station.id, sensors: [] } },
				upsert: true,
			},
		});
	}

	let result = await db.collection(collectionName).bulkWrite(query);

	query = [];

	let databaseStations = await db
		.collection(collectionName)
		.find(
			{},
			{
				sensors: 1,
			}
		)
		.toArray();

	for (let station of databaseStations) {
		let sensors = await fetchStationMeasurements(station.stationId);

		let databaseSensors = station.sensors;
		databaseSensors = databaseSensors.map(
			(databaseSensor) => databaseSensor.key
		);

		for (let sensor of sensors) {
			if (!databaseSensors.includes(sensor.key)) {
				query.push({
					updateOne: {
						filter: { stationId: station.stationId },
						update: { $push: { sensors: { key: sensor.key, values: [] } } },
					},
				});
			}

			let newMeasurements = [];

			for (let measurement of sensor.values) {
				if (!databaseSensors.some((entry) => entry.date === measurement.date)) {
					measurement.date = new Date(measurement.date);
					newMeasurements.push(measurement);
				}
			}

			query.push({
				updateOne: {
					filter: {
						$and: [
							{ stationId: station.stationId },
							{ "sensors.key": sensor.key },
						],
					},
					update: { $push: { "sensors.$.values": { $each: newMeasurements } } },
				},
			});
		}
		process.stdout.write(
			"Processing stations: " +
				"[" +
				(databaseStations.indexOf(station) + 1) +
				"/" +
				databaseStations.length +
				"]" +
				"\r"
		);
	}
	result = await db.collection(collectionName).bulkWrite(query);
	console.log("\n");
	console.log(result);
	console.log("Database setup complete");
};

const updateDatabase = async () => {
	console.log("Database update started");
	let stations = await fetchAllStations();
	let query = [];
	for (let station of stations) {
		let sensors = await fetchStationMeasurements(station.id);
		for (let sensor of sensors) {
			query.push({
				updateOne: {
					filter: {
						$and: [{ stationId: station.id }, { "sensors.key": sensor.key }],
					},
					update: { $addToSet: { "sensors.$.values": sensor.values[0] } },
				},
			});
		}
		process.stdout.write(
			"Updating stations: " +
				"[" +
				(stations.indexOf(station) + 1) +
				"/" +
				stations.length +
				"]" +
				"\r"
		);
	}
	let result = await db.collection(collectionName).bulkWrite(query);
	console.log("\n");
	console.log(result);
	console.log("Database update complete");
};

const storeMeasurements = (stationId, measurement) => {
	db.collection(collectionName).updateOne(
		{
			stationId: stationId,
			sensors: { $elemMatch: { key: measurement.substance } },
		},
		{
			$push: {
				"sensors.$.values": {
					date: measurement.date,
					value: measurement.value,
				},
			},
		}
	);
};

const readLastMeasurement = (stationId, substanceName) => {
	db.collection(collectionName)
		.findOne({ $and: [{ stationId: stationId, key: substanceName }] })
		.sort({ date: -1 })
		.then((result) => {
			return result;
		})
		.catch((error) =>
			console.log(
				`Error while trying to find document for station: ${stationId}, substance: ${substanceName}\n${error}`
			)
		);
};

const findAverageMeasurementForDay = async (stationId, day) => {
	day = new Date(day);
	let nextDay = new Date();
	nextDay.setDate(day.getDate() + 1);
	nextDay.setUTCHours(0, 0, 0, 0);
	return db
		.collection(collectionName)
		.aggregate([
			{ $match: { stationId: +stationId } },
			{ $unwind: "$sensors" },
			{ $unwind: "$sensors.values" },
			{ $match: { "sensors.values.date": { $gte: day, $lt: nextDay } } },
			{
				$group: {
					_id: "$sensors.key",
					average: { $avg: "$sensors.values.value" },
				},
			},
			{
				$project: {
					stationId: { $literal: stationId },
					date: { $literal: day },
					_id: 1,
					average: { $round: ["$average", 2] },
				},
			},
		])
		.toArray();
};

const findAverageMeasurementFromTo = async (stationId, from, to) => {
	from = new Date(from);
	to = new Date(to);
	return db
		.collection(collectionName)
		.aggregate([
			{ $match: { stationId: +stationId } },
			{ $unwind: "$sensors" },
			{ $unwind: "$sensors.values" },
			{ $match: { "sensors.values.date": { $gte: from, $lt: to } } },
			{
				$group: {
					_id: "$sensors.key",
					average: { $avg: "$sensors.values.value" },
				},
			},
			{
				$project: {
					stationId: { $literal: stationId },
					from: { $literal: from },
					to: { $literal: to },
					_id: 1,
					average: { $round: ["$average", 2] },
				},
			},
		])
		.toArray();
};

export {
	openConnection,
	storeMeasurements,
	readLastMeasurement,
	findAverageMeasurementForDay,
	findAverageMeasurementFromTo,
	setupDatabase,
	updateDatabase,
};
