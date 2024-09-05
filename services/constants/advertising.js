const advertisements = [
	{
		name: 'celenium_api',
		link: 'https://api-plans.celenium.io',
		icon: 'slash',
		header: 'Try out Celenium API',
		body: 'Unlock the power of Celestia: Scalable, Secure and Modular Blockchain.',
		footer: 'Get started ->',
		weight: 50,
	},
	{
		name: 'celenium_survey',
		link: 'https://forms.gle/qHL1yicTDVxTdvp69',
		icon: 'slash',
		header: 'Celenium survey',
		body: 'Please take 5 minutes and answer a few questions about Celenium.',
		footer: 'Take the survey ->',
		weight: 50,
	},
]

const totalWeight = 100

export function getRandomAdv() {
    const randomNum = Math.random() * totalWeight

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
