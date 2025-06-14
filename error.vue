<script setup>
/** Services */
import { fetchHead } from "@/services/api/main"
import amp from "@/services/amp"

/** Components */
import ModalsManager from "@/components/modals/ModalsManager.vue"
import CommandMenu from "@/components/cmd/CommandMenu.vue"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const router = useRouter()
const error = useError()

onMounted(async () => {
	const runtimeConfig = useRuntimeConfig()
	amp.init(runtimeConfig.public.AMP)

	const data = await fetchHead()
	if (data) appStore.lastHead = data
})

const handleBack = () => {
	router.back()
}

const getGithubIssueLink = computed(() => {
	let link = `https://github.com/celenium-io/celenium-interface/issues/new?labels=bug&title=[${error.value.statusCode}] ${
		error.value.statusMessage || error.value.message
	}`

	if (error.value.statusCode === 500) link += `&body=Link: ${error.value.url}. ${error.value.statusMessage}`

	return link
})
</script>

<template>
	<CommandMenu :show="appStore.showCmd" />

	<NuxtLayout>
		<Flex v-if="error" direction="column" align="center" gap="24" wide :class="$style.wrapper">
			<Icon name="search" size="24" color="tertiary" />

			<Flex direction="column" align="center" gap="12">
				<Text v-if="error?.statusCode == 404" size="16" weight="500" color="secondary">
					{{ error?.statusMessage }}
				</Text>
				<Text v-else size="16" weight="500" color="secondary"> Unknown Error </Text>

				<Text
					v-if="error?.statusCode == 404"
					size="13"
					weight="500"
					height="160"
					color="tertiary"
					align="center"
					style="max-width: 340px"
				>
					It looks like this is an error and such a page does not exist. If there used to be a page at this address and it has
					disappeared - please inform us.
				</Text>
				<Text v-else size="13" weight="500" height="140" color="tertiary" style="max-width: 340px"> Something went wrong </Text>
			</Flex>

			<Flex align="center" gap="12">
				<Button v-if="error?.statusCode == 404" @click="handleBack" type="secondary" size="small" style="width: fit-content">
					<Icon name="arrow-back" size="12" color="secondary" />
					Go Back
				</Button>
				<Button v-else link="/" type="secondary" size="small" style="width: fit-content">
					<Icon name="arrow-back" size="12" color="secondary" />
					Back to Explorer
				</Button>

				<Text size="12" weight="500" color="tertiary">or</Text>
				<Button :link="getGithubIssueLink" target="_blank" type="secondary" size="small" style="width: fit-content">
					<Icon name="github" size="12" color="secondary" />
					Create Issue
				</Button>
			</Flex>
		</Flex>

		<div id="tooltip" />
		<div id="modal" />
		<div id="dropdown" />
		<div id="popover" />

		<ModalsManager />
		<Notifications />
	</NuxtLayout>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 0 24px;
	margin-top: 120px;
}
</style>
