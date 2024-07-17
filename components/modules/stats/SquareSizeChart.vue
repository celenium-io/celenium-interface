<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchSquareSize } from "@/services/api/stats"

const chartEl = ref()

/** Tooltip */
const showSeriesTooltip = ref(false)
const tooltipEl = ref()
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")
const tooltip = ref({ show: false })

const badgeEl = ref()
const badgeText = ref("")
const badgeOffset = ref(0)

const handleTooltip = (data, X, Y) => {
    console.log('data', data?.data?.time);
    // console.log('tooltip.value.show', tooltip.value.show);
    // if (data && !tooltip.value.show) {
    //     // console.log('data', data.data.time);
    //     tooltip.value.text = data.data.time
    //     tooltip.value.x = X,
    //     tooltip.value.y = Y,
    //     tooltip.value.show = true
    // } else if (!data && tooltip.value.show) {
    //     tooltip.value.show = false
    // }

    // console.log('tooltip.value', tooltip.value);
    // console.log('data', data);
    // console.log('X', X);
    // console.log('Y', Y);
}

const buildChart = (chart, onEnter, onLeave) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
    const marginTop = 0;
    const marginRight = 0;
    const marginBottom = 10;
    const marginLeft = 6;
    const barWidth = Math.round((width - marginLeft - marginRight) / (transformedData.value.length) - 1)

	// /** Tooltip */
	const bisect = d3.bisector((d) => new Date(d.time)).center
	const onPointermoved = (event) => {
	// 	onEnter()

		const idx = bisect(transformedData.value, x.invert(d3.pointer(event)[0]))
        console.log('transformedData.value[idx]', transformedData.value[idx]);
        console.log('idx', idx);
    }
	// 	tooltipXOffset.value = x(data[idx].date) + barWidth / 2
	// 	tooltipYDataOffset.value = y(data[idx].value)
	// 	tooltipYOffset.value = event.layerY
	// 	tooltipText.value = 'asdasd' //data[idx].value

	// 	if (tooltipEl.value) {
	// 		if (idx > parseInt(props.period.value / 2)) {
	// 			tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
	// 		} else {
	// 			tooltipDynamicXPosition.value = tooltipXOffset.value + 16
	// 		}
	// 	}

	// 	badgeText.value = 'asd'
	// 		// props.period.timeframe === "day"
	// 		// 	? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
	// 		// 	: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")

	// 	if (!badgeEl.value) return
	// 	if (idx < 2) {
	// 		badgeOffset.value = 0
	// 	} else if (idx > props.period.value - 3) {
	// 		badgeOffset.value = badgeEl.value.getBoundingClientRect().width
	// 	} else {
	// 		badgeOffset.value = badgeEl.value.getBoundingClientRect().width / 2
	// 	}
	// }
	const onPointerleft = () => {
	// 	onLeave()
	// 	badgeText.value = ""
        console.log('leave');
	}

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;")
		.on("pointerenter pointermove", onPointermoved)
		.on("pointerleave", onPointerleft)
		// .on("touchstart", (event) => event.preventDefault())

    const stack = d3.stack()
        .keys(keys.value)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)
    
    const series = stack(transformedData.value)
    console.log('transformedData.value', transformedData.value);
    console.log('series', series);

    const x = d3.scaleUtc()
        .domain(d3.extent(transformedData.value, d => new Date(d.time)))
        .range([marginLeft, width])
        // .nice();

    const y1Max = d3.max(series, y => d3.max(y, d => d[1]))
    const y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - marginBottom, marginTop])

    // const color = d3.scaleOrdinal()
    //     .domain(keys.value)
    //     .range(["#65efcc", "#0E3F34"]);

    const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#65efcc", "#142f28"]))
        .domain([0, keys.value.length])
        // .interpolator(d3.interpolateRgb("#CC6510", "#65efcc"))
        // .interpolator(d3.interpolateRgb("#0E3F34", "#65efcc"));

    // Add x-scale
    // svg.append("g")
    //     .attr("transform", `translate(0,${height})`)
    //     .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%Y-%m-%d")));

    svg.append("g")
    const rect = svg.selectAll(".series")
        .data(series)
        .join("g")
        .attr("fill", (d, i) => color(i))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(new Date(d.data.time)))
        .attr("y", height - marginBottom)
        .attr("width", barWidth)
        .attr("height", 0)
        // .on("mouseover", (event, d) => {
        //     console.log('d.data.time', d.data.time);
            // handleTooltip(d, event.pageX, event.pageY)
        //     // const date = d.data.time;
        //     // const values = keys.map(key => `${key}: ${d.data[key]}`).join("<br>");
        //     // tooltip.html(`<strong>${date}</strong><br>${values}`)
        //     //     .style("opacity", 1)
        //     //     .style("left", (event.pageX + 10) + "px")
        //     //     .style("top", (event.pageY - 28) + "px");
        // })
        // .on("pointerleave", () => {
        //     console.log('d.data.time leave');
        //     handleTooltip()
        // })

        // svg.selectAll(".tooltip-rect")
        //     .data(transformedData)
        //     .join("rect")
        //     .attr("class", "tooltip-rect")
        //     .attr("x", d => x(new Date(d.time)))
        //     .attr("y", 0)
        //     .attr("width", barWidth)
        //     .attr("height", height)
        //     .attr("fill", "transparent")
        //     .on("mouseenter", (event, d) => {
        //         console.log('d.data.time', d.data.time);
        //         const date = d.time;
        //         const values = keys.map(key => `${key}: ${d[key]}`).join("<br>");
        //         tooltip.html(`<strong>${date}</strong><br>${values}`)
        //             .style("opacity", 1)
        //             .style("left", (event.pageX + 10) + "px")
        //             .style("top", (event.pageY - 28) + "px");
        //     })
        //     .on("mouseleave", () => {
        //         tooltip.style("opacity", 0);
        //     });

    // svg.append("g")
    //     .attr("transform", `translate(0,${height - marginBottom})`)
    //     .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""))
    
    // y.domain([0, y1Max]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
        .attr("x", d => x(new Date(d.data.time)))
        .attr("width", barWidth)
            
    if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const transformedData = ref([])
const keys = ref([])

const getSquareSizes = async () => {
	const data = await fetchSquareSize()

    keys.value = Object.keys(data)

    let maxLength = 0
    let maxKey = null

    for (const key in data) {
        if (data[key].length > maxLength) {
            maxLength = data[key].length
            maxKey = key
        }
    }

    const templateArray = data[maxKey];
    const templateTimes = templateArray.map(item => item.time);
    const filledData = {}
    for (const key in data) {
        filledData[key] = templateTimes.map(time => {
            const found = data[key].find(item => item.time === time)
            return found ? found : { time: time, value: "0" }
        });
    }

    filledData[maxKey].forEach((d, i) => {
        let entry = { time: d.time }
        keys.value.forEach(key => {
            entry[key] = +filledData[key][i].value
        })
        transformedData.value.push(entry)
    })

    transformedData.value.reverse()
}

onMounted(async () => {
    await getSquareSizes()

	buildChart(
        chartEl.value.wrapper,
		() => (showSeriesTooltip.value = true),
		() => (showSeriesTooltip.value = false),
    )
})


</script>

<template>
    <Flex align="center">
        <Transition name="fastfade">
            <div v-if="tooltip.show" :class="$style.tooltip_wrapper">
            <!-- <div :class="$style.tooltip_wrapper"> -->
                <!-- <div
                    :style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
                    :class="$style.dot"
                />
                <div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
                <div
                    ref="badgeEl"
                    :style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
                    :class="$style.badge"
                >
                    <Text size="12" weight="600" color="secondary">
                        {{ badgeText }}
                    </Text>
                </div> -->
                <!-- <Flex
                    v-if="tooltip"
                    ref="tooltipEl"
                    :style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
                    direction="column"
                    gap="8"
                    :class="$style.tooltip"
                > -->
                <Flex
                    direction="column"
                    gap="8"
                    :style="{ transform: `translate(${tooltip.x}px, ${tooltip.y - 40}px)` }"
                    :class="$style.tooltip"
                >
                    <Flex align="center" gap="16">
                        <Text size="12" weight="600" color="secondary"> {{ tooltip.text }} </Text>
                        <!-- <Text size="12" weight="600" color="primary"> {{ units === 'bytes' ? formatBytes(tooltipText) : tooltipText }} </Text> -->
                    </Flex>
                </Flex>
            </div>
        </Transition>

        <Flex ref="chartEl" :class="$style.chart" />
    </Flex>
</template>

<style module>
.chart {
    width: 992px;
    height: 400px;
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .dot {
		width: 6px;
		height: 6px;
		border-radius: 50px;
		background: var(--brand);

		box-shadow: 0 0 0 4px rgba(222, 116, 10, 0.27);

		transition: all 0.15s ease;
	}

	& .line {
		position: absolute;
		top: 0;
		bottom: 32px;

		border-left: 1px dashed var(--op-10);

		transition: all 0.15s ease;
	}

	& .badge {
		position: absolute;
		bottom: 4px;

		background: var(--op-3);

		transition: all 0.15s ease;
	}

	& .tooltip {
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--op-3);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 8px;

		transition: all 0.2s ease;
	}
}
</style>