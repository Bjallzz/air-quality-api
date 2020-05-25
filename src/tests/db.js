import chai from "chai";
import chaiHttp from "chai-http";
import mongodb from "mongodb";
import {
	findAverageMeasurementForDay,
	findAverageMeasurementFromTo,
} from "../database.js";

chai.use(chaiHttp);
chai.should();

const url = "mongodb://localhost:27017";
const databaseName = "test-database";
const collectionName = "stations";

let db;

const mockStation = {
	stationId: 1337,
	sensors: [
		{
			key: "NO2",
			values: [
				{
					date: new Date("2020-05-22"),
					value: 16.7,
				},
				{
					date: new Date("2020-05-22"),
					value: 18.6,
				},
				{
					date: new Date("2020-05-23"),
					value: 21.2,
				},
			],
		},
		{
			key: "SO3",
			values: [
				{
					date: new Date("2020-05-22"),
					value: 12.7,
				},
				{
					date: new Date("2020-05-23"),
					value: 6.6,
				},
				{
					date: new Date("2020-05-24"),
					value: 3.2,
				},
			],
		},
	],
};

describe("Database", () => {
	mongodb.MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			if (err) return console.log(err);

			db = client.db(databaseName);
			console.log(`Connected MongoDB: ${url}`);
			console.log(`Database: ${databaseName}`);

			db.collection(collectionName).updateOne(
				{ stationId: mockStation.stationId },
				{ $setOnInsert: mockStation },
				{ upsert: true }
			);
		}
	);

	it("should return correct average for a given day", async function () {
		let result = await findAverageMeasurementForDay(1337, "2020-05-22", db);

		result.should.be.a("array");

		result.sort((a, b) => (a._id === "SO3" ? -1 : 1));

		result[0].should.be.a("object");
		result[1].should.be.a("object");

		result[0].should.include.keys("_id", "stationId", "date", "average");
		result[1].should.include.keys("_id", "stationId", "date", "average");

		result[0]._id.should.equal("SO3");
		result[0].stationId.should.equal(1337);
		result[0].date
			.toDateString()
			.should.equal(new Date("2020-05-22").toDateString());
		result[0].average.should.equal(12.7);

		result[1]._id.should.equal("NO2");
		result[1].stationId.should.equal(1337);
		result[1].date
			.toDateString()
			.should.equal(new Date("2020-05-22").toDateString());
		result[1].average.should.equal(17.65);
	});

	it("should return correct average for a given day interval", async function () {
		let result = await findAverageMeasurementFromTo(
			1337,
			"2020-05-22",
			"2020-05-24",
			db
		);

		result.should.be.a("array");

		result.sort((a, b) => (a._id === "SO3" ? -1 : 1));

		result[0].should.be.a("object");
		result[1].should.be.a("object");

		result[0].should.include.keys("_id", "stationId", "from", "to", "average");
		result[1].should.include.keys("_id", "stationId", "from", "to", "average");

		result[0]._id.should.equal("SO3");
		result[0].stationId.should.equal(1337);
		result[0].from
			.toDateString()
			.should.equal(new Date("2020-05-22").toDateString());
		result[0].to
			.toDateString()
			.should.equal(new Date("2020-05-24").toDateString());
		result[0].average.should.equal(9.65);

		result[1]._id.should.equal("NO2");
		result[1].stationId.should.equal(1337);
		result[1].from
			.toDateString()
			.should.equal(new Date("2020-05-22").toDateString());
		result[1].to
			.toDateString()
			.should.equal(new Date("2020-05-24").toDateString());
		result[1].average.should.equal(18.83);
    });
    it("should get an empty array for an incorrect time period", async function () {
		let result = await findAverageMeasurementFromTo(
			1337,
			"2020-05-22",
			"2020-05-21",
			db
        );
        
        result.should.be.a("array");
        result.length.should.equal(0);

    });
});
