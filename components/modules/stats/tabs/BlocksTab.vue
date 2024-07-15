<script setup>
/** Stats Components */
import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"
import ShareTotalBars from "~/components/modules/stats/ShareTotalBars.vue"

</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
        <BlocksFeed />

        <ShareTotalBars />

        <!-- block time (avg) | bytes in block (cumulative) | square size current day like insights -->
    </Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

</style>