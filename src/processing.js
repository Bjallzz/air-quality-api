import fetch from 'node-fetch';

const fetchStation = async (id) => {
	let response = await fetch(
		`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${id}`
	);
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
	let measurements = [];
	measurements = Promise.all(
		sensors.map(async (id) => {
			let response = await fetch(
				`http://api.gios.gov.pl/pjp-api/rest/data/getData/${id}`
			);
			let data = await response.json();
			if (response.ok) {
				let measurement = {};
				measurement.key = data.key;
				for (let value of data.values) {
					if (value.value !== null) {
						measurement.date = value.date;
						measurement.value = value.value;
						break;
					}
				}
				return measurement;
			} else {
				let error = new Error();
				error.status = data.status;
				error.message = data.statusText;
				throw error;
			}
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
	for(let measurement of measurements) {
		measurement.stationId = id;
	}
	return measurements;
}

export { fetchSensorsValue, fetchStation, fetchStationMeasurements };
