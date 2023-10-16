import { type IScrollbarParameters, generateScrollbarStyles } from '@/utils/generateScrollbarStyles'
import { createTheme } from '@mui/material'

const scrollbarParameters: IScrollbarParameters = {
	borderRadius: '5px',
	scrollbarBgColor: '#f2f2f2',
	scrollbarHeight: '.5rem',
	scrollbarWidth: '.5rem',
	thumbColor: '#00000020',
	thumbColorActive: '#00000050',
	thumbColorHover: '#00000030',
}

export const theme = createTheme({
	components: {
		MuiCssBaseline: {
			// styleOverrides: defaultStyles.concat(
			// 	// FontFace.generateFontParameters(fontList),
			// 	generateScrollbarStyles(scrollbarParameters)
			// ),
			styleOverrides: generateScrollbarStyles(scrollbarParameters),
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					border: 'none',
					boxShadow: '0 0 3px #0000004f',
					background: '#fff',
				},
			},
			defaultProps: {
				elevation: 0,
			},
		},
	},
})
