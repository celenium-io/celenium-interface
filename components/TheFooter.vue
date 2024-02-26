<script setup>
/** UI */
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

/** Services */
import { isPrefersDarkScheme } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const appConfig = useAppConfig()

let root = null

onMounted(() => {
	root = document.querySelector("html")

	if (!localStorage.theme) {
		localStorage.theme = "dark"
	}

	switch (localStorage.theme) {
		case "dark":
		case "dimmed":
		case "light":
			appStore.theme = localStorage.theme
			root.setAttribute("theme", appStore.theme)

			break

		case "system":
			appStore.theme = "system"
			root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")

			break
	}
})

watch(
	() => appStore.theme,
	() => {
		if (appStore.theme === "system") {
			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
				root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
			})
		}
	},
)

const handleChangeTheme = (theme) => {
	const root = document.querySelector("html")

	root.setAttribute("theme", theme)
	appStore.theme = theme
	localStorage.theme = theme
}
</script>

<template>
	<Flex tag="footer" justify="center" :class="$style.wrapper">
		<Flex justify="between" wide :class="$style.container">
			<Flex direction="column" gap="12">
				<Flex align="center" gap="8">
					<Icon name="logo" size="14" color="tertiary" />
					<Text size="13" weight="500" color="secondary">Celenium</Text>
					<Text size="13" weight="500" color="tertiary">-</Text>
					<Text size="13" weight="500" color="tertiary">Celestia Explorer</Text>
					<a :href="`https://github.com/celenium-io/celenium-interface/releases/tag/v${appConfig.version}`" target="_blank">
						<Flex>
							<Text size="13" weight="500" color="support">v</Text>
							<Text size="13" weight="500" color="tertiary">{{ appConfig.version }}</Text>
						</Flex>
					</a>
				</Flex>

				<Flex align="center" gap="8">
					<NuxtLink to="https://www.pklab.io/terms" :class="$style.link">
						<Text size="12" weight="500" color="tertiary">Terms of Use</Text>
					</NuxtLink>
					<NuxtLink to="https://www.pklab.io/privacy" :class="$style.link">
						<Text size="12" weight="500" color="tertiary">Privacy Policy</Text>
					</NuxtLink>
				</Flex>

				<Flex align="center" gap="8">
					<Text size="12" weight="500" color="support">Donations:</Text>
					<a :href="`https://celenium.io/address/celestia15ans77hr2uxefyn6fa2lcsvpngwevuaugth7f5`" target="_blank">
						<Flex>
							<Text size="12" weight="500" color="tertiary">TIA</Text>
						</Flex>
					</a>
					<a :href="`https://etherscan.io/address/0x9FfB1cb28c55735e77B352eE918b4F0c3595a761`" target="_blank">
						<Flex>
							<Text size="12" weight="500" color="tertiary">ETH</Text>
						</Flex>
					</a>
				</Flex>
			</Flex>
			<Flex direction="column" align="end" gap="16">
				<Flex align="center" gap="16">
					<Dropdown side="top">
						<Flex align="center" gap="6" :class="$style.btn">
							<Icon
								:name="
									appStore.theme
										? (appStore.theme === 'system' && 'settings') ||
										  (appStore.theme === 'light' && 'sun') ||
										  (['dark', 'dimmed'].includes(appStore.theme) && 'moon')
										: ''
								"
								size="12"
								color="secondary"
							/>
							<Text size="12" weight="600" color="secondary" :style="{ textTransform: 'capitalize' }">
								{{ appStore.theme }}
							</Text>
						</Flex>

						<template #popup>
							<DropdownTitle>Theme</DropdownTitle>
							<DropdownItem @click="handleChangeTheme('dimmed')">Dimmed</DropdownItem>
							<DropdownItem @click="handleChangeTheme('dark')">Dark</DropdownItem>
							<DropdownItem @click="handleChangeTheme('light')">Light</DropdownItem>
							<DropdownItem @click="handleChangeTheme('system')">System</DropdownItem>
						</template>
					</Dropdown>

					<Text size="12" weight="700" color="support">/</Text>

					<Flex align="center" gap="8" :class="$style.socials">
						<a href="https://twitter.com/celenium_io" target="_blank">
							<Icon name="twitter" size="14" color="secondary" :class="$style.btn" />
						</a>
						<a href="https://github.com/celenium-io" target="_blank">
							<Icon name="github" size="14" color="secondary" :class="$style.btn" />
						</a>
						<a href="https://discord.com/channels/846362414039695391/1168936555302355005" target="_blank">
							<Icon name="discord" size="14" color="secondary" :class="$style.btn" />
						</a>
						<a href="https://www.youtube.com/watch?v=l4IrPuzTR-Q&list=PL3qDmPA7Yigp2fOHRqmQeZBMvZptOYQqB&pp=iAQB" target="_blank">
							<Icon name="youtube" size="14" color="secondary" :class="$style.btn" />
						</a>
					</Flex>
				</Flex>

				<Flex align="center" gap="16" :class="$style.links">
					<NuxtLink to="/blocks" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Blocks </Text>
					</NuxtLink>
					<NuxtLink to="/validators" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Validators </Text>
					</NuxtLink>
					<NuxtLink to="/txs" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Transactions </Text>
					</NuxtLink>
					<NuxtLink to="/rollups" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Rollups </Text>
					</NuxtLink>
					<NuxtLink to="/namespaces" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Namespaces </Text>
					</NuxtLink>
					<NuxtLink to="/addresses" :class="$style.link">
						<Text size="12" weight="500" color="tertiary"> Addresses </Text>
					</NuxtLink>
					<NuxtLink to="/gas" :class="$style.link">
						<Text size="12" weight="500" color="tertiary">Gas Tracker</Text>
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

.socials {
	& a {
		display: flex;
	}
}

@media (max-width: 600px) {
	.container {
		flex-direction: column;
		gap: 12px;
	}

	.links {
		flex-wrap: wrap;
		justify-content: center;
	}
}
</style>
