<script setup>
/** Components */
import LatestTransfersTable from "~/components/modules/hyperlane/LatestTransfersTable.vue"
import MailboxesTable from "~/components/modules/hyperlane/MailboxesTable.vue"
import TokensTable from "~/components/modules/hyperlane/TokensTable.vue"

useHead({
	title: `Celestia Hyperlane - Celenium`,
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/hyperlane",
		},
	],
	meta: [
		{
			name: "description",
			content: "Explore Celestia Hyperlane transfers, mailboxes, and tokens.",
		},
		{
			property: "og:title",
			content: "Celestia Hyperlane - Celenium",
		},
		{
			property: "og:description",
			content: "Explore Celestia Hyperlane transfers, mailboxes, and tokens.",
		},
		{
			property: "og:url",
			content: "https://celenium.io/hyperlane",
		},
		{
			property: "og:image",
			content: "/img/seo/hyperlane.png",
		},
		{
			name: "twitter:title",
			content: "Celestia Hyperlane - Celenium",
		},
		{
			name: "twitter:description",
			content: "Explore Celestia Hyperlane transfers, mailboxes, and tokens.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/hyperlane.png",
		},
	],
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/hyperlane', name: `Interop Hyperlane` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex direction="column" gap="24">
			<LatestTransfersTable />

			<div :class="$style.tables">
				<TokensTable />
				<MailboxesTable />
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.tables {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(486px, 1fr));
	gap: 20px;

	max-width: 100%;
}

@media (max-width: 1024px) {
	.tables {
		grid-template-columns: 100%;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
