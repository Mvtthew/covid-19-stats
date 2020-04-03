<script>
	export let data;
	export let countryName;
	let countryData;
	$: {
		countryData = data.filter(item => item.country === countryName);
		if (countryData.length > 0) {
			countryData = countryData[0];
		}
	}
</script>

<div>
	<div class="card shadow-lg">
		<div class="card-header">
			<h4 class="m-0">
				<i class="bx bx-map" />
				{countryData.country}
			</h4>
		</div>
		<div class="card-body">
			<ul class="list-group ">
				<li class="list-group-item bg-transparent">
					<p class="mb-0 d-flex justify-content-between">
						<strong>All cases</strong>
						<span>
							{countryData.cases}
							<i class="bx bxs-layer" />
						</span>
					</p>
				</li>
				<li class="list-group-item bg-transparent">
					<p class="mb-0 d-flex justify-content-between">
						<strong>Active cases</strong>
						<span>
							{countryData.active}
							<i class="bx bx-layer" />
						</span>
					</p>
				</li>
				<li class="list-group-item bg-transparent">
					<p class="mb-0 d-flex justify-content-between">
						<strong>Recovered</strong>
						<span>
							{countryData.recovered}
							<i class="bx bx-layer-plus" />
						</span>
					</p>
				</li>
				<li class="list-group-item bg-transparent">
					<p class="mb-0 d-flex justify-content-between">
						<strong>Deaths</strong>
						<span>
							{countryData.deaths}
							<i class="bx bx-layer-minus" />
						</span>
					</p>
				</li>
			</ul>

		</div>
	</div>

</div>
