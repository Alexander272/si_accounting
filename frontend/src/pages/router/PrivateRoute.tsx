// import { Navigate, useLocation } from 'react-router-dom'
// import { useAppSelector } from '@/hooks/redux'

// проверка авторизации пользователя
export default function PrivateRoute({ children }: { children: JSX.Element }) {
	//TODO вернуть проверку
	// const isAuth = useAppSelector(state => state.user.isAuth)
	// const location = useLocation()

	// if (!isAuth) return <Navigate to='/auth' state={{ from: location }} />

	return children
}
