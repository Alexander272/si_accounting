export const isOverflown = (element: Element | null) => {
	if (!element) {
		return false
	}
	return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
}
