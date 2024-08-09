<script setup>
/** Vendor */
// import { DateTime } from "luxon"

/** UI */
// import Button from "@/components/ui/Button.vue"
// import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { abbreviate, capitilize, comma, formatBytes, shortHex, tia } from "@/services/utils"

/** API */
import { fetchNetworks, fetchCommitments, fetchCommitmentsByNetwork } from "@/services/api/blobstream";

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

const props = defineProps({
	highlight: {
		type: Object,
		required: true,
	},
})

const isLoading = ref(false)

const value = computed(() => {
	if (props.highlight.name === 'blocks') return comma(props.highlight.value)
	
	switch (props.highlight.units) {
		case 'bytes':
			return formatBytes(props.highlight.value)
		case 'utia':
			return `${abbreviate(tia(props.highlight.value))} TIA`
		default:
			return abbreviate(props.highlight.value)
	}
})

</script>

<template>
    <Flex align="center" gap="12" :class="$style.card_wrapper">
        <Flex align="center" justify="between" :class="$style.card">
            <Flex align="center" gap="16">
                 <div :class="$style.left_border" />

                <Flex align="center" direction="column" gap="12">
                    <Flex align="center" justify="start" wide>
                        <Text size="13" weight="600" height="110" color="tertiary"> {{ highlight.title }} </Text>
                    </Flex>

					<Flex align="center" justify="start" wide>
                    	<Text size="20" weight="600" color="primary"> {{ value }} </Text>
					</Flex>
                </Flex>
            </Flex>

            <Flex align="start">
                <Icon v-if="highlight.name === 'blocks'" name="block" size="20" color="tertiary" />

				<DiffChip v-else :value="highlight.diff.toFixed(1)" />
            </Flex>
        </Flex>
    </Flex>
</template>

<style module>
.card_wrapper {
	margin: 16px 0px 16px 0px;
}

.card {
	min-height: 80px;
	width: 240px;

	background: var(--card-background);
	border-radius: 12px;

	padding: 16px 16px 16px 0px;

	box-shadow: inset 0 0 0 1px var(--op-3);

	/* &:hover {
		opacity: 0.8;
	}

	&:active {
		scale: 0.95;
	} */
}
.left_border {
    height: 40px;
    width: 4px;
	border-radius: 8px;
    /* background: var(--txt-tertiary); */
	background: var(--op-10);
}

.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.message_type {
	max-width: 100px;
	text-overflow: ellipsis;
	overflow: hidden;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.card_active {
	box-shadow: inset 0 0 0 1px var(--green);
}

.unclickable {
	pointer-events: none;
}

.empty {
	padding: 16px 0;
}

/* @media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
} */
</style>
