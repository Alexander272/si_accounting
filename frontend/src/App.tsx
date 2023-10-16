import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/ru'

import { store } from '@/app/store'
import { AppRouter } from '@/pages/router/AppRouter'
import { theme } from '@/theme/theme'

dayjs.extend(customParseFormat)
dayjs.locale('ru') // глобальная локализация дат

function App() {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AppRouter />
			</ThemeProvider>
		</Provider>
	)
}

export default App
