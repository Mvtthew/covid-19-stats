<script>
	export let globalData;
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
					<strong>Confirmed</strong>
					{globalData.latest.confirmed}
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Deaths</strong>
					{globalData.latest.deaths}
				</p>
			</li>
		</ul>

	</div>
</div>
