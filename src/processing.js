import fetch from "node-fetch";

const fetchRetry = async (url, n) => {
	try {
        return await fetch(url)
    } catch(error) {
		console.log("Fetch failed: Retrying fetch for url " + url + "\nTries remaining: " + n - 1);
        if (n === 1) throw error;
        return await fetchRetry(url, n - 1);
    }
}

const fetchSensor = async (id) => {
	let response = await fetchRetry(`http://api.gios.gov.pl/pjp-api/rest/data/getData/${id}`, 3);
	let data = await response.json();
	if (response.ok) {
		let measurement = {};
		measurement.values = [];
		measurement.key = data.key;
		for (let value of data.values) {
			if (value.value !== null) {
				measurement.values.push({ date: value.date, value: value.value });
			}
		}
		return measurement;
	} else {
		let error = new Error();
		error.status = data.status;
		error.message = data.statusText;
		throw error;
	}
};

const fetchStation = async (id) => {
	let response = await fetchRetry(`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${id}`, 3);
	let data = await response.json();
	if (response.ok) {
		return data;
	} else {
		let error = new Error();
		error.status = data.status;
		error.message = data.statusText;
		throw error;
	}
};

const fetchAllStations = async () => {
	let response = await fetchRetry("http://api.gios.gov.pl/pjp-api/rest/station/findAll", 3);
	let data = await response.json();
	if (response.ok) {
		return data;
	} else {
		let error = new Error();
		error.status = data.status;
		error.message = data.statusText;
		throw error;
	}
};

const fetchSensorsValue = async (sensors) => {
	try {
		let measurements = [];
		measurements = Promise.all(
			sensors.map(async (id) => {
				return fetchSensor(id);
			})
		);
		return measurements;
	} catch (error) {
		console.log(error.status + error.statusText);
	}
};

const fetchStationMeasurements = async (id) => {
	let sensors = [];
	let station = await fetchStation(id);
	station.forEach((sensor) => {
		sensors.push(sensor.id);
	});
	let measurements = await fetchSensorsValue(sensors);
	return measurements;
};

export {
	fetchSensorsValue,
	fetchStation,
	fetchStationMeasurements,
	fetchAllStations,
};
