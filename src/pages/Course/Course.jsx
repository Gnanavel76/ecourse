import React, { useState, useEffect, useRef } from "react";
import { Badge, Row, Col, Form, Accordion, Card, Button } from "react-bootstrap";
// import Loading from "../components/Loading";
import { Link, Navigate, NavLink, useNavigate, useParams } from "react-router-dom";
// import CoursesSkeleton from "../components/CoursesSkeleton";
// import { useSelector, useDispatch } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { getCourse, resetCourse } from "../../redux/features/course/courseSlice";
import Layout from "../../components/Layout";
import CourseCard from "../../components/CourseCard/CourseCard";
import Avatar from 'react-avatar';
import styles from "../../components/CourseCard/CourseCard.module.css"
import Loading from "../../components/Loading";
import { resolvePromise } from "../../util";
import { databases } from "../../appwrite/appwriteConfig";
import { toast } from "react-toastify";

const Course = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { courseId } = useParams()
    const { status, data: course, error } = useSelector(state => state.course)

    const { userId, role } = useSelector(state => state.auth)
    useEffect(() => {
        dispatch(getCourse(courseId))
        return () => dispatch(resetCourse())
    }, [courseId])

    const disableCourse = async () => {
        const [data, error] = await resolvePromise(databases.updateDocument(import.meta.env.VITE_APPWRITE_DATABASEID, '63f444b0dbc07a061e4c', course.id, { isActive: !course.isActive }))
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success(`Course ${!course.isActive === true ? "enabled" : "disabled"} successfully`)
        dispatch(getCourse(courseId))
    }
    if (!courseId) return <Navigate to="/courses" replace />

    if (status === "idle" || status === "loading") return <Loading />

    if (status === "error") return <h1>{error}</h1>


    return (
        <Layout>
            <Row className="align-items-start">
                <Col lg={9}>
                    <h1 className="mb-1 lh-base fs-2">{course.name}</h1>
                    <div className="mb-4">
                        {
                            course.tags.map((tag, index) => {
                                return (
                                    <Badge key={tag.id} className={`rounded fw-normal ${index === course.tags.length - 1 ? '' : 'me-2'}`} bg="light" text="dark">{tag.label}</Badge>
                                )
                            })
                        }
                    </div>
                    <p className="mb-4 lh-base fs-6">{course.description}</p>
                    {course.courseStructure.length > 0 &&
                        <section>
                            <p className="mb-4 lh-base fs-5 fw-medium">Course Structure</p>
                            <div className="shadow-sm mb-4 rounded-lg overflow-hidden border" >
                                {
                                    course.courseStructure.map((cs, index) => {
                                        return (
                                            <div key={cs} className="py-3 ps-3 pe-1 border">
                                                <p className="mb-0">{index + 1}. {cs}</p>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </section>
                    }
                    {course.instructors.length > 0 && <section>
                        <p className="mb-4 lh-base fs-5 fw-medium">Instructors</p>
                        {
                            course.instructors.map(instructor => {
                                return (
                                    <div key={instructor} className="d-flex align-items-center mb-3">
                                        <Avatar name={instructor} className="rounded-circle" size="45" textSizeRatio={2} />
                                        <p className="ms-3 mb-0 fw-medium">{instructor}</p>
                                    </div>
                                )
                            })
                        }
                    </section>}
                </Col>
                <Col lg={3}>
                    <Card className="border-0 w-100 h-100 rounded-lg shadow py-lg-0 py-4 px-lg-0 px-3">
                        <div className={`${styles.course_img_wrapper} px-2 pt-2`}>
                            <Card.Img variant="top" src={course.img} className="rounded-lg h-100" />
                        </div>
                        <Card.Body>
                            <Card.Subtitle className="mb-2 fs-7">Validity: {course.validity} Days</Card.Subtitle>
                            <div className="d-flex align-items-center mb-4">
                                {course.discount === 0 &&
                                    <Card.Text className={`${styles.course_text} fs-5 fw-medium me-2`}>
                                        Rs.{course.price}
                                    </Card.Text>}

                                {course.discount !== 0 && (
                                    <>
                                        <Card.Text as="span" className={`${styles.course_text} fs-5 fw-medium me-2`}>
                                            Rs.{parseFloat(course.price) - parseFloat(course.discount)}
                                        </Card.Text>
                                        <Card.Text
                                            as="span"
                                            className="text-decoration-line-through text-muted me-2"
                                        >
                                            Rs.{course.price}
                                        </Card.Text>
                                        <Badge className="rounded fw-normal" bg="warning" text="dark">{Math.round((parseFloat(course.discount) / parseFloat(course.price)) * 100)}% OFF</Badge>
                                    </>
                                )}
                            </div>
                            {(!userId || (userId && role === "student")) && <Button as={Link} to={`/order/${courseId}`} className="d-block">Buy Now</Button>}
                            {(userId && role === "admin") &&
                                <>
                                    <Button as={Link} to={`/course/edit/${courseId}`} className="d-block mb-2">Edit Course Details</Button>
                                    <Button variant={course.isActive ? "danger" : "primary"} onClick={disableCourse} className="w-100">{course.isActive ? "Disable Course" : "Enable Course"}</Button>
                                </>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Layout>
    )
};

export default Course;
