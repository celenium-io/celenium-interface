<script setup>
/** Vendor */
import * as d3 from "d3"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"

/** Services */
import { formatBytes, uid } from "@/services/utils"

/** API */
import { fetchNamespaceUsage } from "@/services/api/stats"

const route = useRoute()
const router = useRouter()
const cssModule = useCssModule()

const namespaces = ref([])

const treemap = ref(null)

const top = ref(route.query.top || 5)

const getNamespaceUsage = async () => {
	const data = await fetchNamespaceUsage({ top: top.value })
	namespaces.value = data
}

const drawTreemap = () => {
	const data = {
		name: "Namespaces Treemap",
		children: namespaces.value.map((n) => {
			return { name: n.name, value: n.size, id: n.namespace_id }
		}),
	}

	const maxValue = Math.max(...data.children.map((d) => d.value))

	const width = 1154
	const height = 1154

	const color = d3.scaleOrdinal(
		data.children.map((d) => d.name),
		d3.schemeTableau10,
	)

	const root = d3.treemap().tile(d3.treemapBinary).size([width, height]).padding(1).round(true)(
		d3
			.hierarchy(data)
			.sum((d) => d.value)
			.sort((a, b) => b.value - a.value),
	)

	const svg = d3
		.create("svg")
		.attr("viewBox", [0, 0, width, height])
		.attr("width", width)
		.attr("height", height)
		.attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")

	const leaf = svg
		.selectAll("g")
		.data(root.leaves())
		.join("g")
		.attr("transform", (d) => `translate(${d.x0},${d.y0})`)
		.attr("id", (d) => d.data.id)
		.attr("class", cssModule.gNode)

	leaf.on("click", (e) => {
		const gNode = e.target.closest("g")
		if (gNode.id) router.push(`/namespace/${gNode.id}`)
	})

	const format = d3.format(",d")
	leaf.append("title").text(
		(d) =>
			`${d
				.ancestors()
				.reverse()
				.map((d) => d.data.name)
				.join(".")}\n${format(d.value)}`,
	)

	leaf.append("rect")
		.attr("id", (d) => (d.leafUid = uid("leaf")).id)
		.attr("fill", (d) => {
			while (d.depth > 1) d = d.parent

			return `rgba(51, 168, 83, ${(d.data.value * 100) / maxValue}%)`
		})
		.attr("fill-opacity", 0.5)
		.attr("width", (d) => d.x1 - d.x0)
		.attr("height", (d) => d.y1 - d.y0)
		.attr("class", cssModule.rect)

	leaf.append("clipPath")
		.attr("id", (d) => (d.clipUid = uid("clip")).id)
		.append("use")
		.attr("xlink:href", (d) => d.leafUid.href)

	leaf.append("text")
		.attr("clip-path", (d) => d.clipUid)
		.selectAll("tspan")
		.data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(formatBytes(d.value)))
		.join("tspan")
		.attr("class", (d, i, nodes) => (i === nodes.length - 1 ? cssModule.value : cssModule.name))
		.attr("x", 3)
		.attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 1.2}em`)
		.attr("fill-opacity", (d, i, nodes) => (i === nodes.length - 1 ? 0.7 : null))
		.text((d) => d)

	Object.assign(svg.node(), { scales: { color } })

	treemap.value.children[0]?.remove()
	treemap.value.append(svg.node())
}

onMounted(async () => {
	await getNamespaceUsage()
	drawTreemap()
})

watch(
	() => top.value,
	async () => {
		await getNamespaceUsage()
		drawTreemap()
	},
)

const handleSelectFilter = (target) => {
	top.value = target

	router.replace({ query: { top: target } })
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="start" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/namespaces', name: `Namespaces` },
					{ link: '/namespaces/treemap', name: `Treemap` },
				]"
			/>

			<Button link="/namespaces" type="secondary" size="mini"> <Icon name="table" size="12" color="secondary" /> Table View </Button>
		</Flex>

		<Flex direction="column" gap="12">
			<Dropdown position="end">
				<Button type="secondary" size="mini">Show: Top {{ top }}</Button>

				<template #popup>
					<DropdownItem @click="handleSelectFilter(5)">Top 5</DropdownItem>
					<DropdownItem @click="handleSelectFilter(15)">Top 15</DropdownItem>
					<DropdownItem @click="handleSelectFilter(30)">Top 30</DropdownItem>
				</template>
			</Dropdown>

			<div ref="treemap" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
	min-width: calc(var(--base-width) + 48px);

	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.gNode {
	cursor: pointer;
	stroke-width: 1px;
	stroke-dasharray: 6px;
	stroke-linecap: round;

	&:hover .rect {
		stroke: var(--green);
	}
}

.rect {
	transition: all 0.2s ease;
}

.name {
	font-size: 18px;
	font-weight: 500;
	fill: var(--txt-primary);
}

.value {
	font-size: 16px;
	font-weight: 600;
	fill: var(--txt-secondary);
}
</style>
