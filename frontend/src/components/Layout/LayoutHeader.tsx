import { AppBar, Toolbar } from '@mui/material'

export const LayoutHeader = () => {
	return (
		<AppBar sx={{ borderRadius: 0 }}>
			<Toolbar sx={{ justifyContent: 'space-between' }}></Toolbar>
		</AppBar>
	)
}
