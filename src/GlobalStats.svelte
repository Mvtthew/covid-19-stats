<script>
	import store from "./store.js";
	import dataSchema from "./models/data.js";

	let data = dataSchema;

	const getGlobalStats = () => {
		fetch(`${store.apiUrl}locations`)
			.then(res => res.json())
			.then(resData => (data = resData));
	};

	// Auto refresh data
	setInterval(() => {
		getGlobalStats();
	}, 5000);
	getGlobalStats();
</script>

<div class="card">
	<div class="card-header">
		<h4 class="m-0">
			<i class="bx bx-data" />
			All data
		</h4>
	</div>
	<div class="card-body">
		<ul class="list-group">
			<li class="list-group-item">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Confirmed</strong>
					{data.latest.confirmed}
				</p>
			</li>
			<li class="list-group-item">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Deaths1</strong>
					{data.latest.deaths}
				</p>
			</li>
		</ul>

	</div>
</div>
