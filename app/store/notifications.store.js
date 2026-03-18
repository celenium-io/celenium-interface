/**
 * Vendor
 */
import { ref } from "vue"
import { defineStore } from "pinia"

export const useNotificationsStore = defineStore("notifications", () => {
	const items = ref([])

	const create = ({ notification }) => {
		const id = crypto.randomUUID()

		if (items.value.length > 3) {
			items.value.pop()
		}

		if (notification.autoDestroy) {
			setTimeout(
				() => {
					remove({ id })
				},
				notification.delay ? notification.delay : 4_500,
			)
		}

		items.value.unshift({ ...notification, id })
	}

	const remove = ({ id }) => {
		items.value = items.value.filter((notification) => notification.id !== id)
	}

	return { items, create, remove }
})
