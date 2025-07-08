<script setup>
import NavLink from "./NavLink.vue"

const route = useRoute()

const emit = defineEmits(["onClose"])
const props = defineProps({
	link: Object,
})

const isExpanded = ref(props.link.children?.some((l) => l.path === route.path))

const isSubRouteActive = (link) => {
	let res = false
	if (link.queryParam) {
		const queryString = route.fullPath.split("?")[1]
		const params = new URLSearchParams(queryString)

		for (const [key, value] of params.entries()) {
			if (link.queryParam[key] === value) {
				res = true
				break
			}
		}
	}

	return res
}

const isAnyChildrenActive = computed(() => {
	let res = false

	if (props.link.children?.length) {
		for (const link of props.link.children) {
			if (isSubRouteActive(link)) {
				res = true
				break
			}
		}
	}

	return res
})

const isActive = computed(() => {
	let res = false

	if (props.link.queryParam) {
		res = isSubRouteActive(props.link)
	} else {
		if (route.path?.includes("/txs")) {
			if (props.link.name === "Transactions") {
				res = !route.fullPath?.includes("message_type=MsgPayForBlobs")
			} else if (props.link.name === "Pay for Blobs") {
				res = route.fullPath?.includes("message_type=MsgPayForBlobs")
			}
		} else {
			res = route.path === props.link.path
		}
	}

	return res
})

const handleClick = () => {
	emit("onClose")
	if (props.link.callback) props.link.callback()
}
</script>

<template>
	<NuxtLink @click.stop="handleClick" :to="link.path" :target="link.external && '_blank'">
		<Flex
			align="center"
			justify="between"
			gap="8"
			:class="[
				$style.link,
				isActive && (!isAnyChildrenActive || !isExpanded) && $style.active,
				isAnyChildrenActive && isExpanded && $style.parentActive,
			]"
		>
			<Flex align="center" gap="8">
				<Icon :name="link.icon" size="14" :color="!link.new ? 'secondary' : 'blue'" :class="$style.link_icon" />
				<Text size="13" weight="600" color="secondary">{{ link.name }} </Text>
			</Flex>

			<Flex v-if="link.children" @click.prevent.stop="isExpanded = !isExpanded" :class="[$style.icon, $style.chevron]">
				<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${isExpanded ? '0deg' : '-90deg'})` }" />
			</Flex>

			<Flex v-if="link.external" :class="$style.icon">
				<Icon name="arrow-narrow-up-right-circle" size="14" color="tertiary" />
			</Flex>
		</Flex>
	</NuxtLink>

	<template v-if="isExpanded">
		<Flex direction="column" gap="2">
			<NavLink v-for="l in link.children?.filter((l) => l.show)" :link="l" @onClose="handleClick" />
		</Flex>
	</template>
</template>

<style module>
.link {
	height: 30px;

	cursor: pointer;
	border-radius: 6px;

	padding: 0 4px 0 8px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-5);
	}

	&.active {
		background: var(--op-5);

		& span {
			color: var(--txt-primary);
		}

		& .link_icon:first-of-type {
			fill: var(--brand);
		}
	}

	&.parentActive {
		& span {
			color: var(--txt-primary);
		}

		& .link_icon:first-of-type {
			fill: var(--brand);
		}
	}
}

.icon {
	box-sizing: content-box;

	padding: 4px;

	&.chevron {
		box-sizing: content-box;
		border-radius: 5px;

		padding: 4px;

		transition: all 0.2s ease;

		&:hover {
			background: var(--op-10);

			& svg {
				fill: var(--txt-primary);
			}
		}

		& svg {
			transition: all 0.2s ease;
		}
	}
}
</style>
