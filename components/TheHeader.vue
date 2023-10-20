<script setup>
const route = useRoute()

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
			<NuxtLink to="/">
				<Flex align="center" gap="8" :class="$style.logo">
					<Icon name="logo" size="18" color="primary" />
				</Flex>
			</NuxtLink>

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

			<Icon name="empty" :class="$style.empty_icon" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 52px;
}

.container {
	max-width: var(--base-width);

	margin: 0 24px;
}

.logo {
	background: linear-gradient(225deg, #1e804d, #022312);
	box-shadow: inset 0 0 0 2px var(--op-10);
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

@media (max-width: 600px) {
	.wrapper {
		height: initial;
	}

	.container {
		flex-direction: column;
		gap: 24px;

		margin: 24px 12px 12px 12px;
	}

	.empty_icon {
		display: none;
	}
}
</style>
