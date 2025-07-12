<script setup>
import Tooltip from "@/components/ui/Tooltip.vue"

const props = defineProps({
    value: {
        type: [String, Number],
        default: "",
    },
    invert: {
        type: Boolean,
        default: false,
    },
    tooltip: {
        type: String,
        default: "Difference between current and previous equal period",
    },
})

const styles = computed(() => {
    let conditionValue = props.invert ? props.value * (-1) : props.value
    if (conditionValue > 0) {
        return {
            chip: {
                backgroundColor: 'var(--dark-mint)'
            },
            icon: {
                fill: 'var(--mint)'
            },
            text: {
                color: 'var(--mint)'
            }
        }
    } else if (conditionValue < 0) {
        return {
            chip: {
                backgroundColor: 'var(--dark-red)'
            },
            icon: {
                fill: 'var(--red)'
            },
            text: {
                color: 'var(--red)'
            }
        }
    } else {
        return {
            chip: {
                backgroundColor: 'var(--outline-background)'
            },
            icon: {
                fill: 'var(--txt-secondary)'
            },
            text: {
                color: 'var(--txt-secondary)'
            }
        }
    }
})
</script>

<template>
    <Flex v-if="!isNaN(value)" align="center" gap="4" :class="$style.chip" :style="styles.chip">
        <Tooltip position="start" side="top" delay="500">
            <Flex align="center" gap="4" :class="$style.content">
                <Icon v-if="value > 0" name="arrow-narrow-up-right" size="14" :style="styles.icon" />
                <Icon v-else-if="value < 0" name="arrow-narrow-up-right" rotate="90" size="14" :style="styles.icon" />

                <Text size="12" weight="600" noWrap :style="styles.text">
                    {{ Math.abs(value) }}%
                </Text>
            </Flex>

            <template #content>
                <Flex align="center"  :class="$style.tooltip">
                    <Text color="secondary" size="12"> {{ tooltip }} </Text>
                </Flex>
            </template>
        </Tooltip>
    </Flex>
    <Skeleton v-else w="60" h="14" />
</template>

<style module>
.chip {
    box-shadow: inset 0 0 0 1px var(--op-10);
    border-radius: 10px;
}

.content {
    padding: 2px 6px 2px 4px;
}

.tooltip {
    max-width: 170px;
    text-align: start;
    line-height: 1.5;
}
</style>