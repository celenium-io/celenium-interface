<template>
	<Flex direction="column">
		<Flex direction="column" align="center" :class="$style.wrapper">
			<TheHeader />
			<Feed />

			<slot />
		</Flex>

		<TheFooter />
	</Flex>
</template>

<style module>
.wrapper {
	min-height: calc(100vh - 92px);
}
</style>
