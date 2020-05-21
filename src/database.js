import mongodb from "mongodb";
const url = "mongodb://localhost:27017";
const databaseName = "weather-api-database";
let db;

const openConnection = () => {
	mongodb.MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			if (err) return console.log(err);

			// Storing a reference to the database so you can use it later
			db = client.db(databaseName);
			//db.createCollection("measurements", (err, results) => {
			//	console.log("Collection created");
			//});
			//db.collection('measurements').insertOne({value: 14, date: new Date});
			console.log(`Connected MongoDB: ${url}`);
			console.log(`Database: ${databaseName}`);
		}
	);
};

export default openConnection;
