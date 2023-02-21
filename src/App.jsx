import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup/Signup'
import Course from './pages/Course/Course'
import { ToastContainer } from 'react-toastify'
import "./App.css"
import 'react-toastify/dist/ReactToastify.css';
import Courses from './pages/Courses/Courses'
import OrderSummary from './pages/OrderSummary.jsx/OrderSummary'
import VerifyAccount from './pages/VerifyAccount'
import Signin from './pages/Signin/Signin'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'
import { useDispatch } from 'react-redux'
import { setUser } from './redux/features/auth/authSlice'
import useAuthState from './hooks/useAuthState'
import NewCourse from './pages/NewCourse/NewCourse'
import EditCourse from './pages/EditCourse/EditCourse'
import Home from './pages/Home/Home'
const App = () => {
  const [loading, user] = useAuthState()
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) dispatch(setUser(user))
  }, [user])

  if (loading) return <Loading />
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="dark"
      />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={<Course />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/order/:courseId" element={<OrderSummary />} />
            <Route path="/course/create" element={<NewCourse />} />
            <Route path="/course/edit/:courseId" element={<EditCourse />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App