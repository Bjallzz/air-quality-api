import mongodb from "mongodb";
const url = "mongodb://localhost:27017";
const databaseName = "weather-api-database";
const collectionName = "stations";
let db;

const openConnection = () => {
	mongodb.MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			if (err) return console.log(err);
			db = client.db(databaseName);
			console.log(`Connected MongoDB: ${url}`);
			console.log(`Database: ${databaseName}`);
		}
	);
};

const storeMeasurements = (stationId, measurement) => {
	db.collection(collectionName).updateOne(
		{
			stationId: stationId,
			sensors: { $elemMatch: { substance: measurement.substance } },
		},
		{
			$push: {
				"sensors.$.measurements": {
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
		.catch((err) =>
			console.log(
				`Error while trying to find document for station: ${stationId}, substance: ${substanceName}`
			)
		);
};

const findAverageMeasurementForDay = async (stationId, day) => {
	day = new Date(day);
	let nextDay = new Date();
	nextDay.setDate(day.getDate() + 1);
	nextDay.setHours(2, 0, 0, 0);
	return db
		.collection(collectionName)
		.aggregate([
			{ $match: { stationId: +stationId } },
			//{ $project: {sensors: 1, stationId: 1}},
			//{ $unwind: "$sensors"}
			//{ $match: { sensors: { $gte: day, $lt: nextDay } } },
			//{ $group: { _id: null, average: { $avg: "$value" } } },
			//{ $project: { date: { $literal: day }, _id: 0, average: 1 } },
		])
		.toArray();
};

const findAverageMeasurementFromTo = async (stationId, from, to) => {
	db.collection(collectionName)
		.aggregate([
			{ $match: { date: { $gte: from, $lt: to } } },
			{ $group: { _id: null, average: { $avg: "$value" } } },
		])
		.toArray()
		.then((result) => {
			return result;
		})
		.catch((err) =>
			console.log(
				`Error while trying to find average for station: ${stationId}\n From: ${from}\nTo: ${to}`
			)
		);
};

export {
	openConnection,
	storeMeasurements,
	readLastMeasurement,
	findAverageMeasurementForDay,
	findAverageMeasurementFromTo,
};
