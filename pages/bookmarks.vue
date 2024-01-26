<script setup>
/** Components */
import BookmarkItem from "@/components/modules/bookmarks/BookmarkItem.vue"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks"
const bookmarksStore = useBookmarksStore()

useHead({
	title: `My Bookmarks - Celenium`,
})

const handleRemove = (type, bookmark) => {
	const bookmarkIdx = bookmarksStore.bookmarks[type].findIndex((b) => b.id === bookmark.id)

	if (bookmarkIdx >= 0) {
		bookmarksStore.bookmarks[type].splice(bookmarkIdx, 1)
	}
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/bookmarks', name: `My Bookmarks` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="bookmark-check" size="16" color="secondary" />
					<Text size="13" weight="600" color="primary">My Bookmarks</Text>
				</Flex>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.content">
				<Text size="13" weight="600" color="primary">Namespaces</Text>

				<Flex v-if="bookmarksStore.bookmarks.namespaces.length" direction="column" gap="4">
					<BookmarkItem
						v-for="bookmark in bookmarksStore.bookmarks.namespaces"
						:item="bookmark"
						@onRemove="handleRemove('namespaces', bookmark)"
					/>
				</Flex>
				<Text v-else size="12" weight="500" color="tertiary"> There is no bookmarks for namespaces </Text>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.content">
				<Text size="13" weight="600" color="primary">Addresses</Text>

				<Flex v-if="bookmarksStore.bookmarks.addresses.length" direction="column" gap="4">
					<BookmarkItem
						v-for="bookmark in bookmarksStore.bookmarks.addresses"
						:item="bookmark"
						@onRemove="handleRemove('addresses', bookmark)"
					/>
				</Flex>
				<Text v-else size="12" weight="500" color="tertiary"> There is no bookmarks for addresses </Text>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.content">
				<Text size="13" weight="600" color="primary">Transactions</Text>

				<Flex v-if="bookmarksStore.bookmarks.txs.length" direction="column" gap="4">
					<BookmarkItem
						v-for="bookmark in bookmarksStore.bookmarks.txs"
						:item="bookmark"
						@onRemove="handleRemove('txs', bookmark)"
					/>
				</Flex>
				<Text v-else size="12" weight="500" color="tertiary"> There is no bookmarks for transactions </Text>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.content">
				<Text size="13" weight="600" color="primary">Blocks</Text>

				<Flex v-if="bookmarksStore.bookmarks.blocks.length" direction="column" gap="4">
					<BookmarkItem
						v-for="bookmark in bookmarksStore.bookmarks.blocks"
						:item="bookmark"
						@onRemove="handleRemove('blocks', bookmark)"
					/>
				</Flex>
				<Text v-else size="12" weight="500" color="tertiary"> There is no bookmarks for blocks </Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.content {
	background: var(--card-background);
	border-radius: 4px;

	padding: 12px;

	&:last-of-type {
		border-radius: 4px 4px 8px 8px;
	}
}
</style>
