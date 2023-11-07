<script setup>
/** UI */
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

/** Services */
import { getNetworkName } from "@/services/utils"

const appConfig = useAppConfig()

const currentTheme = ref("dark")

onMounted(() => {
	const root = document.querySelector("html")
	currentTheme.value = root.getAttribute("theme") ? "light" : "dark"
})

const handleNavigate = (url) => {
	window.location.replace(url)
}

const handleChangeTheme = (theme) => {
	const root = document.querySelector("html")

	root.setAttribute("theme", theme)
	currentTheme.value = theme
}
</script>

<template>
	<Flex tag="footer" justify="center" :class="$style.wrapper">
		<Flex justify="between" wide :class="$style.container">
			<Flex direction="column" gap="16">
				<Flex align="center" gap="8">
					<Icon name="logo" size="14" color="tertiary" />
					<Text size="13" weight="500" color="secondary">Celenium</Text>
					<Text size="13" weight="500" color="tertiary">- Celestia Explorer, {{ new Date().getFullYear() }}</Text>
				</Flex>

				<Flex align="center" gap="16">
					<a :href="`https://github.com/dipdup-io/celestia-explorer/releases/tag/v${appConfig.version}`" target="_blank">
						<Flex>
							<Text size="12" weight="600" color="support">
								Version <Text color="tertiary">{{ appConfig.version }}</Text>
							</Text>
						</Flex>
					</a>
				</Flex>
			</Flex>

			<Flex direction="column" align="end" gap="16">
				<Flex align="center" gap="16">
					<Flex align="center" gap="8">
						<Dropdown side="top">
							<Flex align="center" gap="6" :class="$style.btn">
								<Icon name="globe" size="12" color="secondary" />
								<Text size="12" weight="600" color="secondary">{{ getNetworkName() }}</Text>
							</Flex>

							<template #popup>
								<DropdownTitle>Network</DropdownTitle>
								<DropdownItem @click="handleNavigate('https://celenium.io')">Mainnet</DropdownItem>
								<DropdownItem @click="handleNavigate('https://mocha-4.celenium.io')">Mocha-4</DropdownItem>
							</template>
						</Dropdown>

						<Dropdown side="top">
							<Flex align="center" gap="6" :class="$style.btn">
								<Icon :name="currentTheme === 'light' ? 'sun' : 'moon'" size="12" color="secondary" />
								<Text size="12" weight="600" color="secondary" :style="{ textTransform: 'capitalize' }">
									{{ currentTheme }}
								</Text>
							</Flex>

							<template #popup>
								<DropdownTitle>Theme</DropdownTitle>
								<DropdownItem @click="handleChangeTheme('dimmed')">Dimmed</DropdownItem>
								<DropdownItem @click="handleChangeTheme('dark')">Dark</DropdownItem>
								<DropdownItem @click="handleChangeTheme('light')">Light</DropdownItem>
							</template>
						</Dropdown>
					</Flex>

					<Text size="12" weight="700" color="support">/</Text>

					<Flex align="center" gap="8">
						<a href="https://twitter.com/celenium_io" target="_blank">
							<Icon name="twitter" size="14" color="secondary" :class="$style.btn" />
						</a>
						<a href="https://github.com/celenium-io" target="_blank">
							<Icon name="github" size="14" color="secondary" :class="$style.btn" />
						</a>
						<a href="https://discord.com/channels/846362414039695391/1168936555302355005" target="_blank">
							<Icon name="discord" size="14" color="secondary" :class="$style.btn" />
						</a>
					</Flex>
				</Flex>

				<Flex align="center" gap="16">
					<NuxtLink to="/blocks" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Blocks </Text>
					</NuxtLink>
					<NuxtLink to="/txs" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Transactions </Text>
					</NuxtLink>
					<NuxtLink to="/namespaces" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Namespaces </Text>
					</NuxtLink>
					<NuxtLink to="/addresses" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Addresses </Text>
					</NuxtLink>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-top: 2px solid var(--op-5);
}

.container {
	max-width: var(--base-width);

	padding: 24px 0;
	margin: 0 24px;
}

.link {
	& span {
		transition: all 0.2s ease;

		&:hover {
			color: var(--txt-primary);
		}
	}
}

.btn {
	box-sizing: content-box;
	border-radius: 5px;
	background: var(--op-8);
	cursor: pointer;

	padding: 6px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-10);
	}

	&:active {
		background: var(--op-15);
	}
}

@media (max-width: 600px) {
	.container {
		flex-direction: column;
		gap: 12px;
	}
}
</style>
