import fetch from "node-fetch";

const fetchWithSetNumberOfRetries = async (url, numberOfRetries) => {
	try {
		return await fetch(url);
	} catch (error) {
		if (numberOfRetries === 1) throw error;
		return await fetchWithSetNumberOfRetries(url, numberOfRetries - 1);
	}
};

const fetchSensor = async (id) => {
	let response = await fetchWithSetNumberOfRetries(`http://api.gios.gov.pl/pjp-api/rest/data/getData/${id}`, 4);
	let sensorData = await response.json();
	if (response.ok) {
		return parseCorrectSensorMeasurements(sensorData);
	} else {
		createAndThrowErrorBasedOnResponse(response);
	}
};

const fetchStation = async (id) => {
	let response = await fetchWithSetNumberOfRetries(`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${id}`, 4);
	if (response.ok) {
		let stationData = await response.json();
		return stationData;
	} else {
		createAndThrowErrorBasedOnResponse(response);
	}
};

const fetchAllStations = async () => {
	let response = await fetchWithSetNumberOfRetries("http://api.gios.gov.pl/pjp-api/rest/station/findAll", 4);
	let allStationsData = await response.json();
	if (response.ok) {
		return allStationsData;
	} else {
		createAndThrowErrorBasedOnResponse(response);
	}
};

const fetchSensorsMeasurements = async (sensors) => {
	let sensorsValues = [];
	sensorsValues = await Promise.all(
		sensors.map(async (id) => {
			return fetchSensor(id);
		})
	);
	return sensorsValues;
};

const fetchStationMeasurements = async (id) => {
	let sensors = [];
	let station = await fetchStation(id);
	station.forEach((sensor) => {
		sensors.push(sensor.id);
	});
	let sensorsMeasurements = await fetchSensorsMeasurements(sensors);
	return sensorsMeasurements;
};

const compensateTimeDifference = (uncompensatedDate) => {
	let correctDate = new Date(uncompensatedDate);
	correctDate.setTime(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
	return correctDate;
}

const createAndThrowErrorBasedOnResponse = (response) => {
	let error = new Error();
	error.status = response.status;
	error.message = response.statusText;
	throw error;
}

const parseCorrectSensorMeasurements = (sensorData) => {
	let sensorMeasurements = {};
	sensorMeasurements.values = [];
	sensorMeasurements.key = sensorData.key;
	for (let value of sensorData.values) {
		if (value.value !== null) {
			sensorMeasurements.values.push({ date: value.date, value: value.value });
		}
	}
	return sensorMeasurements;
}

export {
	fetchSensorsMeasurements,
	fetchStation,
	fetchStationMeasurements,
	fetchAllStations,
	compensateTimeDifference
};
