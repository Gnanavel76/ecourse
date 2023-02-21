import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthState from '../hooks/useAuthState'
import Loading from './Loading'

const ProtectedRoute = (props) => {
    const [loading, user, error] = useAuthState()
    const { Component } = props
    if (loading) return <Loading />
    if (error || !user) return <Navigate to="/signin" replace />
    return <Outlet />
}

export default ProtectedRoute