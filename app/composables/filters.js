export const useFilters = (defaultFilters) => {
	const filters = ref({ ...defaultFilters })

	const setFilter = (target, filter) => {
		if (!(target in filters.value)) return
		filters.value[target] = filter
	}

	const resetFilter = (target) => {
		if (!(target in filters.value)) return
		filters.value[target] = defaultFilters[target]
	}

	const resetAllFilters = () => {
		filters.value = { ...defaultFilters }
	}

	return { filters, setFilter, resetFilter, resetAllFilters }
}
