import React from 'react'
import { Col, Image, Row } from 'react-bootstrap'
import Layout from '../../components/Layout'
import homeImg from "../../assets/images/hero.png"
const Home = () => {
    return (
        <Layout>
            <Row className='py-5 align-items-center'>
                <Col md={6}>
                    <h1 className='mb-3'>Tutor</h1>
                    <p className="mb-3 fs-5 lh-lg">
                        High Quality Course at Affordable prices. We are latest in tech and highest in quality. Trusted by 100,000 Student and Professionals.
                    </p>
                </Col>
                <Col md={6}>
                    <Image src={homeImg} className="img-fluid" />
                </Col>
            </Row>
        </Layout>
    )
}

export default Home