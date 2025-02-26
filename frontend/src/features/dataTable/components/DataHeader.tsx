import { Button, CircularProgress, Stack, Typography, useTheme } from '@mui/material'
import { lazy, Suspense } from 'react'

import { PermRules } from '@/constants/permissions'
import { useModal } from '@/features/modal/hooks/useModal'
import { useCheckPermission } from '@/features/auth/hooks/check'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { FastFilter } from './FastFilter/FastFilter'
import { FastChoose } from './FastChoose/FastChoose'
import { Tools } from './Tools/Tools'
import { SelectSIList } from './SelectSIList/SelectSIList'

const Setting = lazy(() => import('./Table/Columns/ColumnsSetting.tsx'))

export const DataHeader = () => {
	const { palette } = useTheme()
	const { openModal } = useModal()

	const openHandler = () => {
		openModal('CreateDataItem')
	}

	return (
		<Stack direction={'row'} spacing={2} paddingX={3} paddingBottom={2} justifyContent={'space-between'}>
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

			{/* //TODO надо уменьшать размер бандла */}
			<Stack direction={'row'} spacing={2}>
				<Suspense fallback={<CircularProgress size={20} />}>
					<Setting />
				</Suspense>

				<FastChoose />
				<FastFilter />
				<Tools />
			</Stack>
		</Stack>
	)
}
