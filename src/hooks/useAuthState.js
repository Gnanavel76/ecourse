import { Query } from 'appwrite'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { account, databases } from '../appwrite/appwriteConfig'
import { resolvePromise } from '../util'

const useAuthState = () => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        (async () => {
            const [sessionData, sessionError] = await resolvePromise(account.getSession('current'))

            if (sessionError) {
                setError(sessionError)
                setLoading(false)
                return
            }
            const [userData, userError] = await resolvePromise(account.get())

            if (userError) {
                setError(sessionError)
                setLoading(false)
                return
            }
            const [userRoleData, userRoleError] = await resolvePromise(databases.listDocuments(import.meta.env.VITE_APPWRITE_DATABASEID, '63f446c58ed04fcfadea', [
                Query.equal("userId", userData.$id)
            ]))

            if (userRoleError) {
                toast.error(userRoleError.message)
                return
            }
            setData({
                userId: userData.$id,
                name: userData.name,
                email: userData.email,
                emailVerification: userData.emailVerification,
                userStatus: userData.userStatus,
                sessionId: sessionData.$id,
                sessionExpiry: sessionData.expire,
                role: userRoleData.documents[0].role
            })
            setLoading(false)
        })()
    }, [])
    return [loading, data, error]
}

export default useAuthState