<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"

/** Services */
import { capitilize } from "~/services/utils"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks"
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
const bookmarksStore = useBookmarksStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
	type: {
		type: String,
		required: true,
	},
	id: {
		type: [String, Number],
		required: true,
	},
})

const router = useRouter()

const bookmark = ref(null)
const isBookmarked = ref(false)
const isButtonHovered = ref(false)
const bookmarkText = computed(() => {
	if (isButtonHovered.value && isBookmarked.value) return "Remove"

	return isBookmarked.value ? "Saved" : "Save"
})

const handleBookmark = () => {
	if (!isBookmarked.value) {
		const newBookmark = {
			id: props.id,
			type: capitilize(props.type),
			ts: new Date().getTime(),
		}

		isBookmarked.value = bookmarksStore.addBookmark(newBookmark)

		if (isBookmarked.value) {
			notificationsStore.create({
				notification: {
					type: "success",
					icon: "check",
					title: `${capitilize(props.type)} added to bookmarks`,
					description: "View all bookmarks on dedicated page",
					autoDestroy: true,
					actions: [
						{
							name: "Open Bookmarks",
							callback: () => {
								router.push("/bookmarks")
							},
						},
					],
				},
			})

			cacheStore.current.bookmark = newBookmark
			modalsStore.open("edit_alias")
		}
	} else {
		let notification = {}

		if (bookmarksStore.removeBookmark(props.type, props.id)) {
			notification = {
				type: "success",
				icon: "check",
				title: `${capitilize(props.type)} removed from bookmarks`,
				autoDestroy: true,
			}

			isBookmarked.value = false
		} else {
			notification = {
				type: "error",
				icon: "close",
				title: "Failed to remove the bookmark",
				autoDestroy: true,
			}
		}

		notificationsStore.create({
			notification: notification,
		})
	}
}

onMounted(() => {
	isBookmarked.value = !!bookmarksStore.getBookmark(props.type, props.id)
})
</script>

<template>
	<Flex align="center" gap="8">
		<Button
			@click="handleBookmark"
			@mouseenter="isButtonHovered = true"
			@mouseleave="isButtonHovered = false"
			type="secondary"
			size="mini"
		>
			<Icon
				:name="isButtonHovered && isBookmarked ? 'close' : isBookmarked ? 'bookmark-check' : 'bookmark-plus'"
				size="12"
				:color="isBookmarked && !isButtonHovered ? 'green' : 'primary'"
			/>
			{{ bookmarkText }}
		</Button>
	</Flex>
</template>

<style module>
.items {
	overflow: hidden;
}

.item {
	& a {
		display: flex;

		&:hover {
			& span {
				color: var(--txt-primary);
			}
		}
	}
}
</style>
