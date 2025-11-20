import React, { createContext, useContext } from 'react'
import type { User } from '../types'

export interface UserContextType {
	user: User
	setUser: React.Dispatch<React.SetStateAction<User>>
	isAuthenticated: boolean
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const defaultUser: User = { id: '', name: '', email: '', points: 0 }

export const UserContext = createContext<UserContextType>({
	user: defaultUser,
	setUser: (() => {}) as React.Dispatch<React.SetStateAction<User>>,
	isAuthenticated: false,
	setIsAuthenticated: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
})

export const useUserContext = () => {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error('useUserContext must be used within a UserContext.Provider')
	}
	return context
}

// Helper hook to get current user ID
export const useCurrentUserId = () => {
	const { user } = useUserContext()
	return user.id || null
}

// Helper hook to check if user is logged in
export const useIsLoggedIn = () => {
	const { isAuthenticated, user } = useUserContext()
	return isAuthenticated && !!user.id
}

export default UserContext