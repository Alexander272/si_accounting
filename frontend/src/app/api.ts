const PREFIX = '/api/v1'

export const API = {
	auth: {
		signIn: `${PREFIX}/auth/sign-in`,
		refresh: `${PREFIX}/auth/refresh`,
		signOut: `${PREFIX}/auth/sign-out`,
	},
}
