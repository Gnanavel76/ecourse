import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getCourse, resetCourse } from '../../redux/features/course/courseSlice'
import styles from "./OrderSummary.module.css"
import useDisclosure from "../../hooks/useDisclosure"
import { resolvePromise } from '../../util'
import { databases } from '../../appwrite/appwriteConfig'
import { Query } from 'appwrite'
import { toast } from 'react-toastify'
import Loading from '../../components/Loading'
const OrderSummary = () => {
    const { courseId } = useParams()
    const dispatch = useDispatch()
    const { status, data: course, error } = useSelector(state => state.course)
    const [openCouponModal, onOpenCouponModal, onCloseCouponModal] = useDisclosure()
    const [coupon, setCoupon] = useState({
        couponCode: "",
        couponValue: '',
        couponError: ""
    });
    useEffect(() => {
        dispatch(getCourse(courseId))
        return () => dispatch(resetCourse())
    }, [courseId])

    const applyCoupon = async () => {
        setCoupon({ ...coupon, couponError: "" })
        const [couponData, couponError] = await resolvePromise(databases.listDocuments(import.meta.env.VITE_APPWRITE_DATABASEID, "63f445ee1fe922dbe914", [
            Query.equal("code", coupon.couponCode),
            Query.equal("isActive", true)
        ]))
        if (couponError) {
            toast.error(couponError.message)
            return
        }
        if (couponData.documents.length < 1) {
            setCoupon({ ...coupon, couponError: "Coupon code not found" })
            return
        }
        if (new Date() >= new Date(couponData.documents[0].expiry)) {
            setCoupon({ ...coupon, couponError: `Coupon code expired` })
            return
        }
        if (parseFloat(course.discountedPrice) < parseFloat(couponData.documents[0].minPrice)) {
            setCoupon({ ...coupon, couponError: `Course price must be atleast ${couponData.documents[0].minPrice}` })
            return
        }
        setCoupon({ ...coupon, couponValue: couponData.documents[0].value })
        onCloseCouponModal()
    }

    const removeCoupon = () => {
        setCoupon({
            couponCode: "",
            couponValue: '',
            couponError: ""
        })
    }

    if (!courseId) return <Navigate to="/courses" replace />

    if (status === "idle" || status === "loading") return <Loading />

    if (status === "error") return <h1>Error</h1>

    return (
        <Layout>
            <Row>
                <Col lg={8}>
                    <Card className="border-0">
                        <Card.Title className="fs-2 mb-5">Order Sumamry</Card.Title>
                        <div className="d-flex pb-5 mb-5 border-bottom">
                            <Card.Img className={`me-3 rounded-lg ${styles.card_img_top}`} variant="top" src={course.img} />
                            <div>
                                <Card.Title className="py-1 mb-2">{course.name}</Card.Title>
                                <Card.Text>Validity: {course.validity} Days</Card.Text>
                            </div>
                        </div>
                        <Button variant="primary" className="rounded-pill py-2 mb-lg-0 mb-5 mx-auto" onClick={() => { }}>Pay Securely</Button>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-5">Order Details</Card.Title>
                            <Card.Text className="d-flex justify-content-between align-items-center">
                                <span>Price</span>
                                <span>Rs.{course.price}</span>
                            </Card.Text>
                            <Card.Text className="d-flex justify-content-between align-items-center">
                                <span>Discount</span>
                                <span className="text-danger">- Rs.{course.discount}</span>
                            </Card.Text>
                            <div className="mb-3 d-flex justify-content-between align-items-center">
                                <span>Coupon Discount</span>
                                {coupon.couponValue ?
                                    <>
                                        <div className="text-danger text-end">
                                            <span>- Rs.{coupon.couponValue}</span>
                                            <Button onClick={removeCoupon} className={`${styles.coupon_btn} text-danger bg-transparent btn p-0 nav-link`}>Remove Coupon</Button>
                                        </div>
                                    </>
                                    :
                                    <Button onClick={onOpenCouponModal} className={`${styles.coupon_btn} bg-transparent btn p-0 nav-link`}>Apply Coupon</Button>
                                }
                            </div>
                            <Card.Text className="d-flex justify-content-between align-items-center">
                                <span>Total</span>
                                <span>Rs.{coupon.couponValue ? ((parseFloat(course.price) - parseFloat(course.discount)) - parseFloat(coupon.couponValue)) : parseFloat(course.price) - parseFloat(course.discount)}</span>
                            </Card.Text>
                            <hr />
                            <Card.Text className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Total</span>
                                <span className="fw-bold">Rs.{coupon.couponValue ? ((parseFloat(course.price) - parseFloat(course.discount)) - parseFloat(coupon.couponValue)) : parseFloat(course.price) - parseFloat(course.discount)}</span>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Modal show={openCouponModal} onHide={onCloseCouponModal} centered>
                <Modal.Header className="border-bottom-0">
                    <Modal.Title>Apply Coupon</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Coupon Code</Form.Label>
                        <Form.Control type="text" className="mb-1" placeholder="Enter Coupon Code" value={coupon.couponCode} onChange={(event) => setCoupon({ ...coupon, couponCode: event.target.value })} />
                        <span className="text-danger">{coupon.couponError}</span>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-top-0">
                    <button className="modal-close btn nav-link" onClick={onCloseCouponModal}>Close</button>
                    <Button onClick={applyCoupon} variant="primary">Apply</Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    )
}

export default OrderSummary