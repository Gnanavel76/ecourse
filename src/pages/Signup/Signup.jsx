import React from 'react'
import { Button, Form, FloatingLabel, } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import register from "../../assets/images/register.jpg"
import { Formik, ErrorMessage } from 'formik'
// import { useSelector } from 'react-redux'
// import { signup } from '../helper/helper'
import * as Yup from 'yup';
import { toast } from 'react-toastify'
import { account, databases } from '../../appwrite/appwriteConfig'
import { resolvePromise } from '../../util'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/features/auth/authSlice'

const Signup = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const initialValues = {
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    }
    const validationSchema = Yup.object({
        name: Yup.string().trim().required("Name is required").matches(/^[A-Za-z\s]+$/, "Should contain only alphabets").min(3, `Should contain atleast 3 alphabets`).max(20, 'Should not exceed 20 alphabets'),
        email: Yup.string().trim().required("Email is required").email("Invalid email format"),
        mobile: Yup.string().trim().required("Mobile number is required").matches(/^[0-9]+$/, "Must be only digits").min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits').test('len', 'Should not start with 0', val => val ? parseInt(val[0]) > 0 : false),
        password: Yup.string().required("Password is required").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Should contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"),
        confirmPassword: Yup.string().required("Confirm password is required").oneOf([Yup.ref('password'), null], 'Passwords and Confirm Password not matching')
    })

    const onSubmit = async (data, { resetForm }) => {
        const [signupData, signupError] = await resolvePromise(account.create(
            "unique()",
            data.email,
            data.password,
            data.name
        ))
        if (signupError) {
            if (signupError.code === 409 && signupError.type === "user_already_exists") {
                toast.error("Email is already associated with other account")
            } else {
                toast.error(signupError.message)
            }
            return
        }
        const [sessionData, sessionError] = await resolvePromise(account.createEmailSession(data.email, data.password))
        if (sessionError) {
            toast.error(sessionError.message)
            return
        }
        const [emailVerificationData, emailVerificationError] = await resolvePromise(account.createVerification('http://localhost:5173/verify-account'))
        if (emailVerificationError) {
            toast.error(emailVerificationError.message)
            return
        }
        const role = "student"
        const [userData, userError] = await resolvePromise(databases.createDocument(import.meta.env.VITE_APPWRITE_DATABASEID, '63f446c58ed04fcfadea', 'unique()', {
            userId: signupData.$id,
            role
        }))
        if (userError) {
            toast.error(userError.message)
            return
        }
        toast.info("Verification link sent to your email")
        resetForm()
        dispatch(setUser({
            userId: signupData.$id,
            name: signupData.name,
            email: signupData.email,
            emailVerification: signupData.emailVerification,
            userStatus: signupData.userStatus,
            sessionId: sessionData.$id,
            sessionExpiry: sessionData.expire,
            role
        }))
        navigate("/courses")
    }
    return (
        <AuthLayout image={register}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isValid, isSubmitting }) => (
                    <Form onSubmit={handleSubmit} className="user-auth py-5" autoComplete="off">
                        <h3 className="text-center mb-4">Sign Up</h3>
                        <FloatingLabel className="mb-3" controlId="name" label="Full name">
                            <Form.Control type="text" name="name" placeholder="Enter your full name" value={values.name} onChange={handleChange} onBlur={handleBlur} className={`${touched.name && errors.name ? 'field-error' : ''}`} />
                            <ErrorMessage name="name" component="small" className="text-danger" />
                        </FloatingLabel>
                        <FloatingLabel className="mb-3" controlId="email" label="Email">
                            <Form.Control type="email" name="email" placeholder="Enter your email address" value={values.email} onChange={handleChange} onBlur={handleBlur} className={`${touched.email && errors.email ? 'field-error' : ''}`} />
                            <ErrorMessage name="email" component="small" className="text-danger" />
                        </FloatingLabel>
                        <FloatingLabel className="mb-3" controlId="mobile" label="Mobile Number">
                            <Form.Control type="text" name="mobile" placeholder="Enter your mobile number" value={values.mobile} onChange={handleChange} onBlur={handleBlur} className={`${touched.mobile && errors.mobile ? 'field-error' : ''}`} />
                            <ErrorMessage name="mobile" component="small" className="text-danger" />
                        </FloatingLabel>
                        <FloatingLabel className="mb-3" controlId="password" label="Password">
                            <Form.Control type="password" name="password" placeholder="Enter your password" value={values.password} onChange={handleChange} onBlur={handleBlur} className={`${touched.password && errors.password ? 'field-error' : ''}`} />
                            <ErrorMessage name="password" component="small" className="text-danger" />
                        </FloatingLabel>
                        <FloatingLabel className="mb-3" controlId="confirmPassword" label="Confirm Password">
                            <Form.Control type="password" name="confirmPassword" placeholder="Enter your password again" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={`${touched.confirmPassword && errors.confirmPassword ? 'field-error' : ''}`} />
                            <ErrorMessage name="confirmPassword" component="small" className="text-danger" />
                        </FloatingLabel>
                        <Form.Text className="text-dark d-block text-center mb-2">
                            Already have an account? <Link to="/signin" className="text-success">Sign In</Link>
                        </Form.Text>
                        <Form.Text className="text-dark d-block text-center">
                            <Link to="/courses" className="text-success">Explore</Link>
                        </Form.Text>
                        <div className="text-center mt-4">
                            <Button variant="primary" type="submit">
                                Sign Up
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    )
}

export default Signup
