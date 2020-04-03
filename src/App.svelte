<script>
	import Navbar from "./layout/Navbar.svelte";

	import SumStats from "./components/SumStats.svelte";
	import Map from "./components/Map.svelte";

	import store from "./store.js";
	import dataSchema from "./models/data.js";

	let globalData = dataSchema;

	const getGlobalData = () => {
		fetch(`${store.apiUrl}locations`)
			.then(res => res.json())
			.then(resData => {
				if (globalData.latest.confirmed != resData.latest.confirmed) {
					globalData = resData;
					console.log("upda");
				}
			});
	};

	// Auto refresh data
	setInterval(() => {
		getGlobalData();
	}, 5000);
	getGlobalData();
</script>

<div id="app">
	<Navbar />
	<div class="py-4 container" id="main">
		<div class="row">
			<div class="col-md-8">
				<Map {globalData} />
			</div>
			<div class="col-md-4">
				<SumStats {globalData} />
			</div>
		</div>
	</div>
</div>
