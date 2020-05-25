import express from "express";
import router from "./routes/stations.js";
import {
	openConnection,
	setupDatabase,
	updateDatabase,
} from "../src/database.js";
const app = express();
const port = 3000;

app.use(router);

openConnection(() => {
	app.listen(port, async () => {
		await setupDatabase();
		console.log(`Weather API listening at http://localhost:${port}`);

		//Update the database every hour
		setInterval(updateDatabase, 1000 * 60 * 60);
	});
});
