<script setup>
/** Services */
import { getNetworkName } from "@/services/utils/general"

/** Components: Widgets */
import BlockWidget from "./BlockWidget.vue"
import BlobsWidget from "./BlobsWidget.vue"
import StakingWidget from "./StakingWidget.vue"
import TransactionsWidget from "./TransactionsWidget.vue"
import GasWidget from "./GasWidget.vue"

import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"

const tablet = ref(false)

onBeforeMount(() => {
	if (window.innerWidth < 1100) {
		tablet.value = true
	}
})
</script>

<template>
	<Flex direction="column" gap="20">
		<BlocksFeed v-if="getNetworkName() === 'Mammoth'" />

		<Flex gap="20" :class="$style.wrapper">
			<Flex direction="column" gap="20" wide :class="$style.column">
				<BlockWidget />
				<BlobsWidget />
			</Flex>

			<StakingWidget :class="$style.staking_widget" />

			<Flex direction="column" gap="20" wide :class="$style.column">
				<TransactionsWidget />
				<GasWidget />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.column {
	min-width: 368px;
}

.staking_widget {
	min-width: 216px;
}

@media (max-width: 1100px) {
	.wrapper {
		flex-direction: column;
	}
}

@media (max-width: 420px) {
	.column {
		min-width: initial;
	}
}
</style>
