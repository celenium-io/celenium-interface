<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"

/** Services */
import { capitalizeAndReplace, roundTo } from "@/services/utils"
import { rankCoefficients } from "@/services/constants/rollups"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const rank = ref({})
const rollup = ref({})
const metrics = ref([
	{
		key: "day_blobs_count",
		name: "Blobs count",
		coefficient: 0.2,
		type: "Quantitative",
	},
	{
		key: "avg_pfb_size",
		name: "Avg PFB Size",
		coefficient: 0.3,
		type: "Quantitative",
	},
	{
		key: "last_message_time",
		name: "Last activity time",
		coefficient: 0.3,
		type: "Time-Based",
	},
	{
		key: "commits_weekly",
		name: "Weekly commits",
		coefficient: 0.2,
		type: "Quantitative",
	},
	{
		key: "last_pushed_at",
		name: "Last pushed",
		coefficient: 0.2,
		type: "Time-Based",
	},
])

const getMetricValue = (key) => {
	const coefficient = metrics.value.find(m => m.key === key)?.coefficient
	const metricValue = +rank.value?.ranking[key]?.score / +coefficient

	return roundTo(metricValue, 2)
}
watch(
	() => props.show,
	() => {
		if (props.show) {
			rank.value = cacheStore.selectedRollupRank
			rollup.value = cacheStore.selectedRollup

			metrics.value = metrics.value.map(m => {
				return {
					...m,
					metricValue: getMetricValue(m.key),
				}
			})
		} else {
			rank.value = null
			rollup.value = null
		}
	},
)
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="550" disable-trap>
		<Flex direction="column" gap="24" wide>
			<Text size="14" weight="600" color="primary">Rollups Activity Rank Calculation</Text>

			<Flex direction="column" gap="16" wide>
				<Text size="12" color="secondary" :style="{ lineHeight: '1.4' }">
					This score reflects a rollup’s overall activity by aggregating its key performance indicators.
				</Text>

				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="secondary">Main Rating Formula</Text>

					<Flex align="center" justify="center" :class="$style.formula_wrapper">
						<Flex align="center" justify="center">
							<Icon name="laurel" size="18" color="tertiary" :style="{ paddingBottom: '2px' }" />
							<math display="block" :style="{ color: 'var(--txt-tertiary)' }">
								<mrow>
									<mo>=</mo>
									<msub><mi>M</mi><mn>1</mn></msub>
									<mo>⋅</mo>
									<msub><mi>K</mi><mn>1</mn></msub>
									<mo>+</mo>
									<msub><mi>M</mi><mn>2</mn></msub>
									<mo>⋅</mo>
									<msub><mi>K</mi><mn>2</mn></msub>
									<mo>+</mo>
									<mo>⋯</mo>
									<mo>+</mo>
									<msub><mi>M</mi><mi>N</mi></msub>
									<mo>⋅</mo>
									<msub><mi>K</mi><mi>n</mi></msub>
								</mrow>
							</math>
						</Flex>
					</Flex>

					<Text size="12" color="secondary" :style="{ lineHeight: '1.4' }">
						In this equation:
						<ul>
							<li>
								<Text size="13" weight="600" color="secondary">M</Text>
								is a normalized metric value between 0 and 100.
							</li>
							<li>
								<Text size="13" weight="600" color="secondary">K</Text>
								is the weight assigned to that metric; the sum of all 
								<Text size="13" weight="600" color="secondary">K</Text>
								equals 1.
							</li>
						</ul>
					</Text>					
				</Flex>

				<Text size="12" color="secondary" :style="{ lineHeight: '1.4' }">
					We use two metric categories: Quantitative Metrics and Time-Based Metrics
				</Text>

				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="secondary">Here are the formulas for each metric type.</Text>

					<Flex align="center" justify="center" direction="column" gap="16" :class="$style.formula_wrapper">
						<math display="block" :style="{ color: 'var(--txt-tertiary)' }">
							<mrow>
								<mi>quantitative</mi>
								<mo>(</mo>
								<mi>value</mi><mo>,</mo><mi>maxValue</mi>
								<mo>)</mo>
								<mo>=</mo>
								<mi>min</mi>
								<mo>(</mo>
								<mfrac>
									<mi>value</mi>
									<mi>maxValue</mi>
								</mfrac>
								<mo>,</mo><mn>1</mn>
								<mo>)</mo>
							</mrow>
						</math>
						<math display="block" :style="{ color: 'var(--txt-tertiary)' }">
							<mrow>
								<mi>timeBased</mi>
								<mo>(</mo>
								<mi>maxTime</mi><mo>,</mo><mi>lastTime</mi><mo>,</mo><mi>t</mi><mo>,</mo><mi>timeframe</mi>
								<mo>)</mo>
								<mo>=</mo>
								<mi>exp</mi>
								<mo>(</mo>
								<mo>−</mo>
								<mfrac>
									<mi>diff</mi>
									<mi>t</mi>
								</mfrac>
								<mo>)</mo>
							</mrow>
						</math>
					</Flex>

					<Text size="12" color="secondary" :style="{ lineHeight: '1.4' }">
						Where:
						<ul>
							<li>
								<math :class="$style.inline_formula_wrapper">
									<mrow>
										<mi>diff</mi>
										<mo>=</mo>
										<mi>maxTime</mi>
										<mo>-</mo>
										<mi>lastTime</mi>
									</mrow>
								</math>
								in the chosen <mi :class="$style.inline_formula_wrapper">timeframe</mi>.
							</li>
							<li>
								<mi :class="$style.inline_formula_wrapper" :style="{ padding: '1px 4px' }">t</mi>
								 is the <strong>decay period</strong> (time constant) that controls how quickly the metric fades: 
								 after a time span of 
								 <mi :class="$style.inline_formula_wrapper">t</mi>
								 , the value drops to 
								 <msup :class="$style.inline_formula_wrapper"><mi>e</mi><mo>−1</mo></msup>
							</li>
						</ul>
					</Text>
				</Flex>

				<table :class="$style.table_metric">
					<thead>
						<tr>
							<th>
								<Text size="12" color="tertiary"> Metric </Text>
							</th>
							<th>
								<Text size="12" color="tertiary"> Coefficient (K) </Text>
							</th>
							<th>
								<Text size="12" color="tertiary"> Type </Text>
							</th>
							<th>
								<Flex align="center" gap="8">
									<Flex align="center" justify="center" :class="$style.avatar_container">
										<img :src="rollup.logo" :class="$style.avatar_image" />
									</Flex>
									<Text size="12" color="tertiary"> Metric value (M)</Text>
								</Flex>
							</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="m in metrics">
							<td>
								<Flex align="center" justify="start">
									<Text size="12" color="primary">
										{{ m.name }}
									</Text>
								</Flex>
							</td>
							<td>
								<Flex align="center" justify="center">
									<Text size="12" color="primary">
										{{ m.coefficient }}
									</Text>
								</Flex>
							</td>
							<td>
								<Flex align="center" justify="center">
									<Text size="12" color="primary">
										{{ m.type }}
									</Text>
								</Flex>
							</td>
							<td>
								<Flex align="center" justify="center">
									<Text size="12" color="primary">
										{{ m.metricValue }}
									</Text>
								</Flex>
							</td>
						</tr>
					</tbody>
				</table>

				<Flex align="center" justify="center" :class="$style.formula_wrapper">
					<Flex align="center" justify="center" gap="4">
						<math display="block" :style="{ color: 'var(--txt-tertiary)' }">
							<mrow>
								<template v-for="(m, i) in metrics" :key="m.key">
									<mn> {{ m.metricValue }} </mn>
									<mo>⋅</mo>
									<mn> {{ m.coefficient }} </mn>
									<mo v-if="i < metrics.length - 1">+</mo>
								</template>
								<mo>=</mo>
								<mn :style="{ color: `var(--${rank.ranking.rank.category.color})`, fontWeight: '800'}"> {{ rank.ranking.rank.score }} </mn>
							</mrow>
						</math>
						<Icon name="laurel" size="20" :color="rank.ranking.rank.category.color" />
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.formula_wrapper{
	/* width: 80%; */
	padding: 10px;
	background-color: var(--op-5);
	border-radius: 6px;
}

.inline_formula_wrapper {
	padding: 4px;
	background-color: var(--op-5);
	border-radius: 6px;
	color: var(--txt-secondary);
}

.table_metric {
  width: 100%;
  border-collapse: collapse;

  /* Remove all default borders and set padding */
  & th,
  & td {
    border: none;
    padding: 10px 12px;
  }

  /* Draw only internal horizontal borders */
  & tbody tr + tr th,
  & tbody tr + tr td {
    border-top: 1px solid var(--op-5);
  }

  /* Draw only internal vertical borders */
  & th + th,
  & td + td {
    border-left: 1px solid var(--op-5);
  }

  /* Header styling */
  & thead {
    background: var(--gray-1);
	border-bottom: 1px solid var(--op-5);
  }
  & thead th {
    text-align: center;
    /* padding-top: 16px; */
    padding-bottom: 8px;
  }

  /* Body row styling */
  & tbody tr {
    transition: all 0.05s ease;
    &:nth-child(even) {
      background: var(--gray-0);
    }
    &:hover {
      background: var(--gray-2);
    }
  }

  /* First column indent */
  & tbody td:first-child {
    padding-left: 16px;
  }
}

.avatar_container {
	position: relative;
	width: 20px;
	height: 20px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
</style>
