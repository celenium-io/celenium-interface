<script setup>
/** Vendor */
import * as d3 from "d3"

/** Services */
import { formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaces } from "@/services/api/namespace"

const cssModule = useCssModule()

const namespaces = ref([])

const treemap = ref(null)

const { data } = await fetchNamespaces({
	limit: 20,
	offset: 0,
	sort: "desc",
})
namespaces.value = data.value

onMounted(() => {
	const data = {
		name: "Namespaces Treemap",
		children: namespaces.value.map((n) => {
			return { name: getNamespaceID(n.namespace_id), value: n.size }
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
		.attr("fill", (d) => {
			while (d.depth > 1) d = d.parent

			// return color(d.data.name)
			return `rgba(255, 255, 255, ${(d.data.value * 100) / maxValue}%)`
		})
		.attr("fill-opacity", 0.5)
		.attr("width", (d) => d.x1 - d.x0)
		.attr("height", (d) => d.y1 - d.y0)

	leaf.append("clipPath").append("use")

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

	treemap.value.append(svg.node())
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/namespaces', name: `Namespaces` },
				{ link: '/namespaces/treemap', name: `Treemap` },
			]"
			:class="$style.breadcrumbs"
		/>

		<div ref="treemap" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.name {
	font-size: 18px;
	fill: var(--txt-primary);
}

.value {
	font-size: 16px;
	fill: var(--txt-secondary);
}
</style>
