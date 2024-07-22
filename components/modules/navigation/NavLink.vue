<script setup>
import NavLink from "./NavLink.vue"

const route = useRoute()

const props = defineProps({
	link: Object,
})

const isExpanded = ref(false)

const handleClick = () => {
	if (props.link.callback) props.link.callback()
}
</script>

<template>
	<NuxtLink @click="handleClick" :to="link.path" :target="link.external && '_blank'">
		<Flex align="center" gap="8" justify="between" :class="[$style.link, route.path === link.path && $style.active]">
			<Flex align="center" gap="8">
				<Icon :name="link.icon" size="14" color="secondary" :class="$style.link_icon" />
				<Text size="13" weight="600" color="secondary">{{ link.name }}</Text>
				<Icon v-if="link.external" name="arrow-narrow-up-right" size="14" color="tertiary" />
			</Flex>

			<Flex @click.prevent="isExpanded = !isExpanded" :class="$style.chevron_icon">
				<Icon
					v-if="link.children"
					name="chevron"
					size="14"
					color="secondary"
					:style="{ transform: `rotate(${isExpanded ? '0deg' : '-90deg'})` }"
				/>
			</Flex>
		</Flex>
	</NuxtLink>

	<template v-if="isExpanded">
		<Flex direction="column" gap="2">
			<NavLink v-for="l in link.children" :link="l" />
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
		& span {
			color: var(--brand);
		}

		& .link_icon:first-of-type {
			fill: var(--brand);
		}
	}
}

.chevron_icon {
	box-sizing: content-box;
	border-radius: 5px;

	padding: 4px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-10);
	}

	& svg {
		transition: all 0.2s ease;
	}
}
</style>
