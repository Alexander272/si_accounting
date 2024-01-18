import { FC, MouseEvent } from 'react'
import { Button, Stack, useTheme } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getTablePage, setPage } from '../../dataTableSlice'
import { LeftArrowIcon } from '@/components/Icons/LeftArrowIcon'
import { LeftArrowEndIcon } from '@/components/Icons/LeftArrowEndIcon'

type Props = {
	totalPages: number
}

export const Pagination: FC<Props> = ({ totalPages }) => {
	const { palette } = useTheme()

	const currentPage = useAppSelector(getTablePage)

	const lastPage = Math.min(Math.max(currentPage + 2, 5), totalPages)
	const firstPage = Math.max(1, lastPage - 4)

	const dispatch = useAppDispatch()

	const setPageHandler = (event: MouseEvent<HTMLButtonElement>) => {
		const { page } = (event.target as HTMLButtonElement).dataset
		if (!page) return
		dispatch(setPage(+page))
	}

	const startHandler = () => {
		dispatch(setPage(1))
	}
	const prevHandler = () => {
		dispatch(setPage(currentPage - 1))
	}
	const nextHandler = () => {
		dispatch(setPage(currentPage + 1))
	}
	const endHandler = () => {
		dispatch(setPage(totalPages))
	}

	const renderPages = () => {
		const pages = []

		for (let i = firstPage; i <= lastPage; i++) {
			pages.push(
				<Button
					key={i}
					data-page={i}
					onClick={setPageHandler}
					variant={i == currentPage ? 'contained' : 'outlined'}
					disableElevation
					sx={{ minWidth: 36, width: 40, borderRadius: 3 }}
				>
					{i}
				</Button>
			)
		}

		return pages
	}

	if (totalPages == 1) return null

	return (
		<Stack direction={'row'} spacing={1} ml={'auto'}>
			<Button
				onClick={startHandler}
				variant='outlined'
				disabled={currentPage == 1}
				sx={{ minWidth: 36, width: 40 }}
			>
				<LeftArrowEndIcon
					fontSize={12}
					fill={currentPage == 1 ? palette.action.disabled : palette.primary.main}
				/>
			</Button>
			<Button
				onClick={prevHandler}
				variant='outlined'
				disabled={currentPage == 1}
				sx={{ minWidth: 36, width: 40 }}
			>
				<LeftArrowIcon fontSize={12} fill={currentPage == 1 ? palette.action.disabled : palette.primary.main} />
			</Button>

			{renderPages()}

			<Button
				onClick={nextHandler}
				variant='outlined'
				disabled={currentPage == totalPages}
				sx={{ minWidth: 36, width: 40 }}
			>
				<LeftArrowIcon
					fontSize={12}
					transform='rotate(180deg)'
					fill={currentPage == totalPages ? palette.action.disabled : palette.primary.main}
				/>
			</Button>
			<Button
				onClick={endHandler}
				variant='outlined'
				disabled={currentPage == totalPages}
				sx={{ minWidth: 36, width: 40 }}
			>
				<LeftArrowEndIcon
					fontSize={12}
					transform='rotate(180deg)'
					fill={currentPage == totalPages ? palette.action.disabled : palette.primary.main}
				/>
			</Button>
		</Stack>
	)
}
