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

const MAXIMUM_FILE_SIZE = 2097152
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png']

const EditCourse = () => {
    const navigate = useNavigate()
    const [courseImg, setCourseImg] = useState("")
    const [selectedTags, setSelectedTags] = useState([])
    const dispatch = useDispatch()
    const { loading: tagLoading, data: tags, error: tagsError } = useSelector(state => state.courseTags)
    const { userId } = useSelector(state => state.auth)

    useEffect(() => {
        dispatch(getCourseTags())
    }, [])

    if (tagLoading) return <Loading />

    if (tagsError) {
        toast.error(tagsError)
    }

    const initialValues = {
        img: "",
        name: "",
        tags: "",
        description: "",
        validity: 1,
        price: "",
        discount: 0,
        isActive: true,
        syllabus: [{
            title: "",
            description: ""
        }]
    }
    const validationSchema = Yup.object().shape({
        img: Yup.mixed().required("Please select a image").test('fileType', `Only ${SUPPORTED_FORMATS.join(", ")} allowed`, value => value && SUPPORTED_FORMATS.includes(value.type?.split("/")[1])).test('fileSize', `File size exceeds`, value => value && value.size <= MAXIMUM_FILE_SIZE),
        name: Yup.string().required("Course name is required").min(3, "Should contain atleast 3 character").max(100, "Should not exceed 100 character").matches(/^[A-Za-z0-9-_()\s]+$/, "Only A-Z a-z 0-9 - _ ( ) White spaces allowed"),
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
        validity: Yup.number().required("Validity is required").moreThan(-1, "Only positive value accepted"),
        syllabus: Yup.array().of(
            Yup.object().shape({
                title: Yup.string().required("Title is required").min(5, "Atleast 5 characters is required").max(100, "Should not exceed 100 characters").matches(/^[A-Za-z0-9-_():?\s,.]+$/, "Only A-Z a-z 0-9 - _ ( ) : , . ? White space allowed"),
                description: Yup.string().required("Description is required").min(10, "Atleast 10 characters is required").max(300, "Should not exceed 300 characters").matches(/^[A-Za-z0-9-_():?\s,.]+$/, "Only A-Z a-z 0-9 - _ ( ) : , . ? White space allowed")
            })
        )
    })

    const onSubmit = async (data) => {
        const [uploadData, uploadError] = await resolvePromise(storage.createFile(import.meta.env.VITE_BUCKET_ID, 'unique()', data.img))
        if (uploadError) {
            toast.error(uploadError.message)
            return
        }
        const [courseData, courseError] = await resolvePromise(databases.createDocument(import.meta.env.VITE_APPWRITE_DATABASEID, '63f444b0dbc07a061e4c', 'unique()', {
            img: uploadData.$id,
            name: data.name,
            description: data.description,
            price: data.price,
            discount: data.discount,
            validity: data.validity,
            author: [userId],
            tags: selectedTags.map(tag => tag.value)
        }))
        if (courseError) {
            toast.error(courseError.message)
            return
        }
        for (const syllabus of data.syllabus) {
            const [syllabusData, syllabusError] = await resolvePromise(databases.createDocument(import.meta.env.VITE_APPWRITE_DATABASEID, '63f0cd704f175fdad821', 'unique()', {
                title: syllabus.title,
                description: syllabus.description,
                courseId: courseData.$id
            }))
            if (syllabusError) {
                toast.error(syllabusError.message)
                return
            }
        }
        toast.success("Course created successfully")
        navigate("/courses")

    }

    return (
        <Layout>
            {/* <Breadcrumb>
                    {isCourseId
                        ?
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/course/${courseId}` }} className="mb-2"><i className="fas fa-chevron-left me-2"></i> Back to Course</Breadcrumb.Item>
                        :
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/courses" }} className="mb-2"><i className="fas fa-chevron-left me-2"></i> Back to Courses</Breadcrumb.Item>
                    }
                </Breadcrumb> */}
            <h4 className="mb-4-5">Edit course</h4>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
                {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isValid, isSubmitting, setFieldValue, setFieldTouched }) => {
                    return <Form onSubmit={handleSubmit} autoComplete="off">
                        <Form.Group controlId="formFile" className="mb-4-5 text-center">
                            <Form.Label className="mb-3">Course Image</Form.Label>
                            <OverlayTrigger placement="right" overlay={<Tooltip id="button-tooltip" delay={{ show: 250, hide: 400 }} >Choose image of size 500 by 300 pixels for better view.</Tooltip>}>
                                <div className="input-img-container mb-1 mx-auto">
                                    {
                                        courseImg && !errors.img ?
                                            <img src={courseImg} alt="Course Image" className="input-img w-100 h-100" />
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
                                    value={selectedTags}
                                    onChange={(value) => setSelectedTags(value)}
                                    options={tags}
                                    isMulti={true}
                                    styles={reactSelectStyles}
                                    placeholder="Select Tags"
                                    isSearchable={false}
                                />
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
                            <h5 className="mb-4">Course Structure</h5>
                            <FieldArray name="syllabus"
                                render={arrayHelpers => {
                                    const { syllabus } = arrayHelpers.form.values
                                    return <>
                                        {syllabus?.length > 0 && syllabus.map((syllab, index) =>
                                            <div key={index} className={`fieldset ${index == (syllabus.length - 1) ? 'mb-4' : 'mb-5'}`}>
                                                <p className="legend">Chapter {index + 1}</p>
                                                <FloatingLabel controlId="question" label="Title" className="mb-3">
                                                    <Form.Control type="text" placeholder="Title" name={`syllabus[${index}].title`} value={`${syllabus[index].title}`} onChange={handleChange} onBlur={handleBlur} className={`${touched.syllabus?.[index]?.title && errors.syllabus?.[index]?.title ? 'field-error' : ''}`} />
                                                    <ErrorMessage name={`syllabus[${index}].title`} component="small" className="text-danger" />
                                                </FloatingLabel>
                                                <FloatingLabel controlId="description" label="Description" className="mb-2">
                                                    <Form.Control as="textarea" placeholder="Description" name={`syllabus[${index}].description`} value={`${syllabus[index].description}`} onChange={handleChange} onBlur={handleBlur} className={`${touched.syllabus?.[index]?.description && errors.syllabus?.[index]?.description ? 'field-error' : ''}`} />
                                                    <ErrorMessage name={`syllabus[${index}].description`} component="small" className="text-danger" />
                                                </FloatingLabel>
                                                <button type="button" onClick={() => arrayHelpers.remove(index)} className="fw-bold btn py-0 px-1 text-danger minw-auto">Remove</button>
                                            </div>
                                        )}
                                        <button type="button" onClick={() => arrayHelpers.push({ title: "", description: "" })} className="fw-bold btn py-0 px-1 text-success minw-auto mb-4">Add Chapter</button>
                                    </>
                                }}
                            />
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                            <Button variant="primary" type="submit" disabled={!isValid || isSubmitting}>
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
