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
			all: 'si/verifications/all',
		},
		location: {
			base: 'si/locations',
			all: 'si/locations/all',
		},
		documents: {
			base: 'si/verifications/documents',
		},
		export: 'files',
		schedule: 'files/schedule',
		base: 'si',
		save: 'si/save',
	},
	departments: '/departments',
	employees: '/employees',
}
