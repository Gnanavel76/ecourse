import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import { reactSelectStyles } from '../../ReactSelectStyles';
import { Form, Button, FloatingLabel, Row, Col, Toast, Breadcrumb, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Formik, ErrorMessage, FieldArray } from 'formik'
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { BsImage } from "react-icons/bs";
import { handleFileField, resolvePromise } from '../../util';
import { getCourseTags } from '../../redux/features/courseTagsSlice/courseTagsSlice';
import { toast } from 'react-toastify';
import { databases, storage } from '../../appwrite/appwriteConfig';
import { getCourse } from '../../redux/features/course/courseSlice';

const MAXIMUM_FILE_SIZE = 2097152
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png']

const EditCourse = () => {
    const navigate = useNavigate()
    const { courseId } = useParams()
    const [courseImg, setCourseImg] = useState("")
    const dispatch = useDispatch()
    const { status: tagLoading, data: tags, error: tagsError } = useSelector(state => state.courseTags)
    const { userId } = useSelector(state => state.auth)
    const { status: courseLoading, data: course, error: courseError } = useSelector(state => state.course)
    useEffect(() => {
        dispatch(getCourseTags())
        dispatch(getCourse(courseId))
    }, [])

    if ((tagLoading === "idle" || tagLoading === "loading") || (courseLoading === "idle" || courseLoading === "loading")) return <Loading />

    if (tagLoading === "error") {
        toast.error(tagsError)
    }
    if (courseLoading === "error") {
        toast.error(courseError)
    }
    const formValues = {
        img: "",
        name: course.name,
        tags: course.tags,
        description: course.description,
        validity: course.validity,
        price: course.price,
        discount: course.discount,
        instructors: course.instructors,
        courseStructure: course.courseStructure,
    }

    const validationSchema = Yup.object().shape({
        img: Yup.mixed().nullable().notRequired()
            .when('img', {
                is: (value) => value && value !== "",
                then: (schema) => schema.test('fileType', `Only ${SUPPORTED_FORMATS.join(", ")} allowed`, value => value && SUPPORTED_FORMATS.includes(value.type?.split("/")[1])).test('fileSize', `File size exceeds`, value => value?.size <= MAXIMUM_FILE_SIZE)
            }),
        name: Yup.string().required("Course name is required").min(3, "Should contain atleast 3 character").max(100, "Should not exceed 100 character").matches(/^[A-Za-z0-9-_()\s]+$/, "Only A-Z a-z 0-9 - _ ( ) White spaces allowed"),
        tags: Yup.array().min(1, "Tag is required"),
        description: Yup.string().required("Description should not be empty").min(10, "Should contain atleast 10 character").max(500, "Should not exceed 500 character").matches(/^[A-Za-z0-9-_():\s.,?']+$/, "Only A-Z a-z 0-9 - _ ( ' ) . , : ?White space allowed"),
        price: Yup.number().required("Price is required").moreThan(0, "Only positive value accepted"),
        discount: Yup.number().nullable().notRequired().moreThan(-1, "Only positive value accepted").test("DISCOUNT_VALIDATION", "Discount must be 0 or less than or equal to course price", function (value) {
            const price = this.parent.price
            const discount = value
            if (price > 0 && discount <= price) {
                return true
            } else if (!price && discount == 0) {
                return true
            }
        }),
        instructors: Yup.array().of(Yup.string().trim().required("Author name is required").matches(/^[A-Za-z\s]+$/, "Only A-Z a-z White spaces allowed").max(30, "Should not exceed 30 characters")),
        validity: Yup.number().required("Validity is required").moreThan(-1, "Only positive value accepted"),
        courseStructure: Yup.array().of(Yup.string().trim().required("Chapter name is required").matches(/^[A-Za-z0-9-_():\s.,?']+$/, "Only A-Z a-z 0-9 - _ ( ' ) . , : ? White space allowed").max(100, "Should not exceed 100 characters")),
    }, ["img", "img"])

    const onSubmit = async (data) => {
        const updatedCourseData = {
            name: data.name,
            description: data.description,
            price: data.price,
            discount: data.discount,
            validity: data.validity,
            instructors: data.instructors,
            tags: data.tags.map(tag => tag.value),
            courseStructure: data.courseStructure
        }
        if (data.img) {
            const [uploadData, uploadError] = await resolvePromise(storage.createFile(import.meta.env.VITE_BUCKET_ID, 'unique()', data.img))
            if (uploadError) {
                toast.error(uploadError.message)
                return
            }
            updatedCourseData["img"] = uploadData.$id
        }
        const [courseData, courseError] = await resolvePromise(databases.updateDocument(import.meta.env.VITE_APPWRITE_DATABASEID, '63f444b0dbc07a061e4c', courseId, updatedCourseData))
        if (courseError) {
            toast.error(courseError.message)
            return
        }
        toast.success("Course update successfully")
        navigate("/courses")

    }
    return (
        <Layout>
            {/* <Breadcrumb>
                    {isCourseId
                        ?
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/ course / ${ courseId }` }} className="mb-2"><i className="fas fa-chevron-left me-2"></i> Back to Course</Breadcrumb.Item>
                        :
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/courses" }} className="mb-2"><i className="fas fa-chevron-left me-2"></i> Back to Courses</Breadcrumb.Item>
                    }
                </Breadcrumb> */}
            <h4 className="mb-4-5">Edit course</h4>
            <Formik initialValues={formValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
                {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isValid, isSubmitting, setFieldValue, setFieldTouched }) => {
                    return <Form onSubmit={handleSubmit} autoComplete="off">
                        <Form.Group controlId="formFile" className="mb-4-5 text-center">
                            <Form.Label className="mb-3">Course Image</Form.Label>
                            <OverlayTrigger placement="right" overlay={<Tooltip id="button-tooltip" delay={{ show: 250, hide: 400 }} >Choose image of size 300 by 200 pixels for better view.</Tooltip>}>
                                <div className="input-img-container mb-1 mx-auto">
                                    {
                                        course.img && !errors.img ?
                                            <img src={courseImg || course.img} alt="Course Image" className="input-img w-100 h-100" />
                                            :
                                            <BsImage className='input-img-placeholder' />
                                    }
                                    <Form.Control className="stretch-element w-100 h-100" type="file" name="file" onChange={handleFileField(setFieldValue, setFieldTouched, "img", setCourseImg)} />
                                </div>
                            </OverlayTrigger>
                            <ErrorMessage name="img" className="text-danger" component="small" />
                        </Form.Group>
                        <FloatingLabel controlId="name" label="Course name" className="mb-4-5">
                            <Form.Control type="text" placeholder="Course name" value={values.name} onChange={handleChange} onBlur={handleBlur} className={`${touched.name && errors.name ? 'field-error' : ''}`} />
                            <ErrorMessage component="small" className="text-danger" name="name" />
                        </FloatingLabel>
                        <FloatingLabel controlId="description" label="Description" className="mb-4-5">
                            <Form.Control as="textarea" placeholder="Description" value={values.description} onChange={handleChange} onBlur={handleBlur} className={`${touched.description && errors.description ? 'field-error' : ''}`} />
                            <ErrorMessage component="small" className="text-danger" name="description" />
                        </FloatingLabel>
                        <Row>
                            <Col md={6} className="mb-4-5">
                                <Select
                                    value={values.tags}
                                    onChange={(value) => setFieldValue("tags", value)}
                                    options={tags}
                                    isMulti={true}
                                    styles={reactSelectStyles}
                                    placeholder="Select Tags"
                                    isSearchable={false}
                                />
                                <ErrorMessage component="small" className="text-danger" name="tags" />
                            </Col>
                            <Col md={6}>
                                <FloatingLabel controlId="validity" label="Validity (In Days)" className="mb-4-5">
                                    <Form.Control type="number" onWheel={(e) => e.target.blur()} placeholder="Expiry Date" name="validity" value={values.validity} onChange={handleChange} onBlur={handleBlur} className={`${touched.validity && errors.validity ? 'field-error' : ''}`} />
                                    <ErrorMessage component="small" className="text-danger" name="validity" />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel controlId="price" label="Price" className="mb-4-5">
                                    <Form.Control disabled={values.isFree} type="number" name="price" onWheel={(e) => e.target.blur()} placeholder="Price" value={values.price} onChange={handleChange} onBlur={handleBlur} className={`${touched.price && errors.price ? 'field-error' : ''}`} />
                                    <ErrorMessage component="small" className="text-danger" name="price" />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel controlId="discount" label="Discount" className="mb-4-5">
                                    <Form.Control disabled={values.isFree} type="number" onWheel={(e) => e.target.blur()} placeholder="Discount" name="discount" value={values.discount} onChange={handleChange} onBlur={handleBlur} className={`${touched.discount && errors.discount ? 'field-error' : ''}`} />
                                    <ErrorMessage component="small" className="text-danger" name="discount" />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <hr />
                        <div className="pt-3 mb-4">
                            <h5 className="mb-4">Authors</h5>
                            <FieldArray name="instructors"
                                render={arrayHelpers => {
                                    const { instructors } = arrayHelpers.form.values
                                    return <>
                                        {instructors.length > 0 && instructors.map((instructor, index) =>
                                            <div key={index} className={`fieldset ${index == (instructors.length - 1) ? 'mb-3' : 'mb-4'}`}>
                                                <p className="legend">Instructor {index + 1}</p>
                                                <FloatingLabel controlId="instructor" label="Instructor name" className="mb-3">
                                                    <Form.Control type="text" placeholder="Name" name={`instructors[${index}]`} value={`${instructors[index]}`} onChange={handleChange} onBlur={handleBlur} className={`${touched.instructors?.[index] && errors.instructors?.[index] ? 'field-error' : ''}`} />
                                                    <ErrorMessage name={`instructors[${index}]`} component="small" className="text-danger" />
                                                </FloatingLabel>
                                                {index > 0 && <button type="button" onClick={() => arrayHelpers.remove(index)} className="fw-bold btn py-0 px-1 text-danger minw-auto">Remove</button>}
                                            </div>
                                        )}
                                        <button type="button" onClick={() => arrayHelpers.push('')} className="fw-bold btn py-0 px-1 text-success minw-auto mb-4">Add more Instructor</button>
                                    </>
                                }}
                            />
                        </div>
                        <hr />
                        <div className="pt-3 mb-4">
                            <h5 className="mb-4">Course Structure</h5>
                            <FieldArray name="courseStructure"
                                render={arrayHelpers => {
                                    const { courseStructure } = arrayHelpers.form.values
                                    return <>
                                        {courseStructure.length > 0 && courseStructure.map((instructor, index) =>
                                            <div key={index} className={`fieldset ${index == (courseStructure.length - 1) ? 'mb-3' : 'mb-4'}`}>
                                                <p className="legend">Chapter {index + 1}</p>
                                                <FloatingLabel controlId="courseStructure" label="Chapter name" className="mb-3">
                                                    <Form.Control type="text" placeholder="Chapter name" name={`courseStructure[${index}]`} value={`${courseStructure[index]}`} onChange={handleChange} onBlur={handleBlur} className={`${touched.courseStructure?.[index] && errors.courseStructure?.[index] ? 'field-error' : ''}`} />
                                                    <ErrorMessage name={`courseStructure[${index}]`} component="small" className="text-danger" />
                                                </FloatingLabel>
                                                {index > 0 && <button type="button" onClick={() => arrayHelpers.remove(index)} className="fw-bold btn py-0 px-1 text-danger minw-auto">Remove</button>}
                                            </div>
                                        )}
                                        <button type="button" onClick={() => arrayHelpers.push('')} className="fw-bold btn py-0 px-1 text-success minw-auto mb-4">Add more course structure</button>
                                    </>
                                }}
                            />
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </div>
                    </Form>
                }}
            </Formik>
        </Layout>
    )
}

export default EditCourse
