import * as d3 from "d3"
import { DateTime } from "luxon"

/**
 * Builds a line chart using D3.js
 * @param {HTMLElement} chartEl - DOM element for chart placement
 * @param {Array} data - Data for the chart [{date, value}]
 * @param {Function} onEnter - Callback on hover
 * @param {Function} onLeave - Callback on cursor leave
 * @param {string} metric - Metric (optional, for special TVL logic)
 */
export const buildLineChart = (chartEl, data, onEnter, onLeave, metric) => {
	const width = chartEl.parentElement.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 0
	const marginBottom = 24
	const marginLeft = 52

	const MAX_VALUE = d3.max(data, (d) => d.value) ? d3.max(data, (d) => d.value) : 1

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - marginBottom - 6, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))

	/** Tooltip */
	const bisect = d3.bisector((d) => d.date).center
	const onPointermoved = (event) => {
		if (!data.length) return

		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0]))

		const tooltipXOffset = window.currentTooltipXOffset
		const tooltipYDataOffset = window.currentTooltipYDataOffset
		const tooltipYOffset = window.currentTooltipYOffset
		const tooltipText = window.currentTooltipText
		const tooltipDynamicXPosition = window.currentTooltipDynamicXPosition
		const badgeText = window.currentBadgeText
		const badgeOffset = window.currentBadgeOffset
		const tooltipEl = window.currentTooltipEl
		const badgeEl = window.currentBadgeEl
		const selectedPeriod = window.currentSelectedPeriod
		const loadLastValue = window.currentLoadLastValue

		if (tooltipXOffset) tooltipXOffset.value = x(data[idx].date)
		if (tooltipYDataOffset) tooltipYDataOffset.value = y(data[idx].value)
		if (tooltipYOffset) tooltipYOffset.value = event.layerY
		if (tooltipText) tooltipText.value = data[idx].value

		if (tooltipEl && tooltipEl.value) {
			if (idx > parseInt(selectedPeriod?.value?.value / 2)) {
				tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
			} else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			}
		}

		let tf = selectedPeriod?.value?.timeframe
		if (metric === "tvl" && ["hour", "week"].includes(selectedPeriod?.value?.timeframe)) {
			tf = "day"
		}

		if (badgeText) {
			badgeText.value =
				tf === "month"
					? DateTime.fromJSDate(data[idx].date).toFormat("LLL")
					: tf === "day"
					? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
					: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")
		}

		if (badgeEl && badgeEl.value) {
			const badgeWidth = badgeEl.value.getBoundingClientRect().width
			if (tooltipXOffset.value - marginLeft < badgeWidth / 2) {
				badgeOffset.value = 0
			} else if (badgeWidth + tooltipXOffset.value > width) {
				badgeOffset.value = Math.abs(width - (badgeWidth + tooltipXOffset.value)) + (data.length - 1 - idx) * 2
			} else {
				badgeOffset.value = badgeWidth / 2
			}
		}
	}

	const onPointerleft = () => {
		if (!data.length) return

		onLeave()

		const badgeText = window.currentBadgeText
		if (badgeText) badgeText.value = ""
	}

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;  height: intrinsic;")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointermoved)
		.on("pointerleave", onPointerleft)
		.on("touchstart", (event) => event.preventDefault())

	/** Vertical Lines */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${marginLeft},${height - marginBottom + 2} L${marginLeft},${height - marginBottom - 5}`)
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${width - 1},${height - marginBottom + 2} L${width - 1},${height - marginBottom - 5}`)

	/** Default Horizontal Line  */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${0},${height - marginBottom - 6} L${width},${height - marginBottom - 6}`)

	if (data.length) {
		/** Chart Line */
		let path1 = null
		let path2 = null

		const loadLastValue = window.currentLoadLastValue

		path1 = svg
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "var(--brand)")
			.attr("stroke-width", 2)
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round")
			.attr("d", line(loadLastValue?.value ? data.slice(0, data.length - 1) : data))

		if (loadLastValue?.value) {
			// Create pattern
			const defs = svg.append("defs")
			const pattern = defs
				.append("pattern")
				.attr("id", "dashedPattern")
				.attr("width", 8)
				.attr("height", 2)
				.attr("patternUnits", "userSpaceOnUse")
			pattern.append("rect").attr("width", 4).attr("height", 2).attr("fill", "var(--brand)")
			pattern.append("rect").attr("x", 8).attr("width", 4).attr("height", 2).attr("fill", "transparent")

			// Last dash segment
			path2 = svg
				.append("path")
				.attr("fill", "none")
				.attr("stroke", "url(#dashedPattern)")
				.attr("stroke-width", 2)
				.attr("stroke-linecap", "round")
				.attr("stroke-linejoin", "round")
				.attr("d", line(data.slice(data.length - 2, data.length)))
		}

		const totalDuration = 1_000
		const path1Duration = loadLastValue?.value ? (totalDuration / data.length) * (data.length - 1) : totalDuration
		const path1Length = path1.node().getTotalLength()

		path1
			.attr("stroke-dasharray", path1Length)
			.attr("stroke-dashoffset", path1Length)
			.transition()
			.duration(path1Duration)
			.ease(d3.easeLinear)
			.attr("stroke-dashoffset", 0)

		if (loadLastValue?.value) {
			const path2Duration = totalDuration / data.length
			const path2Length = path2.node().getTotalLength() + 1

			path2
				.attr("stroke-dasharray", path2Length)
				.attr("stroke-dashoffset", path2Length)
				.transition()
				.duration(path2Duration)
				.ease(d3.easeLinear)
				.delay(path1Duration)
				.attr("stroke-dashoffset", 0)
		}

		const point = svg
			.append("circle")
			.attr("cx", x(data[data.length - 1].date))
			.attr("cy", y(data[data.length - 1].value))
			.attr("fill", "var(--brand)")
			.attr("r", 3)
			.attr("opacity", 0)

		point.transition().delay(totalDuration).duration(200).attr("opacity", 1)
	} else {
		svg.append("text")
			.attr("x", width / 2)
			.attr("y", height * 0.3)
			.attr("text-anchor", "middle")
			.attr("fill", "var(--op-20)")
			.style("font-size", "14px")
			.text("No data available for this rollup")
	}

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}
