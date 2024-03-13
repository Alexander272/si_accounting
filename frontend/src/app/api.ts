export const API = {
	auth: {
		signIn: `auth/sign-in`,
		refresh: `auth/refresh`,
		signOut: `auth/sign-out`,
	},
	si: {
		instruments: {
			base: 'si/instruments',
		},
		verification: {
			base: 'si/verifications',
		},
		location: {
			base: 'si/locations',
			all: 'si/locations/all',
		},
		base: 'si',
		save: 'si/save',
	},
	departments: '/departments',
	employees: '/employees',
}
