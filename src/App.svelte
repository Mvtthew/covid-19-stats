<script>
	import Navbar from "./layout/Navbar.svelte";

	import SumStats from "./components/SumStats.svelte";
	import CountryStats from "./components/CountryStats.svelte";

	import store from "./store.js";
	import dataSchema from "./models/Data.js";

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
	<div class="container" id="main">
		<div class="row">
			<div class="col-md-7 mt-4 mr-auto">
				<SumStats data={summaryData} />
			</div>
			<div class="col-md-4 mt-4">
				<CountryStats
					data={countriesData}
					countryName="Poland"
					emojiHtml="🇵🇱" />
			</div>

		</div>
		<div class="row">
			<div class="col-md-4 mt-4">
				<CountryStats
					data={countriesData}
					countryName="USA"
					emojiHtml="🇧🇪" />
			</div>
			<div class="col-md-4 mt-4">
				<CountryStats
					data={countriesData}
					countryName="Germany"
					emojiHtml="🇩🇪" />
			</div>
			<div class="col-md-4 mt-4">
				<CountryStats
					data={countriesData}
					countryName="China"
					emojiHtml="🇨🇳" />
			</div>
		</div>
	</div>
</div>
