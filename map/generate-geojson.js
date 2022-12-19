import { OSMQuery } from "@toriyama/osmql";
import Autolinker from 'autolinker';
import fs from 'fs';
import moment from 'moment';

const osmQuery = new OSMQuery();
const query = osmQuery.fromQLFile("./query.ql");
const outputFilepath = "./data.geojson";
query.execute().then((result) => {
	const geojson = convert(result.toGeoJSON());
	fs.writeFileSync(outputFilepath, JSON.stringify(geojson));
});

function convert(geojson) {
  let features = geojson.features.map((feature) => {
		return {
			type: "Feature",
      geometry: feature.geometry,
      properties: {
				'marker-color': getMarkerColor(feature),
				title: title(feature),
				description: description(feature),
      },
		};
	});

	return {
    type: "FeatureCollection",
		features: features,
	};
};

function title(feature) {
	if (feature.properties.tags.name) {
		return feature.properties.tags.name;
	}
}

function description(feature) {
	const tags = feature.properties.tags;
	const [lng, lat] = feature.geometry.coordinates;
	let desc = "";
	for (const key in tags) {
		const value = Autolinker.link(tags[key], {stripPrefix: false});
		desc += `<strong>${key}:</strong> ${value}<br />`;
	}
	desc += `<strong>updated at:</strong> ${moment(feature.properties.meta.timestamp).fromNow()}<br />`;
	desc += `<p><a href="${getGoogleFormUrl(feature)}" target="_blank">フィードバックを送る</a></p>`
	desc += `<p><a href="${getOSMUrl(feature)}" target="_blank">OSMのURL</a></p>`
	return desc;
}

function getMarkerColor(feature) {
	const updateAt = feature.properties.meta.timestamp;
	const now = moment();
	const diff = now.diff(updateAt, 'years');

	if (diff < 1) {
		return "green";
	} else if (diff < 3) {
		return "orange";
	} else {
		return "red";
	}
}

function getOSMUrl(feature) {
	return `https://www.openstreetmap.org/${feature.properties.type}/${feature.properties.id}`;
}

function getGoogleFormUrl(feature) {
	return `https://docs.google.com/forms/d/e/1FAIpQLSfK2pvoPM4KdgUH-CB8UdRCGlGoeiQEEaXTYmxltxuhe2FPoA/viewform?usp=pp_url&entry.2015952427=${getOSMUrl(feature)}`;
}
