<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { comma } from "@/services/utils"

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const plans = reactive([
	{
		name: "Basic",
		price: {
			monthly: null,
			annually: null,
		},
		requests: {
			rps: 3,
			rpd: 100_000,
		},
		access: {
			blobs: false,
			rollups: false,
			stats: false,
		},
		other: {
			support: "Standard",
			queryOp: "None",
		},
	},
	{
		name: "Developer Pack",
		price: {
			monthly: 149,
			annually: 119,
		},
		requests: {
			rps: 10,
			rpd: 500_000,
		},
		access: {
			blobs: true,
			rollups: true,
			stats: false,
		},
		other: {
			support: "Advanced",
			queryOp: "Client ",
		},
	},
	{
		name: "Analysts' Choice",
		price: {
			monthly: 149,
			annually: 119,
		},
		requests: {
			rps: 10,
			rpd: 500_000,
		},
		access: {
			blobs: false,
			rollups: true,
			stats: true,
		},
		other: {
			support: "Advanced",
			queryOp: "Client ",
		},
	},
	{
		name: "Full Set",
		price: {
			monthly: 299,
			annually: 239,
		},
		requests: {
			rps: 30,
			rpd: 1_500_000,
		},
		access: {
			blobs: true,
			rollups: true,
			stats: true,
		},
		other: {
			support: "Dedicated",
			queryOp: "Custom ",
		},
	},
])
const selectedPlan = ref(0)
const selectedBilling = ref("annually")
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="700" disable-trap>
		<Flex direction="column" gap="16">
			<Text size="14" weight="600" color="primary">Celenium API</Text>

			<Flex gap="32">
				<Flex direction="column" justify="between" :class="$style.left">
					<Flex direction="column" gap="20">
						<Flex direction="column" gap="8">
							<Text size="13" weight="600" color="secondary">Plans</Text>
							<Flex
								v-for="(plan, idx) in plans"
								@click="selectedPlan = idx"
								align="center"
								justify="between"
								:class="[$style.plan, idx === selectedPlan && $style.selected]"
							>
								<Flex align="center" gap="8">
									<Icon
										name="check-circle"
										size="12"
										:color="selectedPlan === idx ? 'brand' : 'secondary'"
										:class="$style.check_icon"
									/>
									<Text size="14" weight="600" :color="selectedPlan === idx ? 'primary' : 'secondary'">
										{{ plan.name }}
									</Text>
								</Flex>

								<Text v-if="plan.price.monthly" size="13" weight="600" color="primary">
									${{ plan.price[selectedBilling] }}
									<Text color="tertiary">/m</Text>
								</Text>
								<Text v-else size="13" weight="600" color="primary"> Free </Text>
							</Flex>
						</Flex>

						<Flex v-if="selectedBilling === 'annually' && plans[selectedPlan].price.monthly" gap="8">
							<Icon name="verified" size="14" color="secondary" />
							<Flex direction="column" gap="6">
								<Text size="13" weight="600" color="secondary">Discount 20% applied</Text>
								<Text size="12" weight="500" height="140" color="tertiary">
									When you pay for a year in advance, you get ~2.5 months for free
								</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Flex v-if="plans[selectedPlan].price.monthly" wide align="center" justify="between">
							<Text size="12" weight="600" color="secondary">Billing</Text>
							<Flex align="center" gap="8">
								<Text
									@click="selectedBilling = 'annually'"
									size="12"
									weight="600"
									:color="selectedBilling === 'annually' ? 'primary' : 'tertiary'"
									style="cursor: pointer"
								>
									Annually
								</Text>
								<Text
									@click="selectedBilling = 'monthly'"
									size="12"
									weight="600"
									:color="selectedBilling === 'monthly' ? 'primary' : 'tertiary'"
									style="cursor: pointer"
								>
									Monthly
								</Text>
							</Flex>
						</Flex>
						<Flex wide align="center" justify="between">
							<Text size="12" weight="600" color="secondary">Due today</Text>

							<Flex align="center" gap="8">
								<Text size="12" weight="600" :color="selectedBilling === 'annually' ? 'brand' : 'primary'">
									${{
										plans[selectedPlan].price.monthly
											? comma(plans[selectedPlan].price[selectedBilling] * (selectedBilling === "annually" ? 12 : 1))
											: 0
									}}
								</Text>
								<Text
									v-if="selectedBilling === 'annually'"
									size="12"
									weight="600"
									color="tertiary"
									style="text-decoration: line-through"
								>
									${{ comma(plans[selectedPlan].price.monthly * 12) }}
								</Text>
							</Flex>
						</Flex>

						<Flex direction="column" align="center" gap="8">
							<Button type="primary" size="small" wide>
								<Text color="black">Start with {{ plans[selectedPlan].name }}</Text>
							</Button>

							<Text size="12" weight="500" color="tertiary">Secure payment via Stripe</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex wide direction="column" gap="32" :class="$style.right">
					<Flex direction="column" gap="16">
						<Flex direction="column" gap="8">
							<Text size="14" weight="600" color="primary">{{ plans[selectedPlan].name }} Overview</Text>
							<Text size="13" weight="500" color="tertiary"
								>${{ plans[selectedPlan].price[selectedBilling] }} per month, billing {{ selectedBilling }}
							</Text>
						</Flex>

						<div class="divider_h" />
					</Flex>

					<Flex direction="column" gap="16">
						<Flex wide align="center" gap="8" justify="between">
							<Flex align="center" gap="8">
								<Icon name="zap-circle" size="14" color="brand" />
								<Text size="14" weight="600" color="primary">{{ comma(plans[selectedPlan].requests.rpd) }} </Text>
							</Flex>

							<Text size="13" weight="600" color="tertiary">Requests per Day</Text>
						</Flex>
						<Flex wide align="center" gap="8" justify="between">
							<Flex align="center" gap="8">
								<Icon name="zap-circle" size="14" color="brand" />
								<Text size="14" weight="600" color="primary">{{ comma(plans[selectedPlan].requests.rps) }}</Text>
							</Flex>

							<Text size="13" weight="600" color="tertiary">Requests per Second</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Flex align="center" gap="8">
							<Icon
								:name="plans[selectedPlan].access.blobs ? 'check-circle' : 'close-circle'"
								size="14"
								:color="plans[selectedPlan].access.blobs ? 'brand' : 'tertiary'"
							/>
							<Text size="13" weight="600" :color="plans[selectedPlan].access.blobs ? 'primary' : 'tertiary'">
								Blobs Access
							</Text>
						</Flex>
						<Flex align="center" gap="8">
							<Icon
								:name="plans[selectedPlan].access.stats ? 'check-circle' : 'close-circle'"
								size="14"
								:color="plans[selectedPlan].access.stats ? 'brand' : 'tertiary'"
							/>
							<Text size="13" weight="600" :color="plans[selectedPlan].access.stats ? 'primary' : 'tertiary'">
								Statistics Access
							</Text>
						</Flex>
						<Flex align="center" gap="8">
							<Icon
								:name="plans[selectedPlan].access.rollups ? 'check-circle' : 'close-circle'"
								size="14"
								:color="plans[selectedPlan].access.rollups ? 'brand' : 'tertiary'"
							/>
							<Text size="13" weight="600" :color="plans[selectedPlan].access.rollups ? 'primary' : 'tertiary'">
								Rollups Data
							</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Flex v-if="plans[selectedPlan].other.queryOp !== 'None'" align="center" gap="8">
							<Icon name="check-circle" size="14" color="secondary" />
							<Text size="13" weight="600" color="primary">{{ plans[selectedPlan].other.queryOp }} Query Optimization</Text>
						</Flex>
						<Flex align="center" gap="8">
							<Icon name="check-circle" size="14" color="secondary" />
							<Text size="13" weight="600" color="primary">{{ plans[selectedPlan].other.support }} Support</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.left {
	width: 550px;
	height: 450px;

	background: rgba(0, 0, 0, 20%);
	box-shadow: inset 0 0 0 1px var(--op-5);
	border-radius: 12px;

	padding: 16px;
}

.billing {
	height: 28px;

	background: var(--card-background);
	border-radius: 6px;
	box-shadow: inset 0 0 0 1px var(--op-5);
	overflow: hidden;

	& span {
		display: flex;
		align-items: center;
		justify-content: center;

		cursor: pointer;

		width: 100%;
		height: 28px;

		&.selected {
			/* background: var(--op-5); */
			color: var(--txt-primary);
		}
	}
}

.right {
	padding: 12px 0;
}

.plan {
	height: 38px;

	background: var(--card-background);
	box-shadow: inset 0 0 0 1px var(--op-5);
	border-radius: 8px;
	cursor: pointer;

	padding: 0 12px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-5);
	}

	&.selected {
		box-shadow: inset 0 0 0 1px var(--brand);
	}
}

.check_icon {
	width: 12px;
	height: 12px;
}
</style>
