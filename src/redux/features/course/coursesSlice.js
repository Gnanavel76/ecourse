import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Query } from "appwrite";
import { databases, storage } from "../../../appwrite/appwriteConfig";
import { resolvePromise } from "../../../util";

export const getCourses = createAsyncThunk("auth/getCourses", async (data = {}, { rejectWithValue }) => {
    const queries = []
    if (data.role && data.role !== "admin") {
        queries.push(Query.equal("isActive", true))
    }
    if (data.search && data.search !== "") {
        queries.push(Query.search("name", data.search))
    }

    const [coursesData, coursesError] = await resolvePromise(databases.listDocuments(import.meta.env.VITE_APPWRITE_DATABASEID, "63f444b0dbc07a061e4c", queries))
    if (coursesError) {
        return rejectWithValue(coursesError.message)
    }
    if (coursesData.documents.length < 1) {
        return []
    }

    const courses = []

    for (const course of coursesData.documents) {
        const courseObj = {
            id: course.$id,
            name: course.name,
            description: course.description,
            price: course.price,
            discount: course.discount
        }
        // Fetching Images
        const [courseImg, courseImgError] = await resolvePromise(storage.getFilePreview(import.meta.env.VITE_BUCKET_ID, course.img))
        if (courseImgError) {
            return rejectWithValue(courseImgError.message)
        }
        courseObj["img"] = courseImg.href
        courses.push(courseObj)
    }
    return courses
})

const initialState = {
    status: "idle",
    data: [],
    error: null
}

const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        resetCourses: (state) => {
            state.status = "idle"
            state.data = []
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getCourses.pending, (state) => {
            state.status = "loading"
        })
        builder.addCase(getCourses.fulfilled, (state, { payload }) => {
            state.status = "success"
            state.data = payload
            state.error = null
        })
        builder.addCase(getCourses.rejected, (state, { payload }) => {
            state.status = "error"
            state.data = []
            state.error = payload
        })
    }
})

export const { resetCourses } = coursesSlice.actions
export default coursesSlice.reducer