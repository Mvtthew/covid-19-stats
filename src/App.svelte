<script>
	import Navbar from "./layout/Navbar.svelte";

	import SumStats from "./components/SumStats.svelte";
	import CountryStats from "./components/CountryStats.svelte";

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
			<div class="col-md-7 mr-auto">
				<SumStats data={summaryData} />
			</div>
			<div class="col-md-4">
				<CountryStats data={countriesData} countryName="Poland" />
			</div>

		</div>
		<div class="row mt-5">
			<div class="col-md-4">
				<CountryStats data={countriesData} countryName="USA" />
			</div>
			<div class="col-md-4">
				<CountryStats data={countriesData} countryName="Germany" />
			</div>
			<div class="col-md-4">
				<CountryStats data={countriesData} countryName="China" />
			</div>
		</div>
	</div>
</div>
