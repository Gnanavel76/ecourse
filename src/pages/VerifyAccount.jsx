import React, { useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { account } from '../appwrite/appwriteConfig';
import { resolvePromise } from '../util';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const userId = searchParams.get("userId")
    const secret = searchParams.get("secret")
    if (!userId || !secret) return <Navigate to="/signup" />

    useEffect(() => {
        (async () => {
            const [verificationData, verificationError] = await resolvePromise(account.updateVerification(userId, secret));
            if (verificationError) {
                toast.error(verificationError.message)
            } else {
                toast.success("Account verified successfully.")
            }
            navigate("/signin")
        })()
    }, [])
    return (
        <div>Verifying your account...</div>
    )
}

export default VerifyAccount