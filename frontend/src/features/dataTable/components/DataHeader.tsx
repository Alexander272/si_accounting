import { Button, Stack, Typography, useTheme } from '@mui/material'

import { useModal } from '@/features/modal/hooks/useModal'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { FastFilter } from './FastFilter/FastFilter'
import { DataTableLoader } from './DataTableLoader'
import { Tools } from './Tools/Tools'

export const DataHeader = () => {
	const { palette } = useTheme()
	const { openModal } = useModal()

	const openHandler = () => {
		openModal('CreateDataItem')
	}

	return (
		<Stack position={'relative'}>
			<Stack direction={'row'} spacing={2} paddingX={3} paddingY={2} justifyContent={'space-between'}>
				<Stack direction={'row'} spacing={2}>
					<Typography color={'primary'} variant='h5'>
						Средства измерения
					</Typography>

					<Button
						onClick={openHandler}
						variant='outlined'
						sx={{ borderWidth: 2, borderRadius: 3, minWidth: 54, ':hover': { borderWidth: 2 } }}
					>
						<PlusIcon fontSize={14} color={palette.primary.main} />
					</Button>
				</Stack>

				<Stack direction={'row'} spacing={2}>
					<FastFilter />
					<Tools />
				</Stack>
			</Stack>

			<DataTableLoader />
		</Stack>
	)
}
