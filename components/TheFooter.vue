<script setup>
const appConfig = useAppConfig()

const currentTheme = ref("dark")

onMounted(() => {
	const root = document.querySelector("html")
	currentTheme.value = root.getAttribute("theme") ? "light" : "dark"
})

const handleChangeTheme = () => {
	const root = document.querySelector("html")

	if (!root.getAttribute("theme")) {
		root.setAttribute("theme", "light")
		currentTheme.value = "light"
	} else {
		root.removeAttribute("theme")
		currentTheme.value = "dark"
	}
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
					<Flex @click="handleChangeTheme" align="center" gap="6" :class="$style.btn">
						<Icon :name="currentTheme === 'light' ? 'moon' : 'sun'" size="12" color="secondary" />
						<Text size="12" weight="600" color="secondary">Switch to {{ currentTheme === "light" ? "Dark" : "Light" }}</Text>
					</Flex>

					<Text size="12" weight="700" color="support">/</Text>

					<Flex align="center" gap="8">
						<a href="https://twitter.com/celenium_io" target="_blank">
							<Icon name="twitter" size="14" color="secondary" :class="$style.btn" />
						</a>
						<a href="https://github.com/celenium-io" target="_blank">
							<Icon name="github" size="14" color="secondary" :class="$style.btn" />
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
