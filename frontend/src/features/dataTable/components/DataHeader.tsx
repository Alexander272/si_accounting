import { Button, Stack, Typography, useTheme } from '@mui/material'

import { PermRules } from '@/constants/permissions'
import { useModal } from '@/features/modal/hooks/useModal'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { FastFilter } from './FastFilter/FastFilter'
import { FastChoose } from './FastChoose/FastChoose'
import { Tools } from './Tools/Tools'
import { SelectSIList } from './SelectSIList/SelectSIList'

export const DataHeader = () => {
	const { palette } = useTheme()
	const { openModal } = useModal()

	const openHandler = () => {
		openModal('CreateDataItem')
	}

	return (
		<Stack position={'relative'}>
			<Stack direction={'row'} spacing={2} paddingX={3} paddingY={2} justifyContent={'space-between'}>
				<Stack direction={'row'}>
					<Typography color={'primary'} variant='h5'>
						Средства измерений
					</Typography>

					{useCheckPermission(PermRules.SI.Write) ? (
						<>
							<SelectSIList />
							<Button
								onClick={openHandler}
								variant='outlined'
								sx={{ borderWidth: 2, minWidth: 54, ml: 2, ':hover': { borderWidth: 2 } }}
							>
								<PlusIcon fontSize={14} fill={palette.primary.main} />
							</Button>
						</>
					) : null}
				</Stack>

				<Stack direction={'row'} spacing={2}>
					<FastChoose />
					<FastFilter />
					<Tools />
				</Stack>
			</Stack>

			{/* <DataTableLoader /> */}
		</Stack>
	)
}
