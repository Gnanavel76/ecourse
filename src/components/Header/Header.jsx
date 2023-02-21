import React from 'react'
import Avatar from 'react-avatar'
import { Navbar, Container, Nav, NavDropdown, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { account } from '../../appwrite/appwriteConfig'
import useAuthState from '../../hooks/useAuthState'
import { resetUser } from '../../redux/features/auth/authSlice'
import { resolvePromise } from '../../util'
import Loading from '../Loading'
import "./Header.css"
// import { signout } from '../helper/helper'
// import "../styles/Menu.css"
const currentTab = (history, path) => {
    if (history?.location.pathname === path) {
        return "active"
    } else {
        return ""
    }
}
const Header = ({ history }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { userId, name, emailVerification, role } = useSelector(state => state.auth)

    const logout = async () => {
        const [sessionDeleteData, sessionDeleteError] = await resolvePromise(account.deleteSession('current'))
        if (sessionDeleteError) {
            toast.error("Something went wrong!")
            return
        }
        dispatch(resetUser())
        toast.info("Logged out successfully. Come back soon!")
        navigate("/signin")
    }

    return (
        <header>
            {(userId && !emailVerification) && <Alert variant="warning" className='mb-0 py-2 rounded-0 text-center'>
                <p className='mb-0 fs-7 fw-medium'>Complete your account verification!</p>
            </Alert>}
            <Navbar sticky="top" collapseOnSelect expand="lg" className="main-navbar py-2 shadow-sm" variant="light">
                <Container>
                    <Link to="/" className="navbar-brand">Tutor</Link>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            <NavLink to="/" className={`nav-link me-lg-5 ${currentTab(history, "/")}`}>
                                Home
                            </NavLink>
                            <NavLink to="/courses" className={`nav-link me-lg-5 ${currentTab(history, "/courses")}`}>
                                Courses
                            </NavLink>
                            {userId ?
                                <NavDropdown title={<Avatar name={name} className="rounded-circle" size="40" textSizeRatio={2} />}>
                                    <button onClick={logout} className="btn dropdown-item">Log Out</button>
                                </NavDropdown>
                                :
                                <>
                                    <Link to="/signin" className="btn btn-primary rounded-pill text-center">Sign In</Link>
                                </>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default Header
