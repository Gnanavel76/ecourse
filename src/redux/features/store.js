import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./auth/authSlice"
import coursesReducer from "./course/coursesSlice"
import courseReducer from "./course/courseSlice"
import courseTagsReducer from "./courseTagsSlice/courseTagsSlice"
export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: coursesReducer,
        course: courseReducer,
        courseTags: courseTagsReducer
    }
})