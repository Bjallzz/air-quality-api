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

//Generic error handler
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
	if(err.status && err.message) res.status(err.status).send(err.message);
	else res.status(500).send();
});
/* eslint-ensable no-unused-vars */

openConnection(() => {
	app.listen(port, async () => {
		await setupDatabase();
		console.log(`Air condition API listening at http://localhost:${port}`);

		//Update the database every hour
		setInterval(updateDatabase, 1000 * 60 * 60);
	});
});
