<script setup>
/** Vendor */
import { generate } from "lean-qr"

/** API */
import { fetchBlockODS } from "@/services/api/block"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import amp from "@/services/amp"
import { capitalizeAndReplaceUnderscore, comma, getNamespaceIDFromBase64, shortHex } from "@/services/utils";

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const isLoading = ref(false)

const svgEl = ref()
const blockODS = ref()
const cellSize = computed(() => {
	switch (blockODS.value.width) {
		case 2:
			return 40
		case 4:
			return 40
		case 8:
			return 40
		case 16:
			return 20
		case 32:
			return 20
		case 64:
			return 10
		case 128:
			return 5
		default:
			return 4
	}
})
const svgWidth = computed(() => blockODS.value?.width ? cellSize.value * blockODS.value?.width : 0)
const modalWidth = computed(() => svgWidth.value ? svgWidth.value + 250 : 350)

function generateCells(item, width) {
    const cells = []

    for (let y = item.from[0]; y <= item.to[0]; y++) {
        if (y === item.from[0] && y === item.to[0]) {
            for (let x = item.from[1]; x <= item.to[1]; x++) {
                cells.push({ x, y })
            }
        } else if (y === item.from[0] && y !== item.to[0]) {
            for (let x = item.from[1]; x <= width - 1; x++) {
                cells.push({ x, y })
            }
        } else if (y !== item.to[0]) {
            for (let x = 0; x <= width - 1; x++) {
                cells.push({ x, y })
            }
        } else {
            for (let x = 0; x <= item.to[1]; x++) {
                cells.push({ x, y })
            }
        }
    }

    return cells;
}

function getColor(item) {
	switch (item.type) {
		case 'pay_for_blob':
			return 'var(--blue)'
		case 'tx':
			return 'var(--neutral-green)'
		case 'parity_shares':
			return 'var(--purple)'
		case 'primary_reserved_padding':
			return 'var(--light-orange)'
		case 'tail_padding':
			return 'var(--txt-secondary)'
		case 'namespace':
			let hash = 0
			let str = item.namespace
			for (let i = 0; i < str.length; i++) {
				hash = str.charCodeAt(i) + ((hash << 5) - hash)
			}

			let color = '#'
			for (let i = 0; i < 3; i++) {
				const value = (hash >> (i * 8)) & 0xFF
				color += ('00' + value.toString(16)).slice(-2)
			}

			return color;
	}
}

const data = computed(() => {
	if (blockODS.value.items) {
		blockODS.value.items.forEach(item => {
			item.cells = generateCells(item, blockODS.value.width)
			item.color = getColor(item)
		})

		return blockODS.value
	}
})

const drawSVG = () => {
	const svgNS = "http://www.w3.org/2000/svg"
	const svg = document.createElementNS(svgNS, "svg")
	svg.setAttribute("width", svgWidth.value)
	svg.setAttribute("height", svgWidth.value)

	data.value.items.forEach((item, index) => {
		const group = document.createElementNS(svgNS, "g")
		group.setAttribute("class", "ods_group")
		group.setAttribute("data-index", index)
		if (item.type === 'namespace') {
			group.setAttribute("cursor", "pointer")
		}
		item.cells.forEach(cell => {
			const rect = document.createElementNS(svgNS, "rect")
			rect.setAttribute("x", cell.x * cellSize.value)
			rect.setAttribute("y", cell.y * cellSize.value)
			rect.setAttribute("width", cellSize.value)
			rect.setAttribute("height", cellSize.value)
			rect.setAttribute("fill", item.color)
			rect.setAttribute("stroke", "black")
			rect.setAttribute("stroke-width", 0.2)
			group.appendChild(rect)
		})

		group.addEventListener('click', () => handleGroupClick(item))
		group.addEventListener('mouseover', () => highlight(index))
		group.addEventListener('mouseout', () => unhighlight(index))

		svg.appendChild(group)
	});


	svgEl.value.wrapper.appendChild(svg)

	isLoading.value = false
}

function highlight(index) {
	const elements = document.querySelectorAll(`.ods_group[data-index="${index}"]`)
	elements.forEach(el => {
		// if (el.tagName === "g") {
			// el.style["boxShadow"] = "inset 0 0 0 5px var(--op-5)"
			// el.setAttribute("stroke", "black")
			// el.setAttribute("stroke-width", 2)

			// el.style["stroke"] = "black"
			// el.style["stroke-width"] = "2"
			// el.style.transform = "scale(1.05)"
		// }
		// el.style["boxShadow"] = "inset 0 0 0 5px var(--op-5)"
		el.style.filter = "brightness(1.2)"
	})
	dimOthers(index)
}

function unhighlight(index) {
	const elements = document.querySelectorAll(`.ods_group[data-index="${index}"]`)
	elements.forEach(el => {
		el.style.filter = ""
	})
	restoreOthers()
}

function dimOthers(index) {
	const elements = document.querySelectorAll('.ods_group')
	elements.forEach(el => {
		if (el.getAttribute('data-index') !== index.toString()) {
			el.style.filter = "brightness(0.5)"
		}
	})
}

function restoreOthers() {
	const elements = document.querySelectorAll('.ods_group')
	elements.forEach(el => {
		el.style.filter = ""
	})
}

function handleGroupClick(item) {
	if (item.type === 'namespace') {
		window.open(`/namespace/${getNamespaceIDFromBase64(item.namespace)}`, '_blank')
	}
}

function getNamespaceName(item) {
	switch (item.type) {
		case 'namespace':
			const { $getDisplayName } = useNuxtApp()

			return $getDisplayName('namespaces', getNamespaceIDFromBase64(item.namespace))
		default:
			return shortHex(item.namespace)
	}
}

watch(
	() => props.show,
	async () => {
		if (props.show) {
			amp.log("showODSModal")
			blockODS.value = {}
			nextTick(async () => {
				isLoading.value = true
				blockODS.value = await fetchBlockODS(cacheStore.current.block.height)
				drawSVG()
			})
		}
	},
)
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" :width="modalWidth" disable-trap>
		<Flex direction="column" gap="24">
			<Flex align="center" gap="6" :class="$style.legend_header">
				<Icon name="ods" size="14" color="secondary" />
				<Text size="14" weight="600" color="primary">Original Data Square</Text>
				<Text size="14" weight="600" color="primary">{{ comma(cacheStore.current.block.height) }}</Text>
				<CopyButton :text="cacheStore.current.block.height" size="12" />
			</Flex>

			<Flex v-if="isLoading" align="center" justify="center" gap="8" wide :style="{ paddingTop: '16px' }">
				<Spinner size="14" />

				<Text size="13" weight="500" color="secondary"> Loading ODS </Text>
			</Flex>

			<Flex align="start" justify="between" wide>
				<Flex align="start" direction="column" gap="12">
					<Flex v-for="(item, index) in data?.items"
						@click="handleGroupClick(item)"
						@mouseover="highlight(index)"
						@mouseout="unhighlight(index)"
						:data-index="index"
						class="ods_group"
						:class="item.type === 'namespace' && $style.link"
						gap="4"
					>
						<div :class="$style.legend_dot" :style="{ background: item.color }" />

						<Flex align="start" justify="start" direction="column" gap="4" wide>
							<Text size="12" weight="600" color="primary">{{ getNamespaceName(item) }}</Text>

							<Text size="11" weight="500" color="tertiary">{{ capitalizeAndReplaceUnderscore(item.type) }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex ref="svgEl" />
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.legend_header {
	width: 100%;
}

.horizontal_divider {
	width: 100%;
	height: 2px;
	background: var(--op-5);
}

.legend {
	width: 250px;
	
	cursor: pointer;
}

.legend_dot {
	width: 10px;
	height: 10px;

	border-radius: 2px;
}

.link {
	cursor: pointer;
}

.badge {
	border-radius: 8px 8px 0 0;
	background: var(--op-5);

	padding: 12px;
}

.content {
	min-width: 0;

	& span:first-child {
		min-width: 0;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}

.qrcode {
	filter: invert(1);
	image-rendering: pixelated;

	user-select: none;
	-webkit-user-drag: none;
	box-shadow: inset 0 0 0 4px rgba(0, 0, 0, 5%);
	border-radius: 0 0 12px 12px;
}
</style>
