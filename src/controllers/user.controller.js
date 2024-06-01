import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshToken = async (userId)=>{
    try {
        const user = await User.findById(userId) //user mei saari propertiess
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) //save refreshToken in database
        return {accessToken,refreshToken}

        //refresh token ko database mei daalna haiii
    } catch (error) {
        throw new ApiError(500,"smth went wrong while refresh and access token")
        
    }
}
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
    console.log("-----------");
    console.log(email);
    console.log(req.body);
    console.log("-----------");

    // if(fullName === ""){
    //       throw new ApiError(400,"full name is required")
    // }

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await  User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Already exist")
    }

    console.log(req.files);


    //  const avatarLocalPath = req.files?avatar[0]?path
    //  const coverImageLocalPath = req.files?coverImage[0]?path

    // Check for images, check for avatar
    const avatarLocalPath = req.files ? (req.files.avatar ? req.files.avatar[0].path : null) : null;
    //const coverImageLocalPath = req.files ? (req.files.coverImage ? req.files.coverImage[0].path : null) : null;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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

const loginUser =  asyncHandler( async (req,res)=>{
     //req body se data
     // username or email se login
     // find the user
     // password check
     // if correct access and referesh token generate
     //send cookie
     //send response

     const {username,email,password} = req.body
     console.log(req.body);
     console.log("name is" ,email);

    //  if(!username || !email){
        if(!(username || email)){
        throw new ApiError(400,"username or password not found")
     }

     const user = await User.findOne({
        $or: [{username},{email}]
     })

     if(!user){
        throw new ApiError(400,"user does not exist")
     }

     const isPasswordValid = await user.isPasswordCorrect(password) //password from req.body

     if(!isPasswordValid){
        throw new ApiError(401,"Password incorrect")
     }

    // const isPasswordValid = await user.isPasswordCorrect(password);

    // if (!isPasswordValid) {
    //     throw new ApiError(401, "Password incorrect");
    // }

     const {accessToken,refreshToken} = await generateAccessAndRefereshToken(user._id)

     const loggedInUser = await User.findById(user._id).
     select("-password -refreshToken")

     const options = {
        httpOnly: true,
        secure: true
     }

     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "Logged in succesfully user nkjhgfdxghjuser aagyaaaaaaaaaaaaaaa"

        )
     )
     


    //  return res.status(201).json(
    //     {
    //         message: "user login hogya......."
    //     }
    // )
})

const logoutUser = asyncHandler(async (req,res) =>{
    //remove refresh Token from the database

    // const loggedOutUser = await User.findById(user._id)
    // loggedOutUser.refreshToken=""
    // user.refreshToken = refreshToken
    //     await user.save({validateBeforeSave: false}) //save refreshToken in database
    //     return {accessToken,refreshToken}

    //req.user login the access token thaa query maari database pe aur ek request.user add kardia

     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
     }

     console.log("user nikl bhaiii")

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged huuuuuuuuuuuuuuuuuuuuuu out succesfully")
    )


})
 
// const loginUser = (req, res) => {
//     console.log('Login - Request Headers:', req.headers); // Log request headers
//     console.log('Login - Request Body:', req.body); // Log the entire request body
//     const { username, email, password } = req.body;
//     console.log('Login - Extracted Email:', email); // Log the email to the console

//     return res.status(201).json({
//         message: "User logged in successfully"
//     });
// };





// export {registerUser}
// export {loginUser}
export {registerUser,loginUser,logoutUser}


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
