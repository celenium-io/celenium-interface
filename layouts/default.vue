<template>
	<Flex direction="column">
		<Flex direction="column" align="center" :class="$style.wrapper">
			<TheHeader />
			<Feed />

			<Flex direction="column" align="center" wide :class="$style.container">
				<slot />

				<div :class="$style.bg" />
			</Flex>
		</Flex>

		<TheFooter />
	</Flex>
</template>

<style module>
.wrapper {
	min-height: calc(100vh - 92px);
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
</style>
