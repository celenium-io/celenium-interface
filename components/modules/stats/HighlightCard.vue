<script setup>
/** Vendor */
// import { DateTime } from "luxon"

/** UI */
// import Button from "@/components/ui/Button.vue"
// import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { capitilize, comma, shortHex } from "@/services/utils"

/** API */
import { fetchNetworks, fetchCommitments, fetchCommitmentsByNetwork } from "@/services/api/blobstream";

const props = defineProps({
	series: {
		type: Object,
		required: false,
	},
	period: {
		type: Object,
		required: false,
	},
	active: {
		type: Boolean,
		default: false,
	},
})

const isLoading = ref(false)



</script>

<template>
    <Flex align="center" gap="12" :class="$style.card_wrapper">
        <Flex align="center" justify="between" :class="$style.card">
            <Flex align="center" gap="16">
                 <div :class="$style.left_border" />

                <Flex align="center" direction="column" gap="12">
                    <Flex align="center" justify="start" wide>
                        <Text size="13" weight="600" height="110" color="tertiary"> Blocks </Text>
                    </Flex>

                    <Text size="20" weight="600" color="primary"> 1,836,234 </Text>
                </Flex>
            </Flex>

            <Flex align="start">
                <Icon name="block" size="20" color="tertiary" />
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

	cursor: pointer;

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
