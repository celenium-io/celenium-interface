<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchValidatorUptime } from "@/services/api/validator"

const props = defineProps({
    validator: {
        type: Object,
        required: true,
    }
})

const uptime = ref([])
const getUptime = async () => {
	const { data } = await fetchValidatorUptime({
		id: props.validator?.id,
		limit: 100,
	})

	if (data.value?.blocks?.length) {
		uptime.value = data.value.blocks.sort((a, b) => a.height - b.height)
	}
}
await getUptime()

</script>

<template>
    <Flex direction="column" gap="12" wide :class="$style.wrapper">
        <Flex align="center" gap="6">
            <Text size="12" weight="600" color="secondary">Validator Uptime</Text>
            <Text size="12" weight="600" color="tertiary">(last 100 blocks)</Text>
        </Flex>

        <!-- <Flex align="center" justify="between" :class="$style.uptime_wrapper"> -->
        <Flex :class="$style.uptime_wrapper">
            <Tooltip v-for="t in uptime" @click="navigateTo(`/block/${t.height}`)">
                <Flex
                    :class="$style.uptime"
                    :style="{
                        background: t.signed ? 'var(--brand)' : 'var(--red)',
                    }"
                />

                <template #content>
                    <Flex direction="column" gap="4">
                        <Text color="primary">{{ t.height }}</Text>
                        <Text color="secondary">{{ t.signed ? "Signed" : "Missed" }}</Text>
                    </Flex>
                </template>
            </Tooltip>
        </Flex>
    </Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	background: var(--card-background);

	padding: 12px;
}

.uptime_wrapper {
    flex-wrap: wrap;
}

.uptime {
    width: 1rem;
    height: 1rem;

    border-radius: 2px;
    cursor: pointer;

    margin-right: 0.2rem;
    margin-bottom: 0.2rem;

    opacity: 0.8;
}
</style>