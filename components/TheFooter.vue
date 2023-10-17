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

				<a :href="`https://github.com/dipdup-io/celestia-explorer/releases/tag/v${appConfig.version}`" target="_blank">
					<Flex>
						<Text size="12" weight="600" color="support">
							Version <Text color="tertiary">{{ appConfig.version }}</Text>
						</Text>
					</Flex>
				</a>
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

				<Icon
					@click="handleChangeTheme"
					:name="currentTheme === 'dark' ? 'moon' : 'sun'"
					size="14"
					color="secondary"
					:class="$style.btn"
				/>
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
