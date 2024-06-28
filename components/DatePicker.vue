<script setup>
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"

const props = defineProps({
	hash: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: "primary"
	},
})

const alias = computed(() => {
	const { $getDisplayName } = useNuxtApp()

  	return $getDisplayName('addresses', props.hash)
})
</script>

<template>
	<Popover :open="isMessageTypePopoverOpen" @on-close="onMessageTypePopoverClose" width="250">
		<Button @click="handleOpenMessageTypePopover" type="secondary" size="mini">
			<Icon name="plus-circle" size="12" color="tertiary" />
			<Text color="secondary">Message Type</Text>

			<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
				<div :class="$style.vertical_divider" />

				<Text size="12" weight="600" color="primary">
					{{
						Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length < 3
							? Object.keys(filters.message_type)
									.filter((f) => filters.message_type[f])
									.map((f) => f.replace("Msg", ""))
									.join(", ")
							: `${Object.keys(filters.message_type)
									.filter((f) => filters.message_type[f])[0]
									.replace("Msg", "")} and ${
									Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length - 1
								} more`
					}}
				</Text>

				<Icon @click.stop="resetFilters('message_type', true)" name="close-circle" size="12" color="secondary" />
			</template>
		</Button>

		<template #content>
			<Flex direction="column" gap="12">
				<Text size="12" weight="500" color="secondary">Filter by Message Type</Text>

				<Input v-model="searchTerm" size="small" placeholder="Search" autofocus />

				<Flex direction="column" gap="8" :class="$style.message_types_list">
					<template
						v-if="
							Object.keys(filters.message_type).filter((t) =>
								t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
							).length
						"
					>
						<Checkbox
							v-for="msg_type in Object.keys(filters.message_type).filter((t) =>
								t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
							)"
							v-model="filters.message_type[msg_type]"
						>
							<Text size="12" weight="500" color="primary">{{ msg_type.replace("Msg", "") }}</Text>
						</Checkbox>
					</template>
					<Flex v-else direction="column" gap="8">
						<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
					</Flex>
				</Flex>

				<Button @click="handleApplyMessageTypeFilters" type="secondary" size="mini" wide>Apply</Button>
			</Flex>
		</template>
	</Popover>
</template>