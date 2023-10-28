<script setup>
const route = useRoute()

const showPopup = ref(false)

const isActive = (link) => {
	const splittedPath = route.path.split("/").filter(Boolean)

	switch (link) {
		case "index":
			return route.path === "/"

		case "txs":
			return splittedPath.includes("tx") || splittedPath.includes("txs")

		case "blocks":
			return splittedPath.includes("block") || splittedPath.includes("blocks")

		case "namespaces":
			return splittedPath.includes("namespace") || splittedPath.includes("namespaces")

		default:
			break
	}
}
</script>

<template>
	<Flex tag="header" justify="center" wide :class="$style.wrapper">
		<Flex align="center" justify="between" wide :class="$style.container">
			<Flex align="center" gap="8">
				<Flex @click="showPopup = !showPopup" align="center" gap="8" :class="[$style.button, $style.menu]">
					<Icon :name="!showPopup ? 'menu' : 'close'" size="16" color="secondary" />
				</Flex>

				<NuxtLink to="/">
					<Flex align="center" gap="8" :class="$style.logo">
						<Icon name="logo" size="18" color="primary" />
					</Flex>
				</NuxtLink>
			</Flex>

			<Flex justify="center" align="center" wrap="wrap" gap="8" :class="$style.links">
				<NuxtLink to="/" :class="[$style.link, isActive('index') && $style.active]">
					<Text size="13" weight="600" color="tertiary">Explorer</Text>
				</NuxtLink>

				<NuxtLink to="/txs" :class="[$style.link, isActive('txs') && $style.active]">
					<Text size="13" weight="600" color="tertiary">Transactions</Text>
				</NuxtLink>

				<NuxtLink to="/blocks" :class="[$style.link, isActive('blocks') && $style.active]">
					<Text size="13" weight="600" color="tertiary">Blocks</Text>
				</NuxtLink>

				<NuxtLink to="/namespaces" :class="[$style.link, isActive('namespaces') && $style.active]">
					<Text size="13" weight="600" color="tertiary">Namespaces</Text>
				</NuxtLink>
			</Flex>

			<Flex align="center" gap="8" :class="$style.button">
				<Icon name="search" size="16" color="secondary" />
			</Flex>
		</Flex>

		<Flex v-if="showPopup" direction="column" gap="8" :class="$style.menu_popup">
			<NuxtLink to="/" :class="[$style.link, isActive('index') && $style.active]">
				<Text size="13" weight="600" color="tertiary">Explorer</Text>
			</NuxtLink>

			<NuxtLink to="/txs" :class="[$style.link, isActive('txs') && $style.active]">
				<Text size="13" weight="600" color="tertiary">Transactions</Text>
			</NuxtLink>

			<NuxtLink to="/blocks" :class="[$style.link, isActive('blocks') && $style.active]">
				<Text size="13" weight="600" color="tertiary">Blocks</Text>
			</NuxtLink>

			<NuxtLink to="/namespaces" :class="[$style.link, isActive('namespaces') && $style.active]">
				<Text size="13" weight="600" color="tertiary">Namespaces</Text>
			</NuxtLink>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;

	height: 52px;
}

.container {
	max-width: var(--base-width);

	margin: 0 24px;
}

.logo {
	background: linear-gradient(225deg, #1e804d, #093a21);
	box-shadow: inset 0 0 0 1px var(--op-10);
	cursor: pointer;
	border-radius: 8px;

	padding: 6px;
}

.logo_name {
	fill: var(--logo-name);
}

.link {
	display: flex;
	align-items: center;

	height: 26px;

	background: transparent;
	border-radius: 50px;

	padding: 0 10px;

	transition: all 0.1s ease;

	&:hover {
		background: var(--op-5);

		& span {
			color: var(--txt-secondary);
		}
	}

	& span {
		transition: all 0.1s ease;
	}

	&.active {
		background: rgba(255, 255, 255, 90%);

		&:hover {
			background: rgba(255, 255, 255, 90%);

			& span {
				color: var(--txt-black);
			}
		}

		& span {
			color: var(--txt-black);
		}
	}
}

.menu_popup {
	position: absolute;
	top: 52px;
	left: 0;
	right: 0;

	display: none;

	background: var(--app-background);
	border-top: 2px solid var(--op-5);
	border-bottom: 2px solid var(--op-5);

	padding: 16px;

	z-index: 100;
}

.button {
	height: 28px;

	border-radius: 6px;
	background: var(--op-5);
	cursor: pointer;

	padding: 0 8px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-8);
	}

	&:active {
		background: var(--op-10);
	}

	&.menu {
		display: none;
	}
}

@media (max-width: 600px) {
	.links {
		display: none;
	}

	.button.menu {
		display: flex;
	}

	.menu_popup {
		display: flex;
	}
}

@media (max-width: 500px) {
	.container {
		margin: 0 12px;
	}
}
</style>
