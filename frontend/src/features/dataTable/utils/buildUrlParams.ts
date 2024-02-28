import { Size } from '@/constants/defaultValues'
import { ISIParams } from '../types/data'

export const buildSiUrlParams = (req: ISIParams): URLSearchParams => {
	const params: string[][] = []

	if (req.page && req.page != 1) params.push(['page', req.page.toString()])
	if (req.size && req.size != Size) params.push(['size', req.size.toString()])

	if (req.sort) params.push(['sort_by', `${req.sort.type == 'DESC' ? '-' : ''}${req.sort.field}`])

	if (req.filter) {
		params.push([`filters[${req.filter.field}]`, req.filter.fieldType])

		if (req.filter.compareType == 'range') {
			params.push([`${req.filter.field}[gte]`, req.filter.valueStart])
			params.push([`${req.filter.field}[lte]`, req.filter.valueEnd])
		} else {
			params.push([`${req.filter.field}[${req.filter.compareType}]`, req.filter.valueStart])
		}
	}

	return new URLSearchParams(params)
}
