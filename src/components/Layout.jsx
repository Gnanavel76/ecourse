import React from 'react'
import { Container } from 'react-bootstrap'
import Header from './Header/Header'

const Layout = (props) => {
    return (
        <>
            <Header />
            <Container as="main" className='py-4'>
                {props.children}
            </Container>
        </>
    )
}

export default Layout
