<script setup>
/** Vendor */
import * as d3 from "d3"

/** Constants */
import { IbcChainLogo } from "@/services/constants/ibc"

/** Components */
import GraphSidebar from "./GraphSidebar.vue"

const props = defineProps({
	chains: {
		type: Array,
		default: [],
	},
})

const classes = useCssModule()

const canvasEl = useTemplateRef("canvasEl")

const data = {
	name: "Celestia",
	image: "/img/chains/celestia.png",
	known: true,
	children: [],
}

let svg
let simulation = null

const isDrawn = ref(false)

const drag = (simulation) => {
	function dragstarted(event, d) {
		if (!event.active) simulation.alphaTarget(1).restart()
		d.fx = d.x
		d.fy = d.y
	}

	function dragged(event, d) {
		d.fx = event.x
		d.fy = event.y
	}

	function dragended(event, d) {
		if (!event.active) simulation.alphaTarget(0)
		d.fx = null
		d.fy = null
	}

	return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
}

const linkArc = (d) => {
	const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y)
	return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `
}

const KNOWN_LOGO_SIZE = 40
const UNKNOWN_LOGO_SIZE = 24

const prepareData = () => {
	props.chains.forEach((chain) => {
		data.children.push({
			name: chain.chain,
			value: chain.flow,
			image: IbcChainLogo[chain.chain] ?? IbcChainLogo["_unknown"],
			known: !!IbcChainLogo[chain.chain],
			raw: chain,
		})
	})
}

const updateSvgSizes = () => {
	const { width, height } = canvasEl.value.getBoundingClientRect()
	svg.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [-width / 2, -height / 2, width, height])
}

const draw = () => {
	const { $d3Force } = useNuxtApp()

	const { width, height } = canvasEl.value.getBoundingClientRect()

	const root = d3.hierarchy(data)
	const links = root.links()
	const nodes = root.descendants()

	simulation = $d3Force
		.forceSimulation(nodes)
		.force(
			"link",
			d3
				.forceLink(links)
				.id((d) => d.id)
				.distance(70)
				.strength(0.8),
		)
		.force("charge", d3.forceManyBody().strength(-900))
		.force("x", d3.forceX())
		.force("y", d3.forceY())

	svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [-width / 2, -height / 2, width, height])
		.attr("style", "max-width: 100%; height: 100%;")

	const link = svg.append("g").selectAll("path").data(links).join("path").classed(classes.link, true)

	const node = svg
		.append("g")
		.selectAll("image")
		.data(nodes)
		.join("image")
		.attr("href", (d) => d.data.image)
		.classed(classes.node, true)
		.classed(classes.unknown, (d) => !d.data.known)
		.call(drag(simulation))
		.on("click", async (_, n) => {
			if (!n.index) return

			selectedChain.value = n.data
			await nextTick()
			updateSvgSizes()
		})

	simulation.on("tick", () => {
		link.attr("d", linkArc)
			.attr("x1", (d) => d.source.x)
			.attr("y1", (d) => d.source.y)
			.attr("x2", (d) => d.target.x)
			.attr("y2", (d) => d.target.y)

		node.attr("x", (d) => d.x - (d.data.known ? KNOWN_LOGO_SIZE : UNKNOWN_LOGO_SIZE) / 2).attr(
			"y",
			(d) => d.y - (d.data.known ? UNKNOWN_LOGO_SIZE : UNKNOWN_LOGO_SIZE) / 2,
		)
	})

	canvasEl.value.append(svg.node())

	isDrawn.value = true
}

const selectedChain = ref()
const handleCloseSidebar = async () => {
	selectedChain.value = null
	await nextTick()
	updateSvgSizes()
}

onMounted(() => {
	if (!isDrawn.value && props.chains.length) {
		prepareData()
		draw()
	}
})

watch(
	() => props.chains,
	() => {
		if (!props.chains.length) return
		if (!isDrawn.value) {
			prepareData()
			draw()
		}
	},
)

onBeforeUnmount(() => {
	simulation.stop()
})
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="globe" size="14" color="tertiary" />
			<Text size="13" weight="600" color="primary">Celestia IBC Visualization</Text>
		</Flex>

		<Flex direction="column">
			<Flex :class="$style.body">
				<div ref="canvasEl" :class="$style.canvas" />

				<GraphSidebar v-if="selectedChain" :chain="selectedChain" @onClose="handleCloseSidebar" />
			</Flex>

			<Flex align="center" justify="between" :class="$style.bottom">
				<Flex align="center" gap="6">
					<Icon name="info" size="12" color="tertiary" />
					<Text size="12" weight="600" color="tertiary">
						Live updates currently is not supported. Refresh the page to update the data.
					</Text>
				</Flex>
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

.body {
	position: relative;
	flex: 1;
	min-height: 500px;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);
	background-image: radial-gradient(rgba(255, 255, 255, 8%) 2px, transparent 0);
	background-size: 44px 44px;
	background-position: 12px 12px;

	& svg {
		display: flex;
	}
}

.canvas {
	width: 100%;
	height: 100%;
}

.bottom {
	background: var(--card-background);
	border-radius: 0 0 8px 8px;
	opacity: 0.5;

	padding: 16px 12px 12px 12px;
	margin-top: -4px;
}

.node {
	width: 40px;
	height: 40px;

	cursor: pointer;

	filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));

	transition: filter 0.2s ease;

	&.unknown {
		width: 32px;
		height: 32px;
	}

	&:hover {
		filter: drop-shadow(0 0 4px var(--brand));
	}
}

.link {
	stroke: var(--op-5);
	stroke-width: 2px;
	fill: none;
}
</style>
