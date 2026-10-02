<template>
	<Flex direction="column">
		<Flex justify="center" :class="$style.wrapper">
			<LeftSidebar :class="$style.sidebar" />

			<Flex direction="column" align="center" :class="$style.content">
				<Feed />
				<ActionBar />

				<Flex direction="column" align="center" wide :class="$style.container">
					<slot />
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

.content {
	max-width: 1040px;
	min-width: 1040px;
}

.container {
	position: relative;
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
