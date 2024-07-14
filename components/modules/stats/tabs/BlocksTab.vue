<script setup>
/** Stats Components */
import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"
import ShareTotalBars2 from "@/components/modules/stats/ShareTotalBars2.vue"

</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
        <BlocksFeed />

        <ShareTotalBars2 />
    </Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

</style>