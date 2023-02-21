import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Query } from "appwrite";
import { databases } from "../../../appwrite/appwriteConfig";
import { resolvePromise } from "../../../util";

export const getCourseTags = createAsyncThunk("auth/getCourseTags", async (data, { rejectWithValue }) => {
    const [tagsData, tagsError] = await resolvePromise(databases.listDocuments(import.meta.env.VITE_APPWRITE_DATABASEID, "63f4443420c9bef098c9"))
    if (tagsError) {
        return rejectWithValue(coursesError.message)
    }
    if (tagsData.documents.length < 1) {
        return []
    }
    return tagsData.documents.map(tag => ({ id: tag.$id, label: tag.tag, value: tag.$id }))
})

const initialState = {
    status: "idle",
    data: [],
    error: null
}

const courseTagsSlice = createSlice({
    name: "courseTags",
    initialState,
    reducers: {
        resetcourseTags: (state) => {
            state.status = "idle"
            state.data = []
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getCourseTags.pending, (state) => {
            state.status = "loading"
        })
        builder.addCase(getCourseTags.fulfilled, (state, { payload }) => {
            state.status = "success"
            state.data = payload
            state.error = null
        })
        builder.addCase(getCourseTags.rejected, (state, { payload }) => {
            state.status = "error"
            state.data = []
            state.error = payload
        })
    }
})

export const { resetcourseTags } = courseTagsSlice.actions
export default courseTagsSlice.reducer