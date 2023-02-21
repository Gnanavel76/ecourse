import React from 'react'
import { Form, Button, FloatingLabel, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, ErrorMessage } from 'formik'
import * as Yup from "yup"
import AuthBase from '../../components/AuthLayout'
import login from "../../assets/images/login.jpg"
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/features/auth/authSlice'
import { resolvePromise } from '../../util'
import { account, databases } from '../../appwrite/appwriteConfig'
import { toast } from 'react-toastify'
import { Query } from 'appwrite'

const Signin = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const initialValues = {
        email: "",
        password: ""
    }
    const onSubmit = async (data, { resetForm }) => {
        const [sessionData, sessionError] = await resolvePromise(account.createEmailSession(data.email, data.password))
        if (sessionError) {
            toast.error(sessionError.message)
            return
        }
        const [userData, userError] = await resolvePromise(account.get())
        if (userError) {
            toast.error(userError.message)
            return
        }
        const [userRoleData, userRoleError] = await resolvePromise(databases.listDocuments(import.meta.env.VITE_APPWRITE_DATABASEID, '63f446c58ed04fcfadea', [
            Query.equal("userId", userData.$id)
        ]))
        if (userRoleError) {
            toast.error(userRoleError.message)
            return
        }
        resetForm()
        dispatch(setUser({
            userId: userData.$id,
            name: userData.name,
            email: userData.email,
            emailVerification: userData.emailVerification,
            userStatus: userData.userStatus,
            sessionId: sessionData.$id,
            sessionExpiry: sessionData.expire,
            role: userRoleData.documents[0].role
        }))
        navigate("/courses")
    }
    const validationSchema = Yup.object({
        email: Yup.string().required("Email is required").email("Invalid email format"),
        password: Yup.string().required("Password is required")
    })
    return (
        <AuthBase image={login}>
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                {({ values, handleSubmit, handleBlur, handleChange, errors, touched }) => (
                    <Form onSubmit={handleSubmit} className="user-auth py-5" autoComplete="off">
                        <h3 className="text-center mb-4">Sign In</h3>
                        <FloatingLabel className="mb-4" controlId="email" label="Email">
                            <Form.Control type="email" name="email" placeholder="Enter your email address" value={values.email} onChange={handleChange} onBlur={handleBlur} className={`${touched.email && errors.email ? "field-error" : ""}`} />
                            <ErrorMessage name="email" component="small" className="text-danger" />
                        </FloatingLabel>
                        <FloatingLabel className="mb-4" controlId="password" label="Password">
                            <Form.Control type="password" name="password" placeholder="Enter your password" value={values.password} onChange={handleChange} onBlur={handleBlur} className={`${touched.password && errors.password ? "field-error" : ""}`} />
                            <ErrorMessage name="password" component="small" className="text-danger" />
                        </FloatingLabel>
                        <Form.Text className="text-dark d-block text-center mb-2">
                            Don't have an account? <Link to="/signup" className="text-success">Sign Up</Link>
                        </Form.Text>
                        <Form.Text className="text-dark d-block text-center">
                            <Link to="/courses" className="text-success">Explore</Link>
                        </Form.Text>
                        <div className="text-center mt-4">
                            <Button variant="primary" type="submit">
                                Sign In
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthBase>
    )
}

export default Signin
