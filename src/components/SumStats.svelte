<script>
	export let data;
</script>

<div class="card shadow-lg">
	<div class="card-header">
		<h4 class="m-0">
			<i class="bx bx-data" />
			Summary
		</h4>
	</div>
	<div class="card-body">
		<ul class="list-group ">
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Cases</strong>
					{data.cases}
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Deaths</strong>
					{data.deaths}
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Recovered</strong>
					{data.recovered}
				</p>
			</li>
		</ul>

	</div>
</div>
