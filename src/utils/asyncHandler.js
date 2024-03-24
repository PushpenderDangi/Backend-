/* asyncHandler will make a method and export it and it is a higher order
function means it can accept function as a paramenter or return it
*/

// const asyncHandler = (requestHandler) => {
    // return (req, resp, next) => {
    //     Promise.resolve(requestHandler(req,resp,next)).catch(
    //         (err)=>next(err))
    // }

// }
export {asyncHandler}

const asyncHandler = (fn) => async (req, resp, next) => {
    try{
        await fn(req,resp,next)
    }
    catch (error) {
        // in json there is a success flag and a error message for the frontend developer
        resp.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

