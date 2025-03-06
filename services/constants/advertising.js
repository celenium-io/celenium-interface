const advertisements = [
	{
		name: 'celenium_api',
		modal: 'api',
		icon: 'slash',
		header: 'Try out Celenium API',
		body: 'The power of Celestia: Scalable, Secure and Modular Blockchain.',
		footer: 'Get started',
		weight: 0.4,
	},
	{
		name: 'celestials',
		link: 'https://celestials.id/',
		icon: 'celestials',
		header: 'Celestials ID',
		body: 'Platform to buy Celestia modular domains',
		footer: 'Pick your domain',
		weight: 1,
	},
	{
		name: 'lumina',
		modal: 'lightNode',
		icon: 'lumina',
		header: 'Your Own Node',
		body: 'Easily launch a node right in your browser or on your phone.',
		footer: 'Run Light Node',
		weight: 0.4,
	},
	{
		name: 'celestia_update',
		link: 'https://blog.celestia.org/ginger/',
		icon: 'zap',
		header: 'Celestia Upgrade',
		body: 'Mainnet update scheduled for 28.01.2025.',
		footer: 'View Docs',
		weight: 1.1,
	},
	{
		name: 'celenium_survey',
		link: 'https://t.co/4nBFExP2VR',
		icon: 'validator',
		header: 'Celenium survey',
		body: 'Please take 5 minutes of your time and answer a few questions.',
		footer: 'Take the survey',
		weight: 0,
	},
]

export function getRandomAdv() {
    const randomNum = Math.random()

    let cumWeight = 0
    for (let ad of advertisements.filter(el => el.weight <= 1)) {
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
