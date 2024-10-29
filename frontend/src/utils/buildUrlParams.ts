import { Size } from '@/constants/defaultValues'
import type { IDataItem, ISIParams } from '../features/dataTable/types/data'

export const buildSiUrlParams = (req: ISIParams): URLSearchParams => {
	const params: string[][] = []

	if (req.page && req.page != 1) params.push(['page', req.page.toString()])
	if (req.size && req.size != Size) params.push(['size', req.size.toString()])
	if (req.status) params.push(['status', req.status])

	if (req.sort) {
		const s = req.sort
		const sort: string[] = []
		Object.keys(s).forEach(k => {
			sort.push(`${s[k as keyof IDataItem] == 'DESC' ? '-' : ''}${k}`)
		})
		params.push(['sort_by', sort.join(',')])
	}

	if (req.filter) {
		req.filter.forEach(f => {
			params.push([`filters[${f.field}]`, f.fieldType || ''])
			f.values.forEach(v => {
				params.push([`${f.field}[${v.compareType}]`, v.value])
			})
		})
	}

	return new URLSearchParams(params)
}
