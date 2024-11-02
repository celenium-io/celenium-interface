<script setup>
/** Vendor */
import * as d3 from "d3"

/** Components */
import Tooltip from "@/components/ui/Tooltip.vue"


/** Services */
import { abbreviate, comma, formatBytes, sortArrayOfObjects } from "@/services/utils"

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    metrics: {
        type: Array,
        required: true,
    }
})

const resData = ref([])
const sortedData = ref({})

const selectedRollups = ref([])
const selectedRollupsData = computed(() => {
    let res = []
    res = sortedData.value[sort?.by]?.filter(r => selectedRollups.value?.includes(r.slug))
    res = sortArrayOfObjects(res, sort.by, sort.dir === 'asc' ? true : false)

    return res
})

const chartEl = ref()

const prepareData = () => {
    let res = []
    let sortRes = {}

    props.data.forEach(d => {
        let row = {}
        props.metrics.forEach(m => {
            row[m] = d[m]
            row.metric = m
            row.slug = d.slug
            row.name = d.name
        })

        res.push(row)
    })

    props.metrics.forEach(m => {
        sortRes[m] = [...props.data].sort((a, b) => m === 'mb_price' ? b[m] - a[m] : a[m] - b[m])
    })

    resData.value = res
    sortedData.value = sortRes
}

const sort = reactive({
	by: "mb_price",
	dir: "asc",
})

const handleSort = (by) => {
	switch (sort.dir) {
		case "desc":
			if (sort.by == by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by
}

function highlight(slug) {
    const elements = document.querySelectorAll(`[slug="${slug}"]`)
    elements.forEach(el => {
        switch (el.nodeName) {
        case "text":
            el.style.fill = "var(--txt-primary)"

            break
        case "path":
            el.style.opacity = 1
            el.style.filter = "brightness(1.2)"
            el.style.strokeWidth = "4px"

            break
        }
    })
}

function unhighlight(slug) {
    const elements = document.querySelectorAll(`[slug="${slug}"]`)
    elements.forEach(el => {
        if (!selectedRollups.value.includes(slug)) {
            switch (el.nodeName) {
                case "text":
                    el.style.fill = "var(--txt-secondary)"

                    break
                case "path":
                    el.style.opacity = 0.5
                    el.style.filter = "brightness(0.6)"
                    el.style.strokeWidth = "3px"

                    break
            }
        }
    })
}

function selectRollup(slug) {
    if (selectedRollups.value.includes(slug)) {
        selectedRollups.value = selectedRollups.value.filter(r => r !== slug)
        unhighlight(slug)

        return
    } else if (selectedRollups.value.length > 2) {
        let firstRollup = selectedRollups.value.shift()
        unhighlight(firstRollup)
    }

    highlight(slug)
    selectedRollups.value.push(slug)
}

const buildChart = (chart, data) => {
	const height = chart.getBoundingClientRect().height
	const width = chart.getBoundingClientRect().width
    
    const margin = { top: 32, right: 12, bottom: 6, left: 12 }

	/** SVG Container */
	const svg = d3
		.create("svg")
            .attr("width", width)
            .attr("height", height - margin.top - margin.bottom)
            .attr("viewBox", [0, 0, width, height])
        
    const y = d3.scaleLinear()
                .domain([ -1, data.length ])
                .range([height - 2, margin.top])

    // X scale
    const x = d3.scalePoint()
                .range([ 0, width ])
                .padding(1)
                .domain(props.metrics)
    
    const getAxisTitle = (metric) => {
        switch (metric) {
            case 'total_size':
                return 'Total Size'
            case 'blobs_count':
                return 'Blobs'
            case 'avg_size':
                return 'Avg Blob Size'
            case 'throughput':
                return 'Throughput (b/s)'
            case 'mb_price':
                return 'MB Price'
            default:
                return metric
        }
    }

    // The path function take a row as input, and return x and y coordinates of the line to draw
    const path = (d) => {
        return d3.line()
            (props.metrics.map(function(m, i) {
            let index = sortedData.value[m].findIndex(el => el.slug === d.slug)
            
            return [ x(m) + (i === 0 ? + 0.5 : i === props.metrics.length - 1 ? - 0.5 : 0), y(index) ]
        }))
    }

    // Draw the axis:
    const midAxis = props.metrics.slice(1, props.metrics.length - 1)
    const edgeAxis = [props.metrics[0], props.metrics[props.metrics.length - 1]]
    svg.selectAll("middle-axis")
        .data(midAxis).enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .attr("class", "axis")
        .each(function(d, i) { 
            const g = d3.select(this)
            g.call(
                d3.axisLeft()
                    .scale(y)
                    .ticks(0)
                    .tickSizeOuter(0)
            )

            // Outer ticks
            g.append("line")
                .attr("x1", -10)
                .attr("y1", margin.top)
                .attr("x2", 10)
                .attr("y2", margin.top)
            g.append("line")
                .attr("x1", -10)
                .attr("y1", height - 2)
                .attr("x2", 10)
                .attr("y2", height - 2)
            
            // Axis titles
            g.append("text")
                .attr("y", margin.top - 8)
                .text(getAxisTitle(d))
                .style("text-anchor", "middle")
                .style("font-size", "12")
                .style("font-style", "12")
                .style("font-weight", "600")
                .style("fill", "#6d696b")
        })

    // Draw the lines
    const graph = svg.selectAll("pathes")
    graph
        .data(data)
        .enter().append("path")
        .attr("class", "graph")
        .attr("slug", d => d.slug)
        .style("fill", "none")
        .style("stroke", "var(--brand)")
        .style("stroke-width", "3px")
        .style("opacity", 0.5)
        .style("filter", "brightness(0.6)")
        .style("transition", "all 0.5s ease")
		// .attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
        .attr("d", path )
        .on('mouseover', (event, d) => highlight(d.slug))
        .on('mouseleave', (event, d) => unhighlight(d.slug))
        .on('click', (event, d) => selectRollup(d.slug))
        .style("stroke-dasharray", function() { return this.getTotalLength(); })
        // .style("stroke-dashoffset", function() {
        //     return Math.random() > 0.5 ? this.getTotalLength() : -this.getTotalLength();
        // })
        .style("stroke-dashoffset", function() { return this.getTotalLength(); })
        .transition()
        .duration(1000)
        .ease(d3.easeCubic)
        .style("stroke-dashoffset", 0)
    
    svg.selectAll("first-last-axis")
        .data(edgeAxis).enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .attr("class", "axis")
        .each(function(d, i) { 
            const g = d3.select(this)
            g.call(
                d3.axisLeft()
                    .scale(y)
                    .ticks(0)
                    .tickSizeOuter(0)
            )

            // Outer ticks
            g.append("line")
                .attr("x1", -10)
                .attr("y1", margin.top)
                .attr("x2", 10)
                .attr("y2", margin.top)
            g.append("line")
                .attr("x1", -10)
                .attr("y1", height - 2)
                .attr("x2", 10)
                .attr("y2", height - 2)
            
            // Axis titles
            g.append("text")
                .attr("y", margin.top - 8)
                .text(getAxisTitle(d))
                .style("text-anchor", "middle")
                .style("font-size", "12")
                .style("font-style", "12")
                .style("font-weight", "600")
                .style("fill", "#6d696b")
        })

    svg.selectAll("line, path:not(.graph)")
        .style("stroke", "#6d696b")
        .style("stroke-width", "2.5px")
    
    
    edgeAxis.forEach((m, i) => {
        svg.selectAll("labels")
            .data(sortedData.value[m]).enter()
            .append("text")
                .attr("x", x(m) + (i === 0 ? -10 : 10))
                .attr("y", (d, i) => y(i) + 5 )
                .attr("slug", d => d.slug)
                .text(d => d.name)
                .style("text-anchor", `${i === 0 ? 'end' : 'start'}`)
                .style("font-size", "12")
                .style("font-weight", "600")
                .style("fill", "var(--txt-secondary)")
                .style("cursor", "pointer")
                .on('mouseover', (event, d) => highlight(d.slug))
                .on('mouseleave', (event, d) => unhighlight(d.slug))
                .on('click', (event, d) => selectRollup(d.slug))
    })

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(() => {
    prepareData()

    buildChart(chartEl.value.wrapper, resData.value)
})
</script>

<template>
	<Flex direction="column" justify="start" gap="4" wide :class="$style.wrapper">
        <div :class="$style.chart_wrapper">
            <Flex ref="chartEl" :class="$style.chart" />

            <Tooltip width="200" :class="$style.info_tooltip">
                <Icon name="info" size="16" color="tertiary" />

                <template #content>
                    <Flex align="center" :style="{ width: '200px' }">
                        <Text size="12" color="secondary">
                            This graph displays the rollup rankings for each metric, not the absolute values.
                        </Text>
                    </Flex>
                </template>
            </Tooltip>
            
        </div>

        <div :class="$style.horizontal_divider" />

        <Flex justify="center" direction="column" gap="8" wide :class="$style.table">
            <Transition name="fastfade" mode="out-in">
                <div v-if="selectedRollupsData?.length" :class="$style.table_scroller">
                    <table>
                        <thead>
                            <tr>
                                <th><Text size="12" weight="600" color="tertiary" noWrap>Rollup</Text></th>
                                <th @click="handleSort('total_size')" :class="$style.sortable">
                                    <Flex align="center" gap="6">
                                        <Text size="12" weight="600" color="tertiary" noWrap>Total Size</Text>
                                        <Icon
                                            v-if="sort.by === 'total_size'"
                                            name="chevron"
                                            size="12"
                                            color="secondary"
                                            :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                        />
                                    </Flex>
                                </th>
                                <th @click="handleSort('avg_size')" :class="$style.sortable">
                                    <Flex align="center" gap="6">
                                        <Text size="12" weight="600" color="tertiary" noWrap>Avg Blob Size</Text>
                                        <Icon
                                            v-if="sort.by === 'avg_size'"
                                            name="chevron"
                                            size="12"
                                            color="secondary"
                                            :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                        />
                                    </Flex>
                                </th>
                                <th @click="handleSort('blobs_count')" :class="$style.sortable">
                                    <Flex align="center" gap="6">
                                        <Text size="12" weight="600" color="tertiary" noWrap>Blobs</Text>
                                        <Icon
                                            v-if="sort.by === 'blobs_count'"
                                            name="chevron"
                                            size="12"
                                            color="secondary"
                                            :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                        />
                                    </Flex>
                                </th>
                                <th @click="handleSort('throughput')" :class="$style.sortable">
                                    <Flex align="center" gap="6">
                                        <Text size="12" weight="600" color="tertiary" noWrap>Throughput (b/s)</Text>
                                        <Icon
                                            v-if="sort.by === 'throughput'"
                                            name="chevron"
                                            size="12"
                                            color="secondary"
                                            :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                        />
                                    </Flex>
                                </th>
                                <th @click="handleSort('mb_price')" :class="$style.sortable">
                                    <Flex align="center" gap="6">
                                        <Text size="12" weight="600" color="tertiary" noWrap>MB Price</Text>
                                        <Icon
                                            v-if="sort.by === 'mb_price'"
                                            name="chevron"
                                            size="12"
                                            color="secondary"
                                            :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                        />
                                    </Flex>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="r in selectedRollupsData">
                                <td style="width: 1px">
                                    <NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
                                        <Flex align="center" gap="8">
                                            <Flex v-if="r.logo" align="center" justify="center" :class="$style.avatar_container">
                                                <img :src="r.logo" :class="$style.avatar_image" />
                                            </Flex>

                                            <Text size="12" weight="600" color="primary" mono>
                                                {{ r.name }}
                                            </Text>
                                        </Flex>
                                    </NuxtLink>
                                </td>
                                <td>
                                    <NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
                                        <Flex align="center">
                                            <Text size="12" weight="600" color="primary">{{ formatBytes(r.total_size) }}</Text>
                                        </Flex>
                                    </NuxtLink>
                                </td>
                                <td>
                                    <NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
                                        <Flex align="center">
                                            <Text size="12" weight="600" color="primary">
                                                {{ formatBytes(r.avg_size) }}
                                            </Text>
                                        </Flex>
                                    </NuxtLink>
                                </td>
                                <td>
                                    <NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
                                        <Tooltip position="start" delay="400">
                                            <Flex align="center">
                                                <Text size="12" weight="600" color="primary">{{ abbreviate(r.blobs_count) }}</Text>
                                            </Flex>

                                            <template #content>
                                                <Text size="12" weight="600" color="tertiary"> {{ comma(r.blobs_count) }} </Text>
                                            </template>
                                        </Tooltip>
                                    </NuxtLink>
                                </td>
                                <td>
                                    <NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
                                        <Flex align="center">
                                            <Text size="12" weight="600" color="primary">
                                                {{ formatBytes(r.throughput) }}
                                            </Text>
                                        </Flex>
                                    </NuxtLink>
                                </td>
                                <td>
                                    <NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
                                        <Flex align="center">
                                            <AmountInCurrency :amount="{ value: r.mb_price }" />
                                        </Flex>
                                    </NuxtLink>
                                </td>
                                <td>
                                    <Icon @click.prevent.stop="selectRollup(r.slug)" name="close" size="16" color="secondary" :class="$style.remove_icon" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
                    <Text size="13" weight="600" color="secondary" align="center"> No rollups for comparison </Text>
                    <Text size="12" weight="500" height="160" color="tertiary" align="center">
                        Click on the rollup name to add it here
                    </Text>
                </Flex>
            </Transition>
        </Flex>
	</Flex>
</template>

<style module>
.wrapper {
    padding-top: 12px;
    width: 100%;
	height: 100%;
}

.chart_wrapper {
    position: relative;
    width: 100%;
    height: 100%;
	max-height: 700px;
}

.chart {
    width: 100%;
	height: 100%;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.info_tooltip {
    position: absolute;
    cursor: help;
    top: 10px;
    right: 16px;
}

.rollups_table_wrapper {
    width: 100%;
    height: 100%;

    padding: 0 12px;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 4px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.05s ease;

				&:hover {
					background: var(--op-5);
                    
                    & .remove_icon {
                        opacity: 1;
                    }
				}

				&:active {
					background: var(--op-8);
				}
			}
		}

		& tr th {
			text-align: left;

			padding: 4px 16px 8px 0;

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 32px;
			}

			&:last-child {
                flex-grow: 1;
				padding-right: 32px;
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
			padding: 0;

			white-space: nowrap;

			&:first-child {
				padding-left: 32px;
                min-width: 250px;
			}

			& > a {
				display: flex;

				min-height: 44px;

				padding-right: 24px;
			}
		}
	}
}

.remove_icon {
    padding: 2px;
    margin-right: 12px;
    opacity: 0;
    border-radius: 50%;

    &:hover {
        background: var(--op-10);
        scale: 1.1;
    }
}

.avatar_container {
	position: relative;
	width: 25px;
	height: 25px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.horizontal_divider {
	width: 100%;
	height: 2px;
    margin-bottom: 12px;
    background: linear-gradient(to right, transparent 0%, var(--op-10) 5%, var(--op-10) 95%, transparent 100%);
}

.empty {
	padding: 32px 0;
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
