import express from "express";
import router from "./routes/stations.js";
import { openConnection, setupDatabase } from "../src/database.js";
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

app.use(router);

openConnection(() => {
	app.listen(port, () => {
		setupDatabase();
		console.log(`Weather API listening at http://localhost:${port}`);
	});
});
