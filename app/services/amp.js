import * as amp from "@amplitude/analytics-browser"

const init = (t) => {
	if (!t) return
	amp.init(t, { defaultTracking: true })
}

const log = (event, props) => {
	amp.track(event, props)
}

export default { init, log }
