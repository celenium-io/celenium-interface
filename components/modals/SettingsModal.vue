<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Toggle from "@/components/ui/Toggle.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown/index.js"
import Button from "~/components/ui/Button.vue"

/** Services */
import { DEFAULT_SETTINGS } from "@/services/constants/settings.js"

/** Store */
import { useAuthStore } from "@/store/auth.store.js"

const authStore = useAuthStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const tabs = [
	{
		name: "Appearance",
		key: "appearance",
	},
	{
		name: "Sidebar",
		key: "sidebar",
	},
	{
		name: "Advanced",
		key: "advanced",
	},
]
const selectedTab = ref(tabs[0].key)

const settings = useCookie("localSettings", {
	default: () => {
		return DEFAULT_SETTINGS
	},
})

const handleClick = ({ selectedTab, sectionKey, setting, value }) => {
	if (selectedTab) {
		settings.value[selectedTab][sectionKey][setting] = value
	}

	authStore.saveSettings(settings.value)
}

const SettingsUIMap = {
	appearance: {
		general: {
			_title: "General",
			items: {
				theme: {
					title: "Interface theme",
					description: "Interface theme description",
					type: "selector",
					values: ["dark", "light", "dimmed", "system"],
				},
			},
		},
	},
	sidebar: {
		footer: {
			_title: "Footer",
			items: {
				showLightNode: {
					title: "Show light node",
					description: "Show light node button",
					type: "toggle",
				},
				showNetworkSelector: {
					title: "Show network selector",
					description: "Show network selector button",
					type: "toggle",
				},
			},
		},
	},
	advanced: {
		other: {
			_title: "Other",
			items: {
				showAds: {
					title: "Show advertisements",
					description: "Show advertisements description",
					type: "toggle",
				},
			},
		},
	},
}

watch(() => props.show, () => {
	if (!props.show) {
		selectedTab.value = tabs[0].key
	}
})

watch(() => authStore.isAuthenticated, () => {
	if (authStore.isAuthenticated && Object.keys(authStore.user.settings).length) {
		settings.value = JSON.parse(JSON.stringify(authStore.user.settings))
	}
})
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap :closeOutside="false">
		<Flex direction="column" gap="20">
			<Text size="14" weight="600" color="primary">Settings</Text>

			<Flex align="center" gap="6">
				<Text v-for="tab in tabs" @click="selectedTab = tab.key" size="13" weight="600"
					  :color="selectedTab === tab.key ? 'primary' : 'secondary'"
					  :class="[$style.tab, selectedTab === tab.key && $style.selected]">
					{{ tab.name }}
				</Text>
			</Flex>

			<Flex direction="column" gap="24">
				<Flex v-for="(section, sectionKey) in settings[selectedTab]" direction="column" gap="16">
					<Text size="13" weight="600" color="secondary">
						{{ SettingsUIMap[selectedTab][sectionKey]._title }}
					</Text>

					<Flex v-for="setting in Object.keys(section)" justify="between">
						<Flex direction="column" gap="6">
							<Text size="13" weight="600" color="primary">
								{{ SettingsUIMap[selectedTab][sectionKey].items[setting].title }}
							</Text>
							<Text size="12" weight="500" color="tertiary">
								{{ SettingsUIMap[selectedTab][sectionKey].items[setting].description }}
							</Text>
						</Flex>

						<template v-if="SettingsUIMap[selectedTab][sectionKey].items[setting].type === 'selector'">
							<Dropdown>
								<Button size="mini" type="secondary">
									<Icon name="sun" size="12" color="primary" />
									<Text color="primary">{{ settings[selectedTab][sectionKey][setting] }}
									</Text>
									<Icon name="chevron" size="12" color="secondary" />
								</Button>

								<template #popup>
									<DropdownItem
										v-for="value in SettingsUIMap[selectedTab][sectionKey].items[setting].values"
										@click="handleClick({selectedTab, sectionKey, setting, value})"
									>
										<Flex align="center" gap="8">
											<Icon
												:name="settings[selectedTab][sectionKey][setting] === value ? 'check' : ''"
												size="12"
												color="secondary"
											/>
											{{ value }}
										</Flex>
									</DropdownItem>
								</template>
							</Dropdown>
						</template>
						<template v-else-if="SettingsUIMap[selectedTab][sectionKey].items[setting].type === 'toggle'">
							<Toggle v-model="settings[selectedTab][sectionKey][setting]" @click="handleClick" />
						</template>
					</Flex>
				</Flex>
			</Flex>

		</Flex>
	</Modal>
</template>

<style module>
.tab {
	border-radius: 6px;
	background: var(--op-5);
	cursor: pointer;
	user-select: none;

	padding: 6px 8px;

	transition: all .2s ease;

	&.selected {
		background: var(--op-10);
	}

	&:hover {
		background: var(--op-10);
	}
}
</style>
