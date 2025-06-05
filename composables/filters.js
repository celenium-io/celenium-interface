export const useFilters = (defaultFilters) => {
	const filters = reactive({ ...defaultFilters })

	const setFilter = (target, filter) => {
		if (!(target in filters)) return
		filters[target] = filter
	}

	const resetFilter = (target) => {
		if (!(target in filters)) return
		filters[target] = defaultFilters[target]
	}

	const resetAllFilters = () => {
		filters = { ...defaultFilters }
	}

	return { filters, setFilter, resetFilter, resetAllFilters }
}
