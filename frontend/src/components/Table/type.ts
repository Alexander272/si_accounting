export interface Column {
	id: string
	label: string
	width: number
	filterType?: 'string' | 'date' | 'number' | 'list'
}

export interface ISort {
	field: string
	type: 'DESC' | 'ASC'
}
