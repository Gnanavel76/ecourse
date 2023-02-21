import React from 'react'
import { Container, Row, Image, Col } from 'react-bootstrap'

const AuthLayout = (props) => {
    return (
        <Container>
            <Row className="min-vh-100 row align-items-center">
                <Col lg={7} className="d-none d-lg-block">
                    <Image fluid src={props.image} className="w-75" />
                </Col>
                <Col lg={5}>
                    {props.children}
                </Col>
            </Row>
        </Container>
    )
}

export default AuthLayout
