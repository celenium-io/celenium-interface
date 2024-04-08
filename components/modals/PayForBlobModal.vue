<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Button from "@/components/ui/Button.vue"

/** API */
import { fetchEstimatedGas } from "@/services/api/gas"

/** Services */
import { getNamespaceID } from "@/services/utils"
import { sendPayForBlob } from "@/services/keplr"
import { prepareBlob } from "@/services/utils/encode"

/** Store */
import { useAppStore } from "@/store/app"
import { useCacheStore } from "@/store/cache"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const namespace = ref("")
const namespaceError = ref()

const blob = ref()
const fileType = ref()

const warningBannerText = ref("")

const isAwaiting = ref(false)
const isReadyToContinue = computed(() => {
	return namespace.value.length >= 4 && blob.value && appStore.address.length && !namespaceError.value.length
})

watch(
	() => namespace.value,
	() => {
		if ((!/^[0-9a-fA-F]+$/g.test(namespace.value) && namespace.value.length >= 4) || namespace.value.length > 256) {
			namespaceError.value = "Validation error"
			return
		}

		namespaceError.value = ""
	},
)

watch(
	() => props.show,
	async () => {
		if (props.show) {
			if (!appStore.address?.length) {
				warningBannerText.value = "Keplr wallet connection is required to submit a blob."
			} else {
				warningBannerText.value = "You are currently on mocha.celenium.io. The transaction will be performed on the test network."
			}

			if (cacheStore.current.namespace) {
				namespace.value = getNamespaceID(cacheStore.current.namespace.namespace_id)
			}
		} else {
			namespace.value = ""
			blob.value = null
		}
	},
)

const handleDrop = (e) => {
	const file = e.dataTransfer.files[0]

	if (file.size > 100_000) {
		notificationsStore.create({
			notification: {
				type: "error",
				icon: "close",
				title: "Max 100kb",
				autoDestroy: true,
			},
		})
		return
	}

	if (!["text/plain", "image/png", "image/jpeg"].includes(file.type)) {
		notificationsStore.create({
			notification: {
				type: "error",
				icon: "close",
				title: "Use only text or images",
				autoDestroy: true,
			},
		})
		return
	}

	const reader = new FileReader()
	reader.onloadend = function (e) {
		const bytes = new Uint8Array(e.target.result)
		blob.value = bytes
		fileType.value = file.type
	}
	reader.readAsArrayBuffer(file)
}

const handleContinue = async () => {
	let [data, decodableBlob, length] = prepareBlob(
		appStore.address,
		namespace.value,
		[...blob.value].map((x) => x.toString(16).padStart(2, "0")).join(""),
	)

	let estimatedGas = await fetchEstimatedGas(length)
	let gasPrice = appStore.gas.slow

	let fee = gasPrice * estimatedGas > 1 ? Math.trunc(gasPrice * estimatedGas) : 10000

	const proto = [
		{
			typeUrl: "/celestia.blob.v1.MsgPayForBlobs",
			value: data,
		},
	]
	const stdFee = {
		amount: [
			{
				denom: "utia",
				amount: fee,
			},
		],
		gas: estimatedGas,
	}

	try {
		isAwaiting.value = true
		await sendPayForBlob(appStore.address, proto, stdFee, decodableBlob)
		isAwaiting.value = false

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check-circle",
				title: `Successfuly submited`,
				autoDestroy: true,
			},
		})

		emit("onClose")
	} catch (e) {
		isAwaiting.value = false

		if (e.message.startsWith("Request rejected")) {
			notificationsStore.create({
				notification: {
					type: "warning",
					icon: "danger",
					title: `The request in Kepler was denied`,
					autoDestroy: true,
				},
			})
			return
		}

		if (e.message.startsWith("out of gas")) {
			notificationsStore.create({
				notification: {
					type: "warning",
					icon: "danger",
					title: `Not enough gas`,
					description: `Try using estimated gas or manually enter custom value`,
					autoDestroy: true,
				},
			})
			return
		}

		notificationsStore.create({
			notification: {
				type: "warning",
				icon: "danger",
				title: `Something went wrong`,
				description: e.message,
				autoDestroy: true,
			},
		})
	}
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Submit data blob</Text>

			<Flex direction="column" gap="24">
				<Flex align="center" gap="12" :class="$style.wallet">
					<Icon name="address" size="16" color="secondary" />

					<Flex direction="column" gap="6" :class="$style.metadata">
						<Text size="14" weight="600" color="primary">
							{{ appStore.balance }} TIA
							<Text size="13" weight="500" color="secondary">
								${{ (appStore.balance * parseFloat(appStore.currentPrice.close)).toFixed(2) }}
							</Text>
						</Text>

						<Text size="12" weight="500" color="tertiary" :selectable="true"> {{ appStore.address }} </Text>
					</Flex>

					<Flex direction="column" justify="between" :class="$style.bg">
						<Flex v-for="i in 8" align="center" justify="between">
							<div
								v-for="j in 50"
								:class="$style.circle"
								:style="{
									'--start': `${(Math.random() * 10) / 100}`,
									'--end': `${(Math.random() * (90 - 10)) / 100}`,
									'--delay': `${Math.random() * 2}s`,
								}"
							/>
						</Flex>
					</Flex>
				</Flex>

				<Input v-model="namespace" label="Namespace" placeholder="">
					<template #rightText>
						<Flex v-if="namespaceError.length" align="center" gap="4">
							<Icon name="danger" size="12" color="yellow" />
							<Text size="12" weight="600" color="yellow">{{ namespaceError }}</Text>
						</Flex>
						<Text v-else />
					</template>
				</Input>

				<Flex direction="column" gap="8">
					<Text size="12" weight="600" color="secondary">File</Text>

					<Flex
						v-if="!blob"
						id="drop_zone"
						@drop.prevent="handleDrop"
						@dragenter.prevent
						@dragover.prevent
						direction="column"
						align="center"
						justify="center"
						gap="20"
						:class="$style.drop_zone"
					>
						<Icon name="upload" size="20" color="tertiary" />

						<Flex direction="column" gap="8">
							<Text size="13" weight="500" color="tertiary" align="center"> Drag and drop the file you want to submit </Text>
							<Text size="13" weight="500" color="support" align="center"> PNG, JPEG or TXT, max size 100kb </Text>
						</Flex>
					</Flex>
					<Flex v-else align="center" justify="between" :class="$style.file">
						<Flex align="center" gap="12">
							<Icon name="tx" size="16" color="primary" />
							<Flex direction="column" gap="6">
								<Text size="13" weight="600" color="primary">File to submit</Text>
								<Text size="12" weight="500" color="tertiary">{{ fileType }}</Text>
							</Flex>
						</Flex>

						<Button @click="blob = null" type="secondary" size="mini">Remove</Button>
					</Flex>
				</Flex>
			</Flex>

			<Flex align="center" gap="12" :class="$style.warning_banner">
				<Icon name="danger" size="16" color="yellow" />
				<Text size="13" height="140" weight="500" color="tertiary" style="max-width: 350px">
					{{ warningBannerText }}
				</Text>
			</Flex>

			<Button @click="handleContinue" type="secondary" size="small" wide :disabled="!isReadyToContinue || isAwaiting">
				{{ isAwaiting ? "Awaiting..." : "Continue" }}
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.wallet {
	position: relative;

	border-radius: 12px;
	background: rgba(0, 0, 0, 15%);

	padding: 16px;

	.metadata {
		z-index: 1;
	}

	& svg {
		z-index: 1;
		box-sizing: content-box;

		background: var(--card-background);
		border-radius: 10px;

		padding: 12px;
	}
}

.bg {
	position: absolute;

	top: 8px;
	bottom: 8px;
	left: 8px;
	right: 8px;

	& .circle {
		width: 2px;
		height: 2px;

		border-radius: 50%;
		background: var(--green);
		opacity: 0;

		animation: blink 3s ease infinite;
		animation-delay: var(--delay);
	}
}

@keyframes blink {
	0% {
		opacity: var(--start);
	}

	50% {
		opacity: var(--end);
	}

	100% {
		opacity: var(--start);
	}
}

.divider {
	width: fill-available;
	height: 2px;

	background: var(--op-5);

	margin: 0 -16px;
}

.drop_zone {
	height: 150px;

	border: 2px dashed var(--op-5);
	border-radius: 12px;
	background: rgba(0, 0, 0, 10%);

	padding: 40px;
}

.warning_banner {
	height: 60px;

	background: repeating-linear-gradient(
		45deg,
		rgba(0, 0, 0, 25%),
		rgba(0, 0, 0, 25%) 8px,
		rgba(0, 0, 0, 10%) 8px,
		rgba(0, 0, 0, 10%) 16px
	);
	box-shadow: 0 0 0 1px var(--op-5);

	margin-left: -16px;
	margin-right: -16px;

	padding: 0 16px;
}

.file {
	background: var(--op-5);
	border: 1px solid var(--op-5);
	border-radius: 8px;

	padding: 8px 8px 8px 12px;
}
</style>
