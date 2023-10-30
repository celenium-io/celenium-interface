import * as amp from "@amplitude/analytics-browser"

const init = (t) => {
	amp.init(t)
}

const log = (event) => {
	amp.track(event)
}

export default { init, log }
