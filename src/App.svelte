<script>
	import Navbar from "./layout/Navbar.svelte";

	import SumStats from "./components/SumStats.svelte";
	import Map from "./components/Map.svelte";

	import store from "./store.js";
	import dataSchema from "./models/data.js";

	let summaryData = dataSchema.summary;
	let countriesData = dataSchema.countries;

	const getSummaryData = () => {
		fetch(`${store.apiUrl}all`)
			.then(res => res.json())
			.then(resData => {
				if (summaryData.cases !== resData.cases) {
					summaryData = resData;
					getCountriesData();
				}
			});
	};

	const getCountriesData = () => {
		fetch(`${store.apiUrl}countries`)
			.then(res => res.json())
			.then(resData => {
				countriesData = resData;
			});
	};

	// Auto refresh data
	setInterval(() => {
		getSummaryData();
	}, 5000);
	getSummaryData();
</script>

<div id="app">
	<Navbar />
	<div class="py-4 container" id="main">
		<div class="row">
			<div class="col-md-8">
				<Map data={countriesData} />
			</div>
			<div class="col-md-4">
				<SumStats data={summaryData} />
			</div>
		</div>
	</div>
</div>
