<script setup>
/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Store */
import { useNotificationsStore } from "@/store/notifications.store"
const notificationsStore = useNotificationsStore()

const props = defineProps({
	proposal: {
		type: Object,
		required: true,
	},
})

const metadata = computed(() => {
	const m = props.proposal?.metadata
	if (typeof m !== 'string') return m

	try {
		new URL(m)
		return m
	} catch (_) {}

	const base64Pattern = /^[A-Za-z0-9+/=]+$/
	if (!base64Pattern.test(m)) {
		return m
	}

	try {
		const decoded = atob(m)
		const parsed = JSON.parse(decoded)
		return JSON.stringify(parsed, null, 2)
	} catch {
		return m
	}
})

const isCopied = ref(false)
const handleCopy = (text) => {
	if (!text) return

	window.navigator.clipboard.writeText(text)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})

	isCopied.value = true
	setTimeout(() => {
		isCopied.value = false
	}, 2_000)
}
</script>

<template>
	<Flex direction="column" gap="40">
		<Flex v-if="metadata" direction="column" gap="4">
			<Flex align="center" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="code" size="14" color="primary" />
					<Text size="13" weight="600" color="primary">Metadata</Text>
					<Icon @click="handleCopy(metadata)" :name="isCopied ? 'check' : 'copy'" size="12" :color="isCopied ? 'green' : 'secondary'" style="cursor: pointer;" />
				</Flex>
			</Flex>

			<div :class="$style.content">
				<Flex direction="column" gap="16">
					<Text as="pre" size="14" height="160" weight="500" color="body">
						{{ metadata }}
					</Text>
				</Flex>
			</div>
		</Flex>

		<Flex direction="column" gap="4">
			<Flex align="center" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="menu" size="14" color="primary" />
					<Text size="13" weight="600" color="primary">Description</Text>
				</Flex>
			</Flex>

			<div :class="$style.content">
				<Flex v-if="proposal.description" direction="column" gap="16">
					<Text as="pre" size="14" height="160" weight="500" color="body" :class="[$style.description]">
						{{ proposal.description }}
					</Text>
				</Flex>

				<TablePlaceholderView
					v-else
					title="There's no description"
					description="This proposal does not contain any description."
					icon="menu"
					subIcon="search"
					:descriptionWidth="260"
				/>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.content {
	min-height: 44px;
	overflow-x: auto;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 16px;
}

.description {
	white-space: pre-line;
}

@media (max-width: 400px) {
	.content {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
