import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


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
            "Logged in succesfully!!!!!!"

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
            $unset : {
                refreshToken: 1 //undefined
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
        new ApiResponse(200,{},"User logged out succesfully!!!!")
    )


})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    const user = await User.findOne({
        refreshToken: incomingRefreshToken
    });

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Access token refreshed"
            )
        )

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    console.log(req.body)
    
    if (typeof user.comparePassword !== 'function') {
        throw new ApiError(500, "comparePassword is not a function on user object");
    }
    const isOldPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password");
    }

    user.password = newPassword;//-----------
    await user.save({ validateBeforeSave: false });//------------

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password updated successfully")
        )
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    //const currentUser = req.user
    // return res
    // .status(200)
    // .json(
    //     200,
    //     req.user,
    //     "current user fetched successfully"
    // )
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

// const updateAccountDetails = asyncHandler(async(req,res)=>{
//     const {username} = req.body

//     if(!username){
//         throw new ApiError(400,"All fields are required")
//     }

//     console.log(username);

//     const user = await User.findById(req.user?._id);

//     // user.fullName = fullName
//     // user.email = email
//     user.username = username
//     await user.save({ validateBeforeSave: false });

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, req.body, "user data email name updated successfully")
//         )
// })

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body;
    console.log(fullName);

    // if (!fullName || !email) {
    //     throw new ApiError(400, "All fields are required");
    // }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        )
});

const updateUserAvatar = asyncHandler( async (req,res) =>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                // fullName,
                // email : email
                avatar: avatar.url
            }
        },
        {new : true}
        

    ).select("-password")

    return res
            .status(200)
            .json(
                new ApiResponse(200, user, "Avatar updated successfully")
            )
})

const updateUserCoverImage = asyncHandler( async (req,res) =>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                // fullName,
                // email : email
                coverImage: coverImage.url
            }
        },
        {new : true}
        

    ).select("-password")

    return res
            .status(200)
            .json(
                new ApiResponse(200, user, "cover Image updated successfully")
            )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", // The collection to join with
                localField: "_id", // Field from the current collection (User) to match
                foreignField: "channel", // Field from the 'subscriptions' collection to match
                as: "subscribers" // Alias for the joined data
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subcribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subcribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ]);

    // console.log(channel);
    if (!channel?.length) {
        throw new ApiError(404, "channel doesnot exist");
    }

    console.log(channel);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetced successfully"
            )
        )
});

// const getUserChannelProfile = asyncHandler(async (req,res)=>{
//     //url se aayaa
//     const {username} = req.params
//     console.log("Received username:", username);
//     //console.log(req.user);

//     if(!username?.trim()){
//         throw new ApiError(400,"username is missing")
//     }

//     const channel = await User.aggregate([
//         {
//             $match:{
//                 username : username?.toLowerCase()
//             }

//         },
//         {
//             $lookup:{
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "channel",
//                 as: "subscribers" //finding no of subscribers for a particular channel/user
//             } 
//         },
//         {
//             $lookup:{
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "subscriber",
//                 as: "subscribedTo"

//             }
//         },
//         {
//             $addFields:{
//                 subscribersCount:{
//                     $size: "$subscribers"
//                 },
//                 channelSubscribeToCount:{
//                     $size: "$subscribedTo"
//                 },
//                 isSubscribed:{
//                     $cond:{
//                         if: {$in: [req.user?._id,"$subscribers.subscriber"]},
//                         then: true,
//                         else: false
//                     }
//                 }
//             }
//         },
//         {
//         $project:{
//             fullName: 1,
//             username: 1,
//             subscribersCount: 1,
//             channelSubscribeToCount: 1,
//             isSubscribed: 1,
//             avatar: 1,
//             coverImage: 1,
//             email:1
//         }
//     }
        
//     ])

//     console.log("Aggregation result:", channel);

//     if(!channel?.length){
//         throw new ApiError(404,"channel does not exist")
//     }

//     return res
//     .status(200)
//     // .json(
//     //     new ApiResponse(200,channel[0],"user channel fetched successfully")
//     // )
//     .json(
//         new ApiResponse(
//             200,
//             channel[0],
//             "User channel fetced successfully"
//         )
//     )


// })

const getWatchHistory = asyncHandler(async (req,res) =>{
    const user = await User.aggregate([
        {
           $match: {
            _id : new mongoose.Types.ObjectId(req.user._id)
           }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                            {
                                $project:{
                                    fullName: 1,
                                    username: 1,
                                    avatar:1
                                }
                            }
                       ]
                    }
                    },
                    {
                            $addFields:{
                                owner: {
                                    $first: "$owner"
                                }
                            }
                    }
                ]
            }
        
        }
])
console.log(user);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
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
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,
    updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory}


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
