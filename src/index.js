import express from "express";
import router from "./routes/stations.js";
import openConnection from "../src/database.js";
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

app.use(router);

app.listen(port, () => {
	openConnection();
	console.log(`Weather API listening at http://localhost:${port}`);
});
