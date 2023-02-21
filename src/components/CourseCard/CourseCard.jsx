import React from "react";
import { Card, Badge } from "react-bootstrap";
// import { ucFirst } from "../helper/helper";
import styles from "./CourseCard.module.css"
const CourseCard = (props) => {
    const { course } = props
    const {
        id,
        img,
        name,
        price,
        discount
    } = course;
    return (
        <Card className="w-100 h-100 rounded-lg shadow-sm py-lg-0 py-4 px-lg-0 px-3">
            <div className={`${styles.course_img_wrapper} px-2 pt-2`}>
                <Card.Img variant="top" src={img} className="rounded-lg h-100" />
            </div>
            <Card.Body>
                <Card.Title as="h6" lines="red" className={`${styles.course_title} ${styles.course_text_color}  mb-3 lh-base`}>{name}</Card.Title>
                <div className="d-flex align-items-center">
                    {discount === 0 &&
                        <Card.Text className={`${styles.course_text} fw-medium me-2`}>
                            Rs.{price}
                        </Card.Text>}

                    {discount !== 0 && (
                        <>
                            <Card.Text as="span" className={`${styles.course_text} fw-medium me-2`}>
                                Rs.{parseFloat(course.price) - parseFloat(course.discount)}
                            </Card.Text>
                            <Card.Text
                                as="span"
                                className="fs-6 original-price text-decoration-line-through text-muted me-2"
                            >
                                Rs.{price}
                            </Card.Text>
                            <Badge className="rounded fw-normal" bg="warning" text="dark">{Math.round((parseFloat(course.discount) / parseFloat(course.price)) * 100)}% OFF</Badge>
                        </>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CourseCard;
