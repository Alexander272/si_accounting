import { AppBar, Box, Toolbar } from '@mui/material'

export const LayoutHeader = () => {
	return (
		<AppBar>
			<Toolbar sx={{ justifyContent: 'space-between' }}>
				<Box height={'40px'}></Box>
			</Toolbar>
		</AppBar>
	)
}
