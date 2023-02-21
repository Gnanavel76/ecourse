import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Query } from "appwrite";
import { databases, storage } from "../../../appwrite/appwriteConfig";
import { resolvePromise } from "../../../util";

export const getCourse = createAsyncThunk("auth/getCourse", async (courseId, { rejectWithValue }) => {
    const [coursesData, coursesError] = await resolvePromise(databases.getDocument(import.meta.env.VITE_APPWRITE_DATABASEID, "63f444b0dbc07a061e4c", courseId))
    if (coursesError) {
        return rejectWithValue(coursesError.message)
    }

    const course = {
        id: coursesData.$id,
        name: coursesData.name,
        description: coursesData.description,
        price: coursesData.price,
        discount: coursesData.discount,
        validity: coursesData.validity,
        instructors: coursesData.instructors,
        courseStructure: coursesData.courseStructure,
        isActive: coursesData.isActive
    }
    // Fetching Images
    const [courseImg, courseImgError] = await resolvePromise(storage.getFilePreview(import.meta.env.VITE_BUCKET_ID, coursesData.img))
    if (courseImgError) {
        return rejectWithValue(courseImgError.message)
    }
    course["img"] = courseImg.href
    if (coursesData.tags.length > 0) {
        // Fetching Tags
        const [tagsData, tagsError] = await resolvePromise(databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASEID,
            '63f4443420c9bef098c9',
            [
                Query.equal("$id", coursesData.tags)
            ]
        ))
        if (tagsError) {
            return rejectWithValue(tagsError.message)
        }
        course["tags"] = tagsData.documents.map(tag => ({
            id: tag.$id,
            label: tag.tag,
            value: tag.$id
        }))
    } else {
        course["tags"] = []
    }
    return course
})

const initialState = {
    status: "idle",
    data: {},
    error: null
}

const courseSlice = createSlice({
    name: "course",
    initialState,
    reducers: {
        resetCourse: (state) => {
            return initialState
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getCourse.pending, (state) => {
            state.status = "loading"
        })
        builder.addCase(getCourse.fulfilled, (state, { payload }) => {
            state.status = "success"
            state.data = payload
            state.error = null
        })
        builder.addCase(getCourse.rejected, (state, { payload }) => {
            state.status = "error"
            state.data = {}
            state.error = payload
        })
    }
})

export const { resetCourse } = courseSlice.actions
export default courseSlice.reducer