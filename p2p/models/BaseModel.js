export const ErrorModel = {
    value: String,
    param: String,
    msg: String,
}

export const ResponseModel = {
    data: any,
    msg: String,
    errors: [],
    success: Boolean,
    status: Number,
}