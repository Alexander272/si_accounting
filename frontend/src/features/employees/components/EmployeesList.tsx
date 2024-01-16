import { Box } from '@mui/material'

import { GroupList } from './GroupList'

export const EmployeesList = () => {
	return (
		<Box
			borderRadius={3}
			padding={2}
			margin={'0 auto'}
			width={'80%'}
			border={'1px solid rgba(0, 0, 0, 0.12)'}
			flexGrow={1}
			display={'flex'}
			flexDirection={'column'}
			sx={{ backgroundColor: '#fff', userSelect: 'none' }}
		>
			<GroupList />
		</Box>
	)
}
