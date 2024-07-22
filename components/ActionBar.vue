<script setup>
/**
 * UI
 */
import Button from "@/components/ui/Button.vue"

/** Components */
import Search from "@/components/modules/navigation/Search.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()
</script>

<template>
	<Flex wide align="center" justify="between" gap="24" :class="$style.wrapper">
		<Flex wide align="center" gap="12">
			<Button @click="appStore.showSidebar = !appStore.showSidebar" type="secondary" size="medium" :class="$style.menu_btn">
				<Icon name="menu" size="16" color="primary" />
			</Button>

			<Search />
		</Flex>

		<Flex align="center" gap="12">
			<Button @click="appStore.showCmd = true" type="secondary" size="mini">
				<Icon name="terminal_square" size="16" color="secondary" />
			</Button>

			<div style="width: 2px; height: 16px; background: var(--op-10)" />

			<Connection :class="$style.connection_btn" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 12px 24px;
}

.menu_btn {
	display: none;
}

@media (max-width: 1300px) {
	.menu_btn {
		display: flex;
	}
}
</style>
