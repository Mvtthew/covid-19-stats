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
				if (
					summaryData.cases !== resData.cases ||
					summaryData.deaths !== resData.deaths ||
					summaryData.recovered !== resData.recovered
				) {
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
			<div class="col-md-8 mt-4 mr-auto">
				<SumStats data={summaryData} />
			</div>
			<div class="col-md-4 mt-4">
				<CountryStats
					data={countriesData}
					countryName="Poland"
					emojiHtml="🇵🇱" />
			</div>
		</div>
		<div class="row shadow-lg mt-4 p-lg-4">
			<div class="col-12">
				<h2>The worst situation</h2>
			</div>
			{#if countriesData.length > 1}
				{#each Array(3) as _, i}
					<div class="col-md-4 mt-4">
						<CountryStats
							data={countriesData}
							countryName={countriesData[i].country}
							index={i} />
					</div>
				{/each}
			{/if}
		</div>
		<div class="row shadow-lg mt-4 p-4">
			<div class="col-12">
				<h2>All statistics</h2>
			</div>
		</div>
	</div>
</div>
