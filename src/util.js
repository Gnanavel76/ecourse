
export const resolvePromise = async (promise) => {
    try {
        const data = await promise
        return [data, null]
    } catch (error) {
        return [null, error]
    }
}

export const handleFileField = (setFieldValue, setFieldTouched, fieldName, setState) => async event => {
    const file = event.target.files[0]
    await setFieldValue(fieldName, event.target.files[0])
    await setFieldTouched(fieldName, true)
    if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            setState(e.target.result)
        }
    } else {
        setState("")
    }
}