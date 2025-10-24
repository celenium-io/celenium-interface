<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"

/** Store */
import { useAuthStore } from "@/store/auth.store.js"

const authStore = useAuthStore()

const login = () => {
	authStore.login()
}

const logout = async () => {
	await authStore.revokeToken()
	authStore.logout()
}

onMounted(() => {
	authStore.initialize()
})
</script>

<template>
	<Dropdown v-if="authStore.isAuthenticated">
		<Button type="secondary" size="mini">
			<Icon name="address" size="14" color="secondary" />
			<span>{{ authStore.user?.username }}</span>
		</Button>

		<template #popup>
			<DropdownItem @click="logout">
				Logout
			</DropdownItem>
		</template>
	</Dropdown>

	<Button v-else @click="login" type="white" size="mini">Login</Button>
</template>
>