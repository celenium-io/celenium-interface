<script setup>
/** UI */
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

/** Services */
import { isPrefersDarkScheme } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

const theme = useCookie("theme", { default: () => "dark" })
switch (theme.value) {
	case "dark":
	case "dimmed":
	case "light":
		appStore.theme = theme.value

		break

	case "system":
		appStore.theme = "system"

		break
}

onMounted(() => {
	let root = document.querySelector("html")

	if (appStore.theme === "system") {
		root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
	} else {
		root.setAttribute("theme", appStore.theme)
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

const handleChangeTheme = (target) => {
	const root = document.querySelector("html")

	root.setAttribute("theme", target)
	appStore.theme = target
	theme.value = target
}
</script>

<template>
	<Flex justify="center" :class="$style.wrapper">
		<Flex wide :class="$style.container">
			<Flex wide justify="between" :class="$style.main">
				<Flex>
					<Flex direction="column" gap="24" :class="$style.left">
						<NuxtLink to="/" :class="$style.logo">
							<Flex align="center" gap="8">
								<Icon name="logo" size="16" color="secondary" :class="$style.logo_symbol" />

								<svg
									width="86"
									height="14"
									viewBox="0 0 96 16"
									xmlns="http://www.w3.org/2000/svg"
									:class="$style.logo_name"
								>
									<path
										d="M14.22 10.46C14.0867 11.46 13.7333 12.32 13.16 13.04C12.5867 13.7467 11.82 14.2933 10.86 14.68C9.91333 15.0533 8.80667 15.24 7.54 15.24C6.44667 15.24 5.44 15.0933 4.52 14.8C3.61333 14.5067 2.82 14.08 2.14 13.52C1.47333 12.9467 0.953333 12.2467 0.58 11.42C0.22 10.58 0.04 9.62 0.04 8.54C0.04 7.44667 0.22 6.48667 0.58 5.66C0.953333 4.83333 1.47333 4.13333 2.14 3.56C2.82 2.97333 3.61333 2.53333 4.52 2.24C5.44 1.94667 6.44667 1.8 7.54 1.8C8.82 1.8 9.93333 1.99333 10.88 2.38C11.84 2.76667 12.6067 3.32 13.18 4.04C13.7533 4.76 14.1 5.62667 14.22 6.64H12.02C11.8333 6.04 11.54 5.53333 11.14 5.12C10.74 4.69333 10.2333 4.36667 9.62 4.14C9.02 3.91333 8.32667 3.8 7.54 3.8C6.55333 3.8 5.66667 3.98667 4.88 4.36C4.09333 4.72 3.47333 5.25333 3.02 5.96C2.58 6.65333 2.36 7.51333 2.36 8.54C2.36 9.55333 2.58 10.4133 3.02 11.12C3.47333 11.8133 4.09333 12.34 4.88 12.7C5.66667 13.06 6.55333 13.24 7.54 13.24C8.32667 13.24 9.02 13.1333 9.62 12.92C10.22 12.6933 10.72 12.3733 11.12 11.96C11.52 11.5333 11.8133 11.0333 12 10.46H14.22ZM24.8295 11.72H26.9695C26.8629 12.4 26.5962 13.0067 26.1695 13.54C25.7562 14.06 25.1895 14.4733 24.4695 14.78C23.7495 15.0733 22.8895 15.22 21.8895 15.22C20.7562 15.22 19.7429 15.0133 18.8495 14.6C17.9562 14.1733 17.2562 13.5733 16.7495 12.8C16.2429 12.0267 15.9895 11.1067 15.9895 10.04C15.9895 8.98667 16.2362 8.06667 16.7295 7.28C17.2229 6.49333 17.9029 5.88667 18.7695 5.46C19.6495 5.03333 20.6629 4.82 21.8095 4.82C22.9962 4.82 23.9829 5.03333 24.7695 5.46C25.5695 5.87333 26.1629 6.5 26.5495 7.34C26.9362 8.16667 27.0962 9.21333 27.0295 10.48H18.2495C18.3162 11.04 18.4962 11.5467 18.7895 12C19.0962 12.44 19.5095 12.7867 20.0295 13.04C20.5495 13.28 21.1562 13.4 21.8495 13.4C22.6229 13.4 23.2695 13.2467 23.7895 12.94C24.3229 12.6333 24.6695 12.2267 24.8295 11.72ZM21.7495 6.62C20.8429 6.62 20.0962 6.84667 19.5095 7.3C18.9229 7.74 18.5429 8.30667 18.3695 9H24.7895C24.7362 8.25333 24.4362 7.67333 23.8895 7.26C23.3429 6.83333 22.6295 6.62 21.7495 6.62ZM29.2095 1.04H31.4295V15H29.2095V1.04ZM42.4467 11.72H44.5867C44.4801 12.4 44.2134 13.0067 43.7867 13.54C43.3734 14.06 42.8067 14.4733 42.0867 14.78C41.3667 15.0733 40.5067 15.22 39.5067 15.22C38.3734 15.22 37.3601 15.0133 36.4667 14.6C35.5734 14.1733 34.8734 13.5733 34.3667 12.8C33.8601 12.0267 33.6067 11.1067 33.6067 10.04C33.6067 8.98667 33.8534 8.06667 34.3467 7.28C34.8401 6.49333 35.5201 5.88667 36.3867 5.46C37.2667 5.03333 38.2801 4.82 39.4267 4.82C40.6134 4.82 41.6001 5.03333 42.3867 5.46C43.1867 5.87333 43.7801 6.5 44.1667 7.34C44.5534 8.16667 44.7134 9.21333 44.6467 10.48H35.8667C35.9334 11.04 36.1134 11.5467 36.4067 12C36.7134 12.44 37.1267 12.7867 37.6467 13.04C38.1667 13.28 38.7734 13.4 39.4667 13.4C40.2401 13.4 40.8867 13.2467 41.4067 12.94C41.9401 12.6333 42.2867 12.2267 42.4467 11.72ZM39.3667 6.62C38.4601 6.62 37.7134 6.84667 37.1267 7.3C36.5401 7.74 36.1601 8.30667 35.9867 9H42.4067C42.3534 8.25333 42.0534 7.67333 41.5067 7.26C40.9601 6.83333 40.2467 6.62 39.3667 6.62ZM46.6267 5.04H48.8467V15H46.6267V5.04ZM53.0467 4.82C53.6201 4.82 54.1467 4.9 54.6267 5.06C55.1201 5.22 55.5401 5.46667 55.8867 5.8C56.2467 6.12 56.5201 6.52 56.7067 7C56.9067 7.48 57.0067 8.04667 57.0067 8.7V15H54.7867V9.14C54.7867 8.32667 54.5867 7.72667 54.1867 7.34C53.8001 6.94 53.1867 6.74 52.3467 6.74C51.7067 6.74 51.1201 6.88 50.5867 7.16C50.0667 7.42667 49.6401 7.78 49.3067 8.22C48.9734 8.64667 48.7801 9.12 48.7267 9.64L48.7067 8.56C48.7734 8.06667 48.9201 7.6 49.1467 7.16C49.3734 6.70667 49.6734 6.30667 50.0467 5.96C50.4201 5.6 50.8601 5.32 51.3667 5.12C51.8734 4.92 52.4334 4.82 53.0467 4.82ZM62.0588 0.819999V2.96H59.3988V0.819999H62.0588ZM59.5988 5.04H61.8388V15H59.5988V5.04ZM74.8778 15H72.6578V5.04H74.8778V15ZM72.7778 10.26L72.7978 10.9C72.7711 11.0733 72.7111 11.3333 72.6178 11.68C72.5378 12.0267 72.3978 12.4067 72.1978 12.82C72.0111 13.22 71.7578 13.6067 71.4378 13.98C71.1311 14.34 70.7445 14.64 70.2778 14.88C69.8111 15.1067 69.2445 15.22 68.5778 15.22C68.0978 15.22 67.6111 15.1533 67.1178 15.02C66.6378 14.9 66.1978 14.6933 65.7978 14.4C65.4111 14.1067 65.0978 13.7067 64.8578 13.2C64.6178 12.6933 64.4978 12.0533 64.4978 11.28V5.04H66.7178V10.86C66.7178 11.4867 66.8178 11.98 67.0178 12.34C67.2311 12.6867 67.5245 12.9333 67.8978 13.08C68.2711 13.2267 68.7045 13.3 69.1978 13.3C69.9045 13.3 70.5045 13.14 70.9978 12.82C71.4911 12.5 71.8845 12.1067 72.1778 11.64C72.4845 11.16 72.6845 10.7 72.7778 10.26ZM77.3298 5.04H79.5498V15H77.3298V5.04ZM83.7498 4.82C84.3232 4.82 84.8498 4.9 85.3298 5.06C85.8232 5.22 86.2432 5.46667 86.5898 5.8C86.9498 6.12 87.2232 6.52 87.4098 7C87.6098 7.48 87.7098 8.04667 87.7098 8.7V15H85.4898V9.14C85.4898 8.32667 85.2898 7.72667 84.8898 7.34C84.5032 6.94 83.8898 6.74 83.0498 6.74C82.4098 6.74 81.8232 6.88 81.2898 7.16C80.7698 7.42667 80.3432 7.78 80.0098 8.22C79.6765 8.64667 79.4832 9.12 79.4298 9.64L79.4098 8.56C79.4765 8.06667 79.6232 7.6 79.8498 7.16C80.0765 6.70667 80.3765 6.30667 80.7498 5.96C81.1232 5.6 81.5632 5.32 82.0698 5.12C82.5765 4.92 83.1365 4.82 83.7498 4.82ZM91.6898 4.82C92.2765 4.82 92.8098 4.9 93.2898 5.06C93.7698 5.22 94.1832 5.46667 94.5298 5.8C94.8898 6.12 95.1698 6.52 95.3698 7C95.5698 7.48 95.6698 8.04667 95.6698 8.7V15H93.4298V9.14C93.4298 8.32667 93.2298 7.72667 92.8298 7.34C92.4432 6.94 91.8298 6.74 90.9898 6.74C90.3498 6.74 89.7632 6.88 89.2298 7.16C88.7098 7.42667 88.2832 7.78 87.9498 8.22C87.6298 8.64667 87.4432 9.12 87.3898 9.64L87.3498 8.52C87.4165 8.04 87.5698 7.58 87.8098 7.14C88.0498 6.68667 88.3565 6.28667 88.7298 5.94C89.1032 5.59333 89.5365 5.32 90.0298 5.12C90.5365 4.92 91.0898 4.82 91.6898 4.82Z"
									/>
								</svg>
							</Flex>
						</NuxtLink>

						<Flex align="center" gap="8" :class="$style.socials">
							<a href="https://twitter.com/celenium_io" target="_blank">
								<Icon name="twitter" size="14" color="tertiary" />
							</a>
							<a href="https://github.com/celenium-io" target="_blank">
								<Icon name="github" size="14" color="tertiary" />
							</a>
							<a href="https://discord.com/channels/846362414039695391/1168936555302355005" target="_blank">
								<Icon name="discord" size="14" color="tertiary" />
							</a>
							<a
								href="https://www.youtube.com/watch?v=l4IrPuzTR-Q&list=PL3qDmPA7Yigp2fOHRqmQeZBMvZptOYQqB&pp=iAQB"
								target="_blank"
							>
								<Icon name="youtube" size="14" color="tertiary" />
							</a>
						</Flex>
					</Flex>

					<Flex wrap="wrap" :class="$style.content">
						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="tertiary">General</Text>
							<NuxtLink to="/">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Browse</Text>
							</NuxtLink>
							<NuxtLink to="/txs">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Transactions</Text>
							</NuxtLink>
							<NuxtLink to="/blocks">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Blocks</Text>
							</NuxtLink>
							<NuxtLink to="/addresses">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Addresses</Text>
							</NuxtLink>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="tertiary">Modular</Text>
							<NuxtLink to="/rollups">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Rollups</Text>
							</NuxtLink>
							<NuxtLink to="/namespaces">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Namespaces</Text>
							</NuxtLink>
							<NuxtLink to="/validators">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Validators</Text>
							</NuxtLink>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="tertiary">Tools</Text>
							<NuxtLink to="https://terminal.celenium.io">
								<Flex align="center" gap="6">
									<Text size="13" weight="500" color="secondary" :class="$style.link_text">Terminal</Text>
									<Icon name="arrow-narrow-up-right-circle" size="12" color="tertiary" />
								</Flex>
							</NuxtLink>
							<NuxtLink to="/faucet">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Faucet</Text>
							</NuxtLink>
							<NuxtLink to="/blobstream">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Blobstream</Text>
							</NuxtLink>
							<NuxtLink to="/calculators/savings">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Cost Savings</Text>
							</NuxtLink>
							<NuxtLink to="/gas">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Gas Tracker</Text>
							</NuxtLink>
							<NuxtLink to="/bookmarks">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Bookmarks</Text>
							</NuxtLink>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="tertiary">Resources</Text>
							<NuxtLink to="https://api-plans.celenium.io" target="_blank">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">API</Text>
							</NuxtLink>
							<NuxtLink to="https://docs.celenium.io" target="_blank">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Documentation</Text>
							</NuxtLink>
							<NuxtLink to="https://hubble.celenium.io" target="_blank">
								<Text size="13" weight="500" color="secondary" :class="$style.link_text">Hubble</Text>
							</NuxtLink>
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center" gap="12" style="height: fit-content">
					<Flex align="center" gap="6" :class="$style.btn">
						<Text size="12" weight="600" color="tertiary"> Donate </Text>
						<a href="https://celenium.io/address/celestia1avr0gh0v6errxr8g8rjkscxf3jqx4k6ypkh2rl" target="_blank">
							<Text size="12" weight="600" color="secondary"> TIA </Text>
						</a>
						<a href="https://etherscan.io/address/0x9FfB1cb28c55735e77B352eE918b4F0c3595a761" target="_blank">
							<Text size="12" weight="600" color="secondary"> ETH </Text>
						</a>
					</Flex>

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
				</Flex>
			</Flex>
		</Flex>
	</Flex>
	<Flex justify="center" :class="$style.bottom">
		<Flex wide align="center" gap="20" justify="between" :class="$style.bottom_container">
			<Flex align="center" gap="20">
				<NuxtLink to="/terms-of-use" style="line-height: 12px">
					<Text size="12" weight="500" color="tertiary">Terms of use</Text>
				</NuxtLink>

				<NuxtLink to="/privacy-policy" style="line-height: 12px">
					<Text size="12" weight="500" color="tertiary">Privacy policy</Text>
				</NuxtLink>
			</Flex>

			<a href="https://bakingbad.dev/" target="_blank" style="line-height: 12px">
				<Text size="12" weight="500" color="tertiary">Made by Baking Bad</Text>
			</a>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-top: 2px solid var(--op-5);
}

.container {
	max-width: 1260px;

	padding: 32px 20px 80px 0;
}

.content {
	gap: 80px;

	padding: 0 24px;

	& a {
		line-height: 12px;
	}
}

.left {
	width: 230px;

	padding-left: 20px;
}

.socials {
	& a {
		display: flex;
	}
}

.btn {
	max-height: 24px;

	box-sizing: content-box;
	border-radius: 5px;
	background: var(--op-8);
	cursor: pointer;

	padding: 6px;

	transition: all 0.2s ease;

	& a {
		display: flex;
	}

	&:hover {
		background: var(--op-10);
	}

	&:active {
		background: var(--op-15);
	}
}

.logo {
}

.logo_symbol {
	box-sizing: content-box;
	cursor: pointer;
}

.logo_name {
	fill: var(--txt-secondary);
}

.bottom {
	background: var(--op-3);

	padding: 12px 0;
}

.bottom_container {
	max-width: 1260px;

	padding: 0 20px;
}

.link_text {
	transition: all 0.2s ease;

	&:hover {
		color: var(--txt-primary);
	}
}

@media (max-width: 1300px) {
	.container {
		max-width: 1030px;
	}
}

@media (max-width: 700px) {
	.main {
		flex-direction: column;
		align-items: center;
		gap: 60px;
	}

	.content {
		justify-content: center;
	}

	.main > div {
		flex-direction: column;
		align-items: center;
		gap: 60px;
	}

	.left {
		align-items: center;
	}
}
</style>
