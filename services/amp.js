import * as amp from "@amplitude/analytics-browser"

const init = (t) => {
	amp.init(t, { defaultTracking: true })
}

const log = (event) => {
	amp.track(event)
}

export default { init, log }
