<script setup>
/** Services */
import { getAdvByName, getRandomAdv } from "@/services/constants/advertising"

/** Store */
import { useModalsStore } from "@/store/modals"
const modalsStore = useModalsStore()

const props = defineProps({
	advName: {
		type: String,
		required: false,
	},
	orientation: {
		type: String,
		default: "vertical",
	},
})

const router = useRouter()

const adv = ref({})
const isDisplayed = ref(true)

const handleClick = () => {
	if (adv.value.internalLink) {
		router.push(adv.value.internalLink)
	} else if (adv.value.link) {
		window.open(adv.value.link, "_blank")
	} else if (adv.value.modal) {
		modalsStore.open(adv.value.modal)
	}
}

onMounted(() => {
	if (props.advName) {
		adv.value = getAdvByName(props.advName)
	} else {
		adv.value = getRandomAdv()
	}
})
</script>

<template>
	<Flex
		v-if="adv.name"
		@click="handleClick()"
		:class="[$style.wrapper, orientation === 'horizontal' && $style.wrapper_horizontal, !isDisplayed && $style.not_display]"
	>
		<Flex v-if="orientation === 'vertical'" direction="column" gap="12" :class="$style.ad_vertical">
			<Flex direction="column" gap="8">
				<Flex align="center" gap="6">
					<Icon v-if="adv.icon" :name="adv.icon" size="14" color="brand" />
					<Text size="13" weight="600" color="primary"> {{ adv.header }} </Text>
				</Flex>

				<Text size="13" weight="600" color="tertiary" height="140"> {{ adv.body }} </Text>
			</Flex>

			<Flex align="center" justify="between">
				<Text size="13" weight="600" color="brand" :class="$style.footer"> {{ adv.footer }} </Text>

				<Icon @click.prevent.stop="isDisplayed = false" name="close" size="16" color="secondary" :class="$style.close_icon" />
			</Flex>
		</Flex>

		<Flex v-else-if="orientation === 'horizontal'" align="center" gap="12" wide :class="$style.ad_horizontal">
			<Flex align="center" gap="8">
				<Icon v-if="adv.icon" :name="adv.icon" size="14" color="brand" />

				<Text size="13" weight="600" color="primary" :class="$style.text"> {{ adv.header }} </Text>
			</Flex>

			<Text size="13" weight="600" color="tertiary" height="140" :class="$style.text"> {{ adv.body }} </Text>

			<Flex align="center" gap="8" :class="$style.footer">
				<Text size="13" weight="600" color="brand" :class="$style.text"> {{ adv.footer }} </Text>

				<Icon @click.prevent.stop="isDisplayed = false" name="close" size="16" color="secondary" :class="$style.close_icon" />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;

	cursor: pointer;
}

.wrapper_horizontal {
	width: 100%;
	padding: 8px 24px 0px 24px;
}

.not_display {
	display: none;
}

.ad_vertical {
	position: relative;

	border-radius: 12px;
	box-shadow: inset 0 0 0 2px var(--op-10);

	padding: 16px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-3);

		.close_icon {
			display: block;
		}
	}

	& .footer {
		padding: 2px;
	}
	& .close_icon {
		display: none;
		padding: 2px;

		border-radius: 12px;

		transition: all 0.2s ease;

		&:hover {
			background: var(--op-10);
			transform: scale(1.1);
		}
	}
}

.ad_horizontal {
	position: relative;
	width: 100%;

	border-radius: 12px;
	box-shadow: inset 0 0 0 2px var(--op-10);

	padding: 8px 16px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-3);

		.close_icon {
			display: block;
		}
	}

	& .close_icon {
		display: none;
		padding: 2px;

		border-radius: 12px;

		transition: all 0.2s ease;

		&:hover {
			background: var(--op-10);
			transform: scale(1.1);
		}
	}

	& .text {
		line-height: 1.5;
	}

	& .footer {
		margin-left: auto;
	}
}

@media (max-width: 500px) {
	.wrapper_horizontal {
		padding: 12px;
	}

	.ad_horizontal {
		flex-direction: column;
		gap: 4px;

		& .footer {
			margin-left: 0%;
		}
	}
}
</style>
