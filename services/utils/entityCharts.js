import * as d3 from "d3"
import { DateTime } from "luxon"

/**
 * Periods for the charts
 * @type {Array}
 */
export const PERIODS = [
	{
		title: "Last 24 hours",
		value: 24,
		timeframe: "hour",
	},
	{
		title: "Last 7 days",
		value: 7,
		timeframe: "day",
	},
	{
		title: "Last 31 days",
		value: 30,
		timeframe: "day",
	},
	{
		title: "Last 12 months",
		value: 12,
		timeframe: "month",
	},
]

export const generateDateForPeriod = (period, index) => {
	const { timeframe, value } = period

	if (timeframe === "month") {
		return DateTime.now()
			.startOf("month")
			.minus({ months: value - index })
	} else {
		return DateTime.now().minus({
			[timeframe === "day" ? "days" : "hours"]: value - index,
		})
	}
}

/**
 * Get the format key for the timeframe
 * @param {string} timeframe - The timeframe
 * @returns {string} - The format key
 */
export const getFormatKey = (timeframe) => {
	return ["day", "month"].includes(timeframe) ? "y-LL-dd" : "y-LL-dd-HH"
}


export const createDataMap = (rawData, timeframe) => {
	const dataMap = {}
	const formatKey = getFormatKey(timeframe)

	rawData.forEach((item) => {
		dataMap[DateTime.fromISO(item.time).toFormat(formatKey)] = item.value
	})

	return dataMap
}

export const generateSeriesData = (period, dataMap, series) => {
	series.value = []

	for (let i = 1; i < period.value + 1; i++) {
		const dt = generateDateForPeriod(period, i)
		const formatKey = getFormatKey(period.timeframe)
		const key = dt.toFormat(formatKey)

		series.value.push({
			date: dt.toJSDate(),
			value: parseInt(dataMap[key]) || 0,
		})
	}
}

/**
 * Builds a line chart using D3.js
 * @param {HTMLElement} chartEl - DOM element for chart placement
 * @param {Array} data - Data for the chart [{date, value}]
 * @param {Function} onEnter - Callback on hover
 * @param {Function} onLeave - Callback on cursor leave
 * @param {string} metric - Metric (optional, for special TVL logic)
 */
export const buildLineChart = (chartEl, data, onEnter, onLeave, metric, tooltipConfig, color = "var(--brand)") => {
	const width = chartEl.parentElement.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 0
	const marginBottom = 24
	const marginLeft = 52

	const MAX_VALUE = d3.max(data, (d) => d.value) ? d3.max(data, (d) => d.value) : 1
	const showChart = metric === "tvl" ? MAX_VALUE > 1 : data.length

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
		if (!showChart) return

		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0]))

		const {
			tooltipXOffset,
			tooltipYDataOffset,
			tooltipYOffset,
			tooltipText,
			tooltipDynamicXPosition,
			badgeText,
			badgeOffset,
			tooltipEl,
			badgeEl,
			selectedPeriod,
		} = tooltipConfig

		if (tooltipXOffset) tooltipXOffset.value = x(data[idx].date)
		if (tooltipYDataOffset) tooltipYDataOffset.value = y(data[idx].value)
		if (tooltipYOffset) tooltipYOffset.value = event.layerY
		if (tooltipText) tooltipText.value = data[idx].value

		if (tooltipEl && tooltipEl.value) {
			if (idx > parseInt(selectedPeriod?.value / 2)) {
				tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
			} else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			}
		}

		let tf = selectedPeriod?.timeframe
		if (metric === "tvl" && ["hour", "week"].includes(selectedPeriod?.timeframe)) {
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
		if (!showChart) return

		onLeave()

		const { badgeText } = tooltipConfig
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

	if (showChart) {
		/** Chart Line */
		const { loadLastValue } = tooltipConfig
		let path1 = null
		let path2 = null

		const area = d3.area()
			.x(d => x(d.date))
			.y0(y(0))
			.y1(d => y(d.value))
		
		const clipId = `clip-${metric}-${Date.now()}`
		const clipPath = svg.append("clipPath")
			.attr("id", clipId)
		const clipRect = clipPath.append("rect")
			.attr("x", marginLeft)
			.attr("y", 0)
			.attr("width", 0)
			.attr("height", height)

		svg.append("path")
			.datum(data)
			.attr("fill", color)
			.attr("fill-opacity", 0.1)
			.attr("stroke", "none")
			.attr("clip-path", `url(#${clipId})`)
			.attr("d", area)
		// const clipId = `clip-${metric}-${Date.now()}`
		// svg.append("clipPath")
		// 	.attr("id", clipId)
		// 	.append("rect")
		// 	.attr("x", marginLeft)
		// 	.attr("y", 0)
		// 	.attr("width", 0)
		// 	.attr("height", height)
		// svg.append("path")
		// 	.datum(data)
		// 	.attr("fill", color)
		// 	.attr("fill-opacity", 0.1)
		// 	.attr("stroke", "none")
		// 	.attr("clip-path", `url(#${clipId})`)
		// 	.attr("d", area)
		
		path1 = svg
			.append("path")
			.attr("fill", "none")
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round")
			.attr("d", line(loadLastValue ? data.slice(0, data.length - 1) : data))

		if (loadLastValue) {
			// Create pattern
			const defs = svg.append("defs")
			const pattern = defs
				.append("pattern")
				.attr("id", `dashedPattern-${metric}`)
				.attr("width", 8)
				.attr("height", 2)
				.attr("patternUnits", "userSpaceOnUse")
			pattern.append("rect").attr("width", 4).attr("height", 2).attr("fill", color)
			pattern.append("rect").attr("x", 8).attr("width", 4).attr("height", 2).attr("fill", "transparent")

			// Last dash segment
			path2 = svg
				.append("path")
				.attr("fill", "none")
				.attr("stroke", `url(#dashedPattern-${metric})`)
				.attr("stroke-width", 2)
				.attr("stroke-linecap", "round")
				.attr("stroke-linejoin", "round")
				.attr("d", line(data.slice(data.length - 2, data.length)))
		}

		const totalDuration = 1_000
		const path1Duration = loadLastValue ? (totalDuration / data.length) * (data.length - 1) : totalDuration
		const path1Length = path1.node().getTotalLength()

		path1
			.attr("stroke-dasharray", path1Length)
			.attr("stroke-dashoffset", path1Length)
			.transition()
			.duration(path1Duration)
			.ease(d3.easeLinear)
			.attr("stroke-dashoffset", 0)

		if (loadLastValue) {
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
			.attr("fill", color)
			.attr("r", 3)
			.attr("opacity", 0)

		// const clipRect = svg.select(`#${clipId} rect`)
		clipRect.transition()
			.duration(totalDuration)
			.ease(d3.easeLinear)
			.attr("width", width - marginLeft)
		
		point.transition().delay(totalDuration).duration(200).attr("opacity", 1)
	} else {
		svg.append("text")
			.attr("x", width / 2)
			.attr("y", height * 0.3)
			.attr("text-anchor", "middle")
			.attr("fill", "var(--op-30)")
			.style("font-size", "14px")
			.text("No data available")
	}

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}

/**
 * Builds a bar chart using D3.js
 * @param {HTMLElement} chartEl - DOM element for chart placement
 * @param {Array} data - Data for the chart [{date, value}]
 * @param {Function} onEnter - Callback on hover
 * @param {Function} onLeave - Callback on cursor leave
 * @param {string} metric - Metric for chart identification
 */
export const buildBarChart = (chartEl, data, onEnter, onLeave, metric, tooltipConfig, color = "var(--brand)") => {
	const width = chartEl.parentElement.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 2
	const marginBottom = 24
	const marginLeft = 52

	const barWidth = Math.max(Math.round((width - marginLeft - marginRight) / data.length - (data.length > 7 ? 2 : 8)), 3)

	const MAX_VALUE = d3.max(data, (d) => d.value) ? d3.max(data, (d) => d.value) : 1
	const showChart = metric === "tvl" ? MAX_VALUE > 1 : data.length

	/** Scale */
	const xBand = d3
		.scaleBand()
		.domain(data.map((d) => new Date(d.date)))
		.range([marginLeft, width - marginRight])
		.padding(0.1)

	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight - barWidth],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - marginBottom, marginTop])

	/** Tooltip */
	const bisect = d3.bisector((d) => d.date).center
	const onPointermoved = (event) => {
		if (!showChart) return

		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0] - barWidth / 2))

		const elements = document.querySelectorAll(`[metric="${metric}"]`)
		elements.forEach((el) => {
			if (+el.getAttribute("data-index") === idx) {
				el.style.filter = "brightness(1.2)"
			} else {
				el.style.filter = "brightness(0.6)"
			}
		})

		const {
			tooltipXOffset,
			tooltipYDataOffset,
			tooltipYOffset,
			tooltipText,
			tooltipDynamicXPosition,
			badgeText,
			badgeOffset,
			tooltipEl,
			badgeEl,
			selectedPeriod,
		} = tooltipConfig

		if (tooltipXOffset) tooltipXOffset.value = x(data[idx].date)
		if (tooltipYDataOffset) tooltipYDataOffset.value = y(data[idx].value)
		if (tooltipYOffset) tooltipYOffset.value = event.layerY
		if (tooltipText) tooltipText.value = data[idx].value

		if (tooltipEl && tooltipEl.value) {
			const tooltipDomElement = tooltipEl.value.$el || tooltipEl.value

			if (idx > parseInt(selectedPeriod?.value / 2)) {
				tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipDomElement.getBoundingClientRect().width - 16
			} else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			}
		}

		let tf = selectedPeriod?.timeframe
		if (metric === "tvl" && ["hour", "week"].includes(selectedPeriod?.timeframe)) {
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
				badgeOffset.value = (badgeWidth - barWidth) / 2
			}
		}
	}

	const onPointerleft = () => {
		if (!showChart) return

		onLeave()

		const elements = document.querySelectorAll("[data-index]")
		elements.forEach((el) => {
			el.style.filter = ""
		})

		const { badgeText } = tooltipConfig
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

	if (showChart) {
		const { loadLastValue } = tooltipConfig
		/** Chart Bars */
		svg.append("defs")
			.append("pattern")
			.attr("id", `diagonal-stripe-${metric}`)
			.attr("width", 6)
			.attr("height", 6)
			.attr("patternUnits", "userSpaceOnUse")
			.attr("patternTransform", "rotate(45)")
			.append("rect")
			.attr("width", 2)
			.attr("height", 6)
			.attr("transform", "translate(0,0)")
			.attr("fill", color)

		svg.append("g")
			.selectAll("g")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("data-index", (d, i) => i)
			.attr("metric", metric)
			.attr("x", (d) => xBand(new Date(d.date)))
			.attr("y", (d) => y(d.value))
			.attr("width", xBand.bandwidth())
			.attr("fill", (d, i) => (loadLastValue && i === data.length - 1 ? `url(#diagonal-stripe-${metric})` : color))
			.transition()
			.duration(1_000)
			.attr("height", (d) => Math.max(height - marginBottom - 6 - y(d.value), 0))
	} else {
		svg.append("text")
			.attr("x", width / 2)
			.attr("y", height * 0.3)
			.attr("text-anchor", "middle")
			.attr("fill", "var(--op-30)")
			.style("font-size", "14px")
			.text("No data available")
	}

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}
