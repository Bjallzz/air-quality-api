import fetch from "node-fetch";

const fetchRetry = async (url, n) => {
	try {
		return await fetch(url);
	} catch (error) {
		if (n === 1) throw error;
		return await fetchRetry(url, n - 1);
	}
};

const fetchSensor = async (id) => {
	let response = await fetchRetry(
		`http://api.gios.gov.pl/pjp-api/rest/data/getData/${id}`,
		4
	);
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
	let response = await fetchRetry(
		`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${id}`,
		4
	);
	if (response.ok) {
		let data = await response.json();
		return data;
	} else {
		let error = new Error();
		error.status = response.status;
		error.message = response.statusText;
		throw error;
	}
};

const fetchAllStations = async () => {
	let response = await fetchRetry(
		"http://api.gios.gov.pl/pjp-api/rest/station/findAll",
		4
	);
	let data = await response.json();
	if (response.ok) {
		return data;
	} else {
		let error = new Error();
		error.status = response.status;
		error.message = response.statusText;
		throw error;
	}
};

const fetchSensorsValue = async (sensors) => {
	let measurements = [];
	measurements = await Promise.all(
		sensors.map(async (id) => {
			return fetchSensor(id);
		})
	);
	return measurements;
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
