import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async(req,res) =>{
    // res.status(200).json({
    //     message: "meraaa naam shobhit.................."
    // })
    

    //get details from frontend
    //validation -not empty
    //check if user already exists  : username,email
    //check for images ,check for avtar
    //upload them to cloudinary,avatar
    //create user object - create entry in database
    //remove password and referesh token field from response
    //check for user creation
    //return res

    const {username,email,password,fullName} = req.body
    console.log(email);

    // if(fullName === ""){
    //       throw new ApiError(400,"full name is required")
    // }

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Already exist")
    }


    //  const avatarLocalPath = req.files?avatar[0]?path
    //  const coverImageLocalPath = req.files?coverImage[0]?path

    // Check for images, check for avatar
    const avatarLocalPath = req.files ? (req.files.avatar ? req.files.avatar[0].path : null) : null;
    const coverImageLocalPath = req.files ? (req.files.coverImage ? req.files.coverImage[0].path : null) : null;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"somethinh went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully")
    )
})



export {registerUser}


//========================
// const registerUser = async (req, res, next) => {
//     try {
//         res.status(200).json({
//             message: "meraaa naam shobhituuuuuuuuuyyyyyyyyyy"
//         });
//     } catch (error) {
//         next(error); // Manually pass the error to the error handler
//     }
// };
//=========================
