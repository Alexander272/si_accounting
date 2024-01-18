import { FC, PropsWithChildren, useRef, useState } from 'react'
import { Box, Button, Popover, Stack } from '@mui/material'

type Props = {
	onClick: () => void
}

export const Confirm: FC<PropsWithChildren<Props>> = ({ children, onClick }) => {
	const [open, setOpen] = useState(false)
	const anchor = useRef<HTMLButtonElement>(null)

	const toggleHandler = () => setOpen(prev => !prev)

	const confirmHandler = () => {
		toggleHandler()
		onClick()
	}

	return (
		<>
			<Button ref={anchor} onClick={toggleHandler} variant='contained' color='error' fullWidth>
				Удалить
			</Button>

			<Popover
				open={open}
				anchorEl={anchor.current}
				onClose={toggleHandler}
				anchorOrigin={{
					vertical: 'center',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				// sx={{ mt: 1 }}
			>
				<Stack spacing={2} paddingX={2} paddingY={1.2}>
					<Box>{children}</Box>

					<Stack direction='row' spacing={2}>
						<Button onClick={confirmHandler} variant='contained' color='error' fullWidth>
							Да
						</Button>
						<Button onClick={toggleHandler} variant='outlined' fullWidth>
							Отмена
						</Button>
					</Stack>
				</Stack>
			</Popover>
		</>
	)
}
