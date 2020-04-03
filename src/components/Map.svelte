<script>
	export let globalData;
	let parsedData = [["Country", "Confirmed"]];
	let parsedDataClear = [["Country", "Confirmed"]];
	$: {
		parsedData = parsedDataClear;
		globalData.locations.forEach(location => {
			parsedData = [
				...parsedData,
				[
					location.country,
					location.latest.confirmed + location.latest.recovered
				]
			];
		});
		drawMap();
	}

	const drawMap = () => {
		google.charts.load("current", {
			packages: ["geochart"],
			// Note: you will need to get a mapsApiKey for your project.
			// See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
			mapsApiKey: "AIzaSyAScg3E3R1FqP1EKP3l5nQWLrKbftO5NAk"
		});
		google.charts.setOnLoadCallback(drawRegionsMap);

		function drawRegionsMap() {
			var data = google.visualization.arrayToDataTable(parsedData);

			var options = {
				colorAxis: {
					minValue: 0,
					maxValue: 10000,
					colors: ["#e0e0e0", "#00a8cc", "#005082", "#000839"]
				},
				backgroundColor: "#393e46"
			};

			var chart = new google.visualization.GeoChart(
				document.getElementById("regions_div")
			);

			chart.draw(data, options);
		}
	};
	drawMap();
</script>

<div>
	<div id="regions_div" style="width: 100%" />
</div>
