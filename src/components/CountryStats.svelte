<script>
	export let data;
	export let countryName;
	export let emojiHtml;
	export let index;
	let countryData;
	$: {
		countryData = data.filter(item => item.country === countryName);
		if (countryData.length > 0) {
			countryData = countryData[0];
		}
	}
</script>

<div class="card shadow-lg">
	<div class="card-header">
		<h4 class="m-0">
			{#if emojiHtml}
				{@html emojiHtml}
			{:else}
				<i class="bx bx-map" />
			{/if}
			{countryData.country}
		</h4>
	</div>
	<div class="card-body">
		<ul class="list-group">
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>All cases</strong>
					<span>
						{#if countryData.cases}
							{countryData.cases.toLocaleString()}
						{/if}
						<i class="bx bxs-layer" />
					</span>
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Active cases</strong>
					<span>
						{#if countryData.active}
							{countryData.active.toLocaleString()}
						{/if}
						<i class="bx bx-layer" />
					</span>
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Recovered</strong>
					<span>
						{#if countryData.recovered}
							{countryData.recovered.toLocaleString()}
						{/if}
						<i class="bx bx-plus-medical" />
					</span>
				</p>
			</li>
			<li class="list-group-item bg-transparent">
				<p class="mb-0 d-flex justify-content-between">
					<strong>Deaths</strong>
					<span>
						{#if countryData.deaths}
							{countryData.deaths.toLocaleString()}
						{/if}
						<i class="bx bxs-skull" />
					</span>
				</p>
			</li>
		</ul>

	</div>
</div>
