import React, { useState, useEffect, useRef } from "react";
import { Badge, Row, Col, Form } from "react-bootstrap";
// import Base from "../components/Base";
// import Loading from "../components/Loading";
// import "../styles/Courses.css";
// import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";
// import CoursesSkeleton from "../components/CoursesSkeleton";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchCourses,
//   fetchTags,
//   resetFetchCourses,
// } from "../redux/actions/courseAction";
import Select from 'react-select';
import { reactSelectStyles } from '../../ReactSelectStyles';
import InfiniteScroll from "react-infinite-scroll-component";
import Header from "../../components/Header/Header";
import { useDispatch, useSelector } from "react-redux";
import { getCourses, resetCourses } from "../../redux/features/course/coursesSlice";
import Layout from "../../components/Layout";
import CourseCard from "../../components/CourseCard/CourseCard";
import Loading from "../../components/Loading";
import { BiSearch } from "react-icons/bi";
import { getCourseTags } from "../../redux/features/courseTagsSlice/courseTagsSlice";
const Courses = () => {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState([]);
  const dispatch = useDispatch()
  const { status, data, error } = useSelector(state => state.courses)
  const { status: tagsLoading, data: tagsData, error: tagsError } = useSelector(state => state.courseTags)
  const { userId, role } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(getCourseTags())
    dispatch(getCourses({ role }))
    return () => dispatch(resetCourses())
  }, [userId])

  const handleSearch = () => {
    // setPage(1)
    if (search !== "") {
      dispatch(getCourses({ search }));
    } else {
      dispatch(getCourses());
    }
  };

  if ((status === "idle" || status === "loading") || (tagsLoading === "idle" || tagsLoading === "loading")) return <Loading />

  if (status === "error") return <h1>{error}</h1>

  return (
    <Layout>
      <div className="d-flex justify-content-between mb-4">
        <h1 className="fs-2 me-4 mb-0">Courses</h1>
        {(userId && role === "admin") && (
          <Link
            to="/course/create"
            className="btn btn-primary nav-link text-white mb-0"
          >
            Create Course
          </Link>
        )}
      </div>
      <Form.Group
        className="position-relative search-box h-100 mb-lg-4 mb-3"
        controlId="search"
      >
        <button className="btn minw-auto position-absolute end-0 top-50 translate-middle-y" onClick={handleSearch}>
          <BiSearch fontSize={"1.5rem"} />
        </button>
        <Form.Control
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pe-5 h-100 "
          type="text"
          name="search"
          placeholder="Search Course"
        />
      </Form.Group>
      {data.length > 0 ? <Row>
        {data.map((course) => (
          <Col
            key={course.id}
            xl={3}
            lg={4}
            className="course-card mb-lg-4"
          >
            <Link to={`/course/${course.id}`}>
              <CourseCard course={course} />
            </Link>
          </Col>
        ))}
      </Row>
        :
        <p className="fs-4 text-center">
          No courses to show
        </p>
      }
    </Layout>
  )
};

export default Courses;
