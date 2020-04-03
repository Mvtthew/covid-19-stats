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
					<strong>All cases</strong>
					<span>
						{#if data.cases}{data.cases.toLocaleString()}{/if}
						<i class="bx bxs-layer" />
					</span>
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Recovered</strong>
					<span>
						{#if data.recovered}
							{data.recovered.toLocaleString()}
						{/if}
						<i class="bx bx-plus-medical" />
					</span>
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Deaths</strong>
					<span>
						{#if data.deaths}{data.deaths.toLocaleString()}{/if}
						<i class="bx bxs-skull" />
					</span>
				</p>
			</li>
		</ul>

	</div>
</div>
