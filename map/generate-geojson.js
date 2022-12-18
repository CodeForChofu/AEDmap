import { OSMQuery } from "@toriyama/osmql";
import Autolinker from 'autolinker';

const osmQuery = new OSMQuery();
const query = osmQuery.fromQLFile("./query.ql");
query.execute().then((result) => {
	const geojson = convert(result.toGeoJSON());
	console.log(JSON.stringify(geojson));
});

function convert(geojson) {
  let features = geojson.features.map((feature) => {
		return {
			type: "Feature",
      geometry: feature.geometry,
      properties: {
				description: description(feature),
      },
		};
	});

	return {
    type: "FeatureCollection",
		features: features,
	};
};

function description(feature) {
	const tags = feature.properties.tags;
	const [lng, lat] = feature.geometry.coordinates;
	let desc = "";
	for (const key in tags) {
		const value = Autolinker.link(tags[key], {stripPrefix: false});
		desc += `<strong>${key}:</strong> ${value}<br />`;
	}
	desc += `<p><a href="https://www.openstreetmap.org/edit#map=19/${lat}/${lng}" target="_blank">編集(OSM)</a></p>`
	return desc;
}
