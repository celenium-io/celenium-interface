<script setup>
/** Store */
import { useAuthStore } from "@/store/auth.store.js"

const authStore = useAuthStore()

const router = useRouter()

onMounted(async () => {
	const urlParams = new URLSearchParams(window.location.search)
	const code = urlParams.get("code")

	if (code) {
		await authStore.getTokenByCode(code)
	}

	router.push("/")
})
</script>