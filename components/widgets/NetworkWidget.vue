<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchHistogram } from "@/services/api/histogram"

const { data: hourHistagram } = await fetchHistogram({ table: "tx", func: "count", period: "hour" })
const { data: dayHistagram } = await fetchHistogram({ table: "tx", func: "count", period: "day" })

const tph = hourHistagram.value.slice(0, 24).reduce((a, b) => (a += parseInt(b.value)), 0) / 24
const prevTph = hourHistagram.value.slice(24, 48).reduce((a, b) => (a += parseInt(b.value)), 0) / 24
const diff = (Math.abs(tph - prevTph) / ((tph + prevTph) / 2)) * 100

const preparedDayHistogram = dayHistagram.value.slice(0, 7).map((item) => item.value / 24)
const highLevel = Math.max(...preparedDayHistogram)
const lowLevel = Math.min(...preparedDayHistogram)
const pos = (100 * (tph - lowLevel)) / (highLevel - lowLevel)
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.top">
			<Text size="16" weight="600" color="primary"> Network </Text>

			<Flex direction="column" gap="16">
				<Tooltip position="start" text-align="left">
					<Flex align="end" gap="16" wrap="wrap">
						<Flex align="center" gap="6">
							<Icon name="zap-circle" size="20" color="primary" />
							<Flex gap="4" align="end">
								<Text size="20" weight="600" color="primary">{{ tph > 100 ? tph.toFixed(0) : tph.toFixed(2) }}</Text>
								<Text size="14" weight="700" color="tertiary">TPH</Text>
							</Flex>
						</Flex>

						<Flex align="center" gap="6">
							<Icon
								name="arrow-circle-right-up"
								size="16"
								:color="tph - prevTph > 0 ? 'green' : 'red'"
								:style="{ transform: `scaleY(${tph - prevTph > 0 ? '1' : '-1'})` }"
							/>
							<Text size="16" weight="600" :color="tph - prevTph > 0 ? 'green' : 'red'">{{ diff.toFixed(0) }}%</Text>
						</Flex>
					</Flex>

					<template #content>
						<Flex direction="column" gap="6">
							<Text>Transactions per hour</Text>
							<Text color="tertiary">Calculated based on the last 24 hours</Text>
						</Flex>
					</template>
				</Tooltip>

				<Text size="12" weight="600" color="support"> Updates every hour </Text>
			</Flex>
		</Flex>

		<Flex direction="column" justify="between" :class="$style.bottom">
			<Flex direction="column" gap="16">
				<Flex align="center" gap="4">
					<Icon name="level" size="12" color="secondary" />
					<Text size="13" weight="600" color="secondary">TPH Level</Text>
				</Flex>

				<Flex direction="column" gap="8">
					<Tooltip position="start" wide>
						<Flex justify="between" wide :class="$style.levels">
							<Flex align="center" justify="between" :class="$style.level">
								<div v-for="item in 10" :class="[$style.separator]" />
							</Flex>

							<div v-if="!isNaN(pos)" :class="$style.line" :style="{ left: `${pos >= 94 ? 94 : pos}%` }" />
						</Flex>

						<template #content>
							<Flex align="start" direction="column" gap="6">
								<Text color="secondary">
									High: <Text color="primary">{{ highLevel.toFixed(2) }} <Text color="secondary">TPH</Text></Text>
								</Text>

								<Text color="secondary">
									Current: <Text color="primary">{{ tph.toFixed(2) }} <Text color="secondary">TPH</Text></Text>
								</Text>

								<Text color="secondary">
									Low: <Text color="primary">{{ lowLevel.toFixed(2) }} <Text color="secondary">TPH</Text></Text>
								</Text>

								<Text color="tertiary"> Based on the last 7 days </Text>
							</Flex>
						</template>
					</Tooltip>

					<Flex align="center" justify="between" :class="$style.labels">
						<Text size="11" weight="600" color="tertiary">Min</Text>
						<Text size="11" weight="600" color="tertiary">Max</Text>
					</Flex>
				</Flex>
			</Flex>

			<Text size="12" weight="600" color="support">
				Current capacity
				<Text v-if="!isNaN(pos)" color="tertiary">{{ pos.toFixed(2) }}%</Text>
				<Text v-else color="tertiary">is unknown</Text>
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;
}

.top {
	padding: 16px 16px 20px 16px;
}

.bottom {
	height: 100%;

	background: var(--network-widget-background);
	border-top: 2px solid var(--op-5);

	padding: 20px 16px;
}

.levels {
	position: relative;

	background: var(--op-5);
	border-radius: 50px;

	padding: 6px;
}

.line {
	position: absolute;
	top: 2px;

	width: 3px;
	height: 14px;

	background: var(--network-widget-indicator);
	outline: 2px solid var(--network-widget-separator);
}

.level {
	width: 100%;
	height: 6px;

	border-radius: 50px;
	background: linear-gradient(-90deg, var(--green), var(--txt-tertiary), var(--txt-support));

	.separator {
		width: 4px;
		height: 6px;
		background: var(--network-widget-separator);

		&:first-child {
			background: transparent;
		}

		&:last-child {
			background: transparent;
		}
	}
}

.labels {
	margin: 0 8px;
}
</style>
