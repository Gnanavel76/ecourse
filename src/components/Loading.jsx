import React from 'react'
import { Container, Spinner } from 'react-bootstrap'

const Loading = () => {
    return (
        <Container fluid className='min-vh-100 d-flex align-items-center justify-content-center'>
            <div className='d-flex flex-column align-items-center'>
                <Spinner animation="border" variant="primary" size='lg' />
                <p className="fs-5 mt-3">Loading...</p>
            </div>
        </Container>
    )
}

export default Loading