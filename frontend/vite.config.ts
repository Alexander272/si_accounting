import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const plugins = [react()]
export default defineConfig({
	plugins: plugins,
	resolve: {
		alias: [
			{
				find: '@',
				replacement: path.resolve(__dirname, 'src'),
			},
		],
	},
	server: {
		proxy: {
			'/api': 'http://localhost:9000',
		},
	},
	build: {
		target: 'es2015',
	},
})
