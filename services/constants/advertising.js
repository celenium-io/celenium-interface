const advertisements = [
	{
		name: 'celenium_api',
		modal: 'api',
		icon: 'slash',
		header: 'Try out Celenium API',
		body: 'The power of Celestia: Scalable, Secure and Modular Blockchain.',
		footer: 'Get started',
		weight: 0.2,
	},
	{
		name: 'celenium_survey',
		link: 'https://t.co/4nBFExP2VR',
		icon: 'validator',
		header: 'Celenium survey',
		body: 'Please take 5 minutes and answer a few questions.',
		footer: 'Take the survey',
		weight: 0.4,
	},
	{
		name: 'lumina',
		modal: 'lightNode',
		icon: 'lumina',
		header: 'Your Own Node',
		body: 'Launch a node directly in your browser or on your phone.',
		footer: 'Run Light Node',
		weight: 0.4,
	},
]

export function getRandomAdv() {
    const randomNum = Math.random()

    let cumWeight = 0
    for (let ad of advertisements) {
        cumWeight += ad.weight
        if (randomNum <= cumWeight) {
            return ad
        }
    }
}

export function getAdvByName(name) {
	let adv = {}
	advertisements.forEach(el => {
		if (el.name === name) {
			adv = el
		}
	})

	return adv
}
