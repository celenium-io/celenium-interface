<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Spinner from "@/components/ui/Spinner.vue"

/** API */
import { fetchHyperlaneMailboxes } from "@/services/api/hyperlane"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const isLoading = ref(true)
const mailboxes = ref([])

const getMailboxes = async () => {
	isLoading.value = true

	const { data } = await useAsyncData(`hyperlane-mailboxes`, () =>
		fetchHyperlaneMailboxes({
			offset: 0,
			limit: 10,
			sort: "desc",
		}),
	)
	mailboxes.value = data.value

	isLoading.value = false
}

await getMailboxes()

const handleOpenMailboxModal = (mailbox) => {
	cacheStore.current.hyperlaneMailbox = mailbox
	modalsStore.open("hyperlaneMailbox")
}
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="message" size="14" color="tertiary" />
			<Text size="13" weight="600" color="primary">Mailboxes</Text>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.transfers_body">
			<div v-if="mailboxes?.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Owner</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Messages</Text></th>
							<th></th>
							<th><Text size="12" weight="600" color="tertiary">Created</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="mailbox in mailboxes" @click="handleOpenMailboxModal(mailbox)">
							<td>
								<Flex align="center">
									<NuxtLink @click.stop :to="`/address/${mailbox.owner.hash}`">
										<Flex align="center" gap="6">
											<Text size="13" weight="600" color="primary" mono>
												{{ mailbox.owner.hash.slice(0, 8) }}
											</Text>
											<Flex align="center" gap="3">
												<div v-for="_ in 3" class="dot" />
											</Flex>
											<Text size="13" weight="600" color="primary" mono>
												{{ mailbox.owner.hash.slice(-4) }}
											</Text>
										</Flex>
									</NuxtLink>
								</Flex>
							</td>
							<td>
								<Flex align="center" gap="6">
									<Icon name="arrow-narrow-up-right-circle" size="14" color="tertiary" />
									<Text size="13" weight="600" color="secondary"> Sent:</Text>
									<Text size="13" weight="600" color="primary">
										{{ mailbox.sent_messages }}
									</Text>
								</Flex>
							</td>
							<td>
								<Flex align="center" gap="6">
									<Icon name="arrow-narrow-up-right-circle" size="14" color="tertiary" style="transform: scale(1, -1)" />
									<Text size="13" weight="600" color="secondary">Received:</Text>
									<Text size="13" weight="600" color="primary">
										{{ mailbox.received_messages }}
									</Text>
								</Flex>
							</td>
							<td>
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary">
										{{ DateTime.fromISO(mailbox.time).toRelative({ style: "short" }) }}
									</Text>
								</Flex>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isLoading" align="center" justify="center" gap="8" wide :class="$style.empty">
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading mailboxes </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> Mailboxes not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.transfers_body {
	flex: 1;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	& table {
		width: 100%;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.05s ease;

				&:hover {
					background: var(--op-5);
				}

				&:active {
					background: var(--op-8);
				}
			}
		}

		& tr th {
			text-align: left;

			padding: 0;
			padding-right: 16px;
			padding-top: 16px;
			padding-bottom: 8px;

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
			}

			&.sortable {
				cursor: pointer;
			}

			&.sortable:hover {
				& span {
					color: var(--txt-secondary);
				}
			}
		}

		& tr td {
			height: 40px;

			padding: 0;
			padding-right: 24px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.empty {
	margin: 32px 0 16px 0;
}

.bottom {
	padding: 0 16px 16px 16px;
}

.table_scroller {
	flex: 1;

	overflow-x: auto;
}
</style>
