const express = require("express");
const app = express();
const port = 3000;
let stationsRoute = require('./routes/stations')

app.get("/", (req, res) => res.send("Hello World!"));

app.use(stationsRoute);

app.listen(port, () =>
	console.log(`Example app listening at http://localhost:${port}`)
);
