import chai from "chai";
import chaiHttp from "chai-http";
import express from "express";
import router from "../routes/stations.js";

chai.use(chaiHttp);
chai.should();

const app = express();
const port = 4000;
app.use(router);

app.use((err, req, res, next) => {
	if(err.status && err.message) res.status(err.status).send(err.message);
	else res.status(500).send();
});

app.listen(port, async () => {
    console.log(`Air condition API listening at http://localhost:${port}`);
});

describe("Stations", () => {
	describe("All stations", () => {
		it("should get all stations", function (done) {
			this.timeout(10000);
			chai
				.request(app)
				.get("/station")
				.end((err, res) => {
					res.should.have.status(200);
                    res.body.should.be.a("array");
                    for(let element of res.body) {
                        element.should.include.keys(["id", "stationName", "gegrLat", "gegrLon", "city"]);
                        element.id.should.be.a("number");
                        element.stationName.should.be.a("string");

                        //Those two are suprisingly sent as strings, not floats 
                        element.gegrLat.should.be.a("string");
                        element.gegrLon.should.be.a("string");

                        element.city.should.be.a("object");
                    }
					done();
				});
		});
		it("should get a single station", function (done) {
			this.timeout(5000);
			const id = 14;
			chai
				.request(app)
				.get(`/station/${id}`)
				.end((err, res) => {
					res.should.have.status(200);
                    res.body.should.be.a("array");
                    for(let element of res.body) {
                        element.should.include.keys(["id", "stationId", "param"]);
                        element.id.should.be.a("number");
                        element.stationId.should.be.a("number");
                        element.param.should.be.a("object");
                    }
					done();
				});
		});
		it("should get an error when called with wrong stationId", function (done) {
			this.timeout(5000);
			const id = 2;
			chai
				.request(app)
				.get(`/station/${id}`)
				.end((err, res) => {
					res.should.satisfy(() => res.status === 500 || res.status === 404);
					done();
				});
		});
		it("should get a data for a specific station", function (done) {
			this.timeout(10000);
			const id = 52;
			chai
				.request(app)
				.get(`/station/${id}/data`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("array");
					for (let element of res.body) {
                        element.should.include.keys(["key", "date", "value"]);
                        element.value.should.be.a("number");
                        element.key.should.be.a("string");
                        element.date.should.be.a("string");
					}
					done();
				});
        });
	});
});
