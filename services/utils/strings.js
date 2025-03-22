export const space = (s) => {
	if (!s.length) return ""
	return s.match(/.{1,4}/g).join(" ")
}

export const capitilize = (s) => {
    if (!s) return ""
    
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function capitalizeAndReplaceUnderscore(s) {
    if (!s) return ''

    let words = s.split('_')
    let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    
    return capitalizedWords.join(' ')
}
