<script setup>
/** Components */
import AdvBanner from "@/components/shared/AdvBanner.vue"

/** Services */
import { getNetworkName } from "@/services/utils/general"
</script>

<template>
	<Flex direction="column">
		<Flex justify="center" :class="$style.wrapper">
			<img v-if="getNetworkName() === 'Mammoth'" src="/img/mammoth.jpeg" :class="$style.mammoth_bg" />

			<LeftSidebar :class="$style.sidebar" />

			<Flex direction="column" align="center" :class="$style.content">
				<Feed />
				<AdvBanner orientation="horizontal" />
				<ActionBar />

				<Flex direction="column" align="center" wide :class="$style.container">
					<slot />

					<div :class="$style.bg" />
				</Flex>
			</Flex>
		</Flex>

		<TheFooter />
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;

	min-height: calc(100vh);
}

.mammoth_bg {
	width: 100%;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;

	z-index: -1;

	filter: grayscale(0.3);
	opacity: 0.5;
	-webkit-mask-image: -webkit-gradient(linear, left 0%, left bottom, from(rgba(0, 0, 0, 1)), to(rgba(0, 0, 0, 0)));
}

.content {
	/* max-width: 100%; */
	max-width: 1040px;
	min-width: 1040px;
}

.container {
	position: relative;
}

.bg {
	position: absolute;
	top: 28px;
	left: 40px;
	right: 40px;
	height: 600px;
	z-index: -1;

	background-image: radial-gradient(circle at 2px 2px, var(--op-5) 2px, transparent 0);
	background-size: 48px 48px;
	-webkit-mask-image: -webkit-gradient(linear, left 0%, left bottom, from(rgba(0, 0, 0, 1)), to(rgba(0, 0, 0, 0)));
}

@media (max-width: 1300px) {
	.sidebar {
		display: none;
	}
}

@media (max-width: 1100px) {
	.content {
		max-width: 100%;
		min-width: 100%;
	}
}
</style>
