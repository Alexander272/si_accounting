import { Button } from '@mui/material'

import { FilterIcon } from '@/components/Icons/FilterIcon'

export const FastFilter = () => {
	// const filter = useAppSelector(getTableFilter)

	return (
		<>
			<Button size='small' variant='outlined' color='inherit' sx={{ borderRadius: 3, paddingX: 1.5 }}>
				<FilterIcon fontSize={16} mr={1} /*color={filter ? 'black' : '#adadad'}*/ />
				Фильтр
			</Button>
		</>
	)
}
