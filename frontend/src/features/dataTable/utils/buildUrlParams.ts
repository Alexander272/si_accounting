import { Size } from '@/constants/defaultValues'
import type { IDataItem, ISIParams } from '../types/data'

export const buildSiUrlParams = (req: ISIParams): URLSearchParams => {
	const params: string[][] = []

	if (req.page && req.page != 1) params.push(['page', req.page.toString()])
	if (req.size && req.size != Size) params.push(['size', req.size.toString()])

	if (req.sort) {
		// req.sort.forEach(s => params.push(['sort_by', `${s.type == 'DESC' ? '-' : ''}${s.field}`]))
		// params.push(['sort_by', `${req.sort.type == 'DESC' ? '-' : ''}${req.sort.field}`])
		const s = req.sort
		const sort: string[] = []
		Object.keys(req.sort).forEach(k => {
			sort.push(`${s[k as keyof IDataItem] == 'DESC' ? '-' : ''}${k}`)
		})
		params.push(['sort_by', sort.join(',')])
	}

	if (req.filter) {
		req.filter.forEach(f => {
			params.push([`filters[${f.field}]`, f.fieldType])
			f.values.forEach(v => {
				params.push([`${f.field}[${v.compareType}]`, v.value])
			})

			// if (f.compareType == 'range') {
			// 	params.push([`${f.field}[gte]`, f.valueStart])
			// 	params.push([`${f.field}[lte]`, f.valueEnd])
			// } else {
			// 	params.push([`${f.field}[${f.compareType}]`, f.valueStart])
			// }
		})
		// params.push([`filters[${req.filter.field}]`, req.filter.fieldType])

		// if (req.filter.compareType == 'range') {
		// 	params.push([`${req.filter.field}[gte]`, req.filter.valueStart])
		// 	params.push([`${req.filter.field}[lte]`, req.filter.valueEnd])
		// } else {
		// 	params.push([`${req.filter.field}[${req.filter.compareType}]`, req.filter.valueStart])
		// }
	}

	return new URLSearchParams(params)
}
