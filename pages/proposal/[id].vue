<script setup>
/** Components: Modules */
import ProposalOverview from "@/components/modules/proposal/ProposalOverview.vue"
import ProposalChanges from "@/components/modules/proposal/ProposalChanges.vue"
import ProposalDescription from "@/components/modules/proposal/ProposalDescription.vue"

/** API */
import { fetchProposalById } from "@/services/api/proposal"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()

const proposal = ref()
const { data: rawProposal } = await fetchProposalById({ id: route.params.id })

if (!rawProposal.value) {
	navigateTo({
		path: "/",
		query: {
			error: "not_found",
			target: "proposal",
			id: route.params.id,
		},
	})
} else {
	proposal.value = rawProposal.value
	cacheStore.current.proposal = proposal.value
}

defineOgImageComponent("ProposalImage", {
	title: "Proposal",
	proposal: proposal.value,
	cacheKey: `${proposal.value?.id}`,
})

useHead({
	title: `${proposal.value.title} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: proposal.value.description,
		},
		{
			property: "og:title",
			content: `${proposal.value.title} - Celenium`,
		},
		{
			property: "og:description",
			content: proposal.value.description,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `${proposal.value.title} - Celenium`,
		},
		{
			name: "twitter:description",
			content: proposal.value.description,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="proposal"
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/proposals', name: 'Proposals' },
				{ link: route.fullPath, name: `Proposal #${proposal.id}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="proposal" direction="column" gap="40">
			<ProposalOverview :proposal />
			<ProposalChanges :proposal />
			<ProposalDescription :proposal />
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

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
