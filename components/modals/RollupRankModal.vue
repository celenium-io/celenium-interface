<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"

/** Services */
import { roundTo } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const rank = ref({})
const rollup = ref({})
const metrics = ref([
	{
		key: "blobs",
		name: "Blobs count",
		coefficient: 0.2,
		type: "Logarithmic",
	},
	{
		key: "last_msg",
		name: "Last activity time",
		coefficient: 0.2,
		type: "Time-Based",
	},
	{
		key: "commits",
		name: "Weekly commits",
		coefficient: 0.05,
		type: "Quantitative",
	},
	{
		key: "last_push",
		name: "Last pushed",
		coefficient: 0.05,
		type: "Time-Based",
	},
	{
		key: "mb_price",
		name: "MB price",
		coefficient: 0.2,
		type: "Reciprocal quantitative",
	},
	{
		key: "tvl",
		name: "TVL",
		coefficient: 0.3,
		type: "Custom",
	},
])

const getMetricValue = (key) => {
	const coefficient = metrics.value.find((m) => m.key === key)?.coefficient
	const metricValue = rank.value?.scores[key] / coefficient

	return roundTo(metricValue, 2)
}

watch(
	() => props.show,
	() => {
		if (props.show) {
			rollup.value = cacheStore.selectedRollup
			rank.value = rollup.value?.ranking
			
			metrics.value = metrics.value.map((m) => {
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
	<Modal :show="show" @onClose="emit('onClose')" width="600" disable-trap>
		<Flex direction="column" gap="24" wide>
			<Text size="14" weight="600" color="primary">Rollups Activity Rank Calculation</Text>

			<Flex direction="column" gap="16" wide :class="$style.wrapper">
				<Text size="12" color="secondary" :style="{ lineHeight: '1.4' }">
					This score reflects a rollup’s overall activity by aggregating its key performance indicators.
				</Text>

				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="secondary">Main Rating Formula</Text>

					<Flex align="center" justify="center" :class="$style.formula_wrapper">
						<Flex align="center" justify="center">
							<Icon name="laurel" size="18" color="tertiary" :style="{ paddingBottom: '2px' }" />
							<math>
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
					We use the following metric categories: Quantitative, Reciprocal quantitative, Time-Based, Logarithmic and Custom (for TVL rank calculation).
				</Text>

				<Text size="12" color="secondary" :style="{ lineHeight: '1.4' }">
					Learn more about rank calculation in the 
					<NuxtLink to="https://docs.celenium.io/features/rollup-activity-rank" target="_blank">overview article</NuxtLink>
					and the 
					<NuxtLink to="https://docs.celenium.io/features/rollup-activity-rank-specification" target="_blank">detailed specification</NuxtLink>
					.
				</Text>				

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

				<Flex align="center" justify="center" :class="[$style.formula_wrapper, $style.summary]">
					<Flex align="center" justify="center" :class="$style.rank_calculation">
						<Flex :class="$style.part_1">
							<math>
								<mrow>
									<template v-for="(m, i) in metrics.slice(0, 4)" :key="m.key">
										<mn> {{ m.metricValue }} </mn>
										<mo>⋅</mo>
										<mn> {{ m.coefficient }} </mn>
										<mo v-if="i < metrics.slice(0, 4).length - 1">+</mo>
									</template>
								</mrow>
							</math>
						</Flex>
						<Flex align="center" gap="6" :class="$style.part_2">
							<math>
								<mrow>
									<template v-for="(m, i) in metrics.slice(4)" :key="m.key">
										<mo>+ </mo>
										<mn> {{ m.metricValue }} </mn>
										<mo>⋅</mo>
										<mn> {{ m.coefficient }} </mn>
									</template>
									<mo>=</mo>
									<mn :style="{ color: `var(--${rank.category.color})`, fontWeight: '800' }">
										{{ rank.rank }}
									</mn>
								</mrow>
							</math>
							<Icon name="laurel" size="20" :color="rank.category.color" />
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
a {
	color: var(--brand);

	&:hover {
		text-decoration: underline;
	}
}

.formula_wrapper {
	padding: 10px;
	background-color: var(--op-5);
	border-radius: 6px;
}

.inline_formula_wrapper {
	display: inline-block;
	padding: 4px;
	background-color: var(--op-5);
	border-radius: 6px;
	color: var(--txt-secondary);
}

math {
	display: block;
	color: var(--txt-tertiary);
}

.divider {
	width: 100%;
	height: 1px;

	background: var(--op-5);

	margin: -12px;
	opacity: 0;
}

.table_metric {
	width: 100%;
	border-collapse: collapse;

	& th,
	& td {
		border: none;
		padding: 10px 12px;
	}

	& tbody tr + tr th,
	& tbody tr + tr td {
		border-top: 1px solid var(--op-5);
	}

	& th + th,
	& td + td {
		border-left: 1px solid var(--op-5);
	}

	& thead {
		border-bottom: 1px solid var(--op-5);
	}
	& thead th {
		text-align: center;
		padding-bottom: 8px;
	}

	& tbody td:first-child {
		padding-left: 16px;
	}
}

.avatar_container {
	position: relative;
	min-width: 20px;
	min-height: 20px;
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

.summary {
	font-size: 14px;
}

@media (max-width: 550px) {
	.rank_calculation {
		width: 100%;
		flex-direction: column;
		align-items: start;
		gap: 8px;

		& .part_1 {
			width: 100%;
			justify-items: start;
		}
		& .part_2 {
			width: 100%;
			align-items: center;
			justify-content: end;
		}
	}
}

@media (max-width: 520px) {
	.time_based_metric {
		width: 100%;
		flex-direction: column;
		gap: 8px;

		& .part_1 {
			width: 100%;
			justify-items: start;
		}
		& .part_2 {
			width: 100%;
			justify-content: end;
		}
	}

	.divider {
		margin: -4px;
		opacity: 1;
	}
}
@media (max-width: 450px) {
	.quantitative_metric {
		width: 100%;
		flex-direction: column;
		gap: 8px;

		& .part_1 {
			width: 100%;
			justify-items: start;
		}
		& .part_2 {
			width: 100%;
			justify-content: end;
		}
	}
}
</style>
