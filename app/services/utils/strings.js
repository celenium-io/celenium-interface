export const space = (s) => {
	if (!s.length) return ""
	return s.match(/.{1,4}/g).join(" ")
}

export const capitilize = (s) => {
    if (!s) return ""

    let words = s.split(" ")

    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    
	// return s.charAt(0).toUpperCase() + s.slice(1)
}

export function capitalizeAndReplace(s, symbol) {
    let words = s.split(symbol);
    let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    
    return capitalizedWords.join(' ')
}
