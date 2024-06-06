// import { asyncHandler } from "../utils/asyncHandler.js";
// import {ApiError} from "../utils/ApiError.js"
// import {User} from "../models/user.model.js"
// import {uploadOnCloudinary , deleteOnCloudinary} from "../utils/cloudinary.js"
// import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken"
// import mongoose , { isValidObjectId }from "mongoose";
// import { Like } from "../models/like.model.js";
// import { Comment } from "../models/comment.model.js";
// import { Video } from "../models/comment.model.js";

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination


// })

// const publishAVideo = asyncHandler(async (req, res) => {
    
//     // TODO: get video, upload to cloudinary, create video

//     const { title, description} = req.body
//     if ([title, description].some((field) => field?.trim() === "")) {
//         throw new ApiError(400, "All fields are required");
//     }
//     const videoLocalPath = req.files ? (req.files.video ? req.files.video[0].path : null) : null;
//     const thumbnailLocalPath = req.files ? (req.files.video ? req.files.video[0].path : null) : null;
   
//     if(!videoLocalPath){
//         throw new ApiError(400,"video file is required")
//     }
    
//     if(!thumbnailLocalPath){
//         throw new ApiError(400,"thumbnail file is required")
//     }
//     const videoFile = await uploadOnCloudinary(videoLocalPath)
//     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

//     if(!videoFile){
//         throw new ApiError(400,"video file is required")
//     }

//     if (!thumbnail) {
//         throw new ApiError(400, "Thumbnail not found");
//     }

//     const video = await Video.create({
//         title,
//         description,
//         duration: videoFile.duration,
//         // videoFile : videoFile.url,
//         // thumbnail: thumbnail?.url || "",
//         videoFile: {
//             url: videoFile.url,
//             public_id: videoFile.public_id
//         },
//         thumbnail: {
//             url: thumbnail.url,
//             public_id: thumbnail.public_id
//         },
//         owner: req.user?._id,
//         isPublished: false
//     })

//     const videoUploaded = await Video.findById(video._id);

//     if (!videoUploaded) {
//         throw new ApiError(500, "videoUpload failed please try again !!!");
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, video, "Video uploaded successfully"));
// })

// const getVideoById = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: get video by id
// })

// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: update video details like title, description, thumbnail

// })

// const deleteVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: delete video
// })

// const togglePublishStatus = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
// })

// export {
//     getAllVideos,
//     publishAVideo,
//     getVideoById,
//     updateVideo,
//     deleteVideo,
//     togglePublishStatus
// }


//====================================================


import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import {
    uploadOnCloudinary
} from "../utils/cloudinary.js";

import {
    deleteOnCloudinary
} from "../utils/cloudinary.js";

import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";

// get all videos based on query, sort, pagination
// const getAllVideos = asyncHandler(async (req, res) => {
//     //Extract Query Parameters:
//     //Initialize Pipeline:
//     //Full-Text Search (Optional):
//     //Filter by User ID (Optional):
//     //Filter Published Videos:
//     //Sorting:
//     //Join with User Details:
//     //Paginate Results:
//     //Send Response:
    
//     //step 1
//     const {page = 1, limit = 10,query,sortBy,sortType,userId} = req.query
//     console.log("hbgvfcdxszxfcgvhbjgfcxdzsdxfcgvb");
//     console.log(userId);
//     console.log("hbgvfcdxszxfcgvhbjgfcxdzsdxfcgvb");

//     //step2 pipline
//     const pipeline = []

//     //step3 Full-Text Search (Optional):

//     if(query){
//         pipeline.push({
//             $search:{
//                 index: "search-videos",
//                 text:{
//                     query: query,
//                     path: ["title","description"]
//                 }
//             }
//         })
//     }
    
//     //Filter by User ID (Optional):
    
//     if(userId){
//         if (!isValidObjectId(userId)) {
//             throw new ApiError(400, "Invalid userId")
//         }

//         pipeline.push({
//             $match:{
//                 owner: new mongoose.Types.ObjectId(userId)
//             }
//         })
//     }

//     pipeline.push({ $match: { isPublished: true } });

//     if(sortBy && sortType){
//         pipeline.push({
//            $sort:{
//             [sortBy]: sortType === "asc" ? 1 : -1
//            }
//         })
//     }
//     else{
//         pipeline.push({
//             $sort:{
//                 createdAt: -1
//             }
//         })
//     }
    
//     // Step 7: Join with User Details
//     pipeline.push(
//         {
//            $lookup:{
//             from: "users",
//             localField: "owner",
//             foreignField: "_id",
//             as: "ownerDetails",
//             pipeline: [
//                 {
//                     $project: {
//                         username: 1,
//                         "avatar.url": 1
//                     }
//                 }
//             ]
//            }
//         },{
//             $unwind: "$ownerDetails"
//         }
//     )

//     console.log("Aggregation pipeline:", JSON.stringify(pipeline, null, 2));
//      // Step 8: Paginate Results
//      const videoAggregate = await Video.aggregate(pipeline);
//      const options = {
//          page: parseInt(page, 10),
//          limit: parseInt(limit, 10)
//      };
//      const video = await Video.aggregatePaginate(videoAggregate, options);

//      console.log("Query result:", video);

//      //console.log(pipeline);

//      // Step 9: Send Response
//     return res
//     .status(200)
//     .json(new ApiResponse(200, video, "Videos fetched successfully")); 
// });

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    console.log(userId);
    const pipeline = [];

    // for using Full Text based search u need to create a search index in mongoDB atlas
    // you can include field mapppings in search index eg.title, description, as well
    // Field mappings specify which fields within your documents should be indexed for text search.
    // this helps in seraching only in title, desc providing faster search results
    // here the name of search index is 'search-videos'
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"] //search only on title, desc
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // fetch videos only that are set isPublished as true
    //pipeline.push({ $match: { isPublished: true } });

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )
    console.log("1234");
    console.log("pipeline detail starts::::");
    console.log("Pipeline details:" ,pipeline);
    const videoAggregate =  Video.aggregate(pipeline);
    console.log("njhgfhdgxfsxgfvhbjnkhbgfxdz");
    console.log(videoAggregate);
    console.log("jjjjjjjjjj");
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };
    const video = await Video.aggregatePaginate(videoAggregate, options);

    console.log(video);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

// get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFileLocalPath is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log(videoFile,thumbnail)

    if (!videoFile) {
        throw new ApiError(400, "Video file not found");
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail not found");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user?._id,
        isPublished: false
    });

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

// get video by id

const getVideoById = asyncHandler(async (req,res) =>{
    //step1  get videoId from params
    const {videoId} = req.params
    console.log(videoId);

    // check for valid videoId
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id does not exist")
    }

    const pipeline = []
    pipeline.push(
        {
        $match: {
            _id: new mongoose.Types.ObjectId(videoId)
        }
        },
        {
        
                $project: {
                    "videoFile.url": 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    createdAt: 1,
                    duration: 1,
                    owner: 1,
                   
                }
        }
        

    )

    const videoAggregate = Video.aggregate(pipeline);

    const video = await Video.aggregatePaginate(videoAggregate);

    if (!video) {
        throw new ApiError(500, "failed to fetch video");
    }

    // increment views if video fetched successfully
    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, video, "VideosId hjgcxdffcgv fetched successfully"));

})

//===========================final code
// const getVideoById = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     // let userId = req.body;
    
//     // userId = new mongoose.Types.ObjectId(userId)
//     if (!isValidObjectId(videoId)) {
//         throw new ApiError(400, "Invalid videoId");
//     }

//     if (!isValidObjectId(req.user?._id)) {
//         throw new ApiError(400, "Invalid userId");
//     }

//     const video = await Video.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(videoId)
//             }
//         },
//         {
//             $lookup: {
//                 from: "likes",
//                 localField: "_id",
//                 foreignField: "video",
//                 as: "likes"
//             }
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "owner",
//                 foreignField: "_id",
//                 as: "owner",
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: "subscriptions",
//                             localField: "_id",
//                             foreignField: "channel",
//                             as: "subscribers"
//                         }
//                     },
//                     {
//                         $addFields: {
//                             subscribersCount: {
//                                 $size: "$subscribers"
//                             },
//                             isSubscribed: {
//                                 $cond: {
//                                     if: {
//                                         $in: [
//                                             req.user?._id,
//                                             "$subscribers.subscriber"
//                                         ]
//                                     },
//                                     then: true,
//                                     else: false
//                                 }
//                             }
//                         }
//                     },
//                     {
//                         $project: {
//                             username: 1,
//                             "avatar.url": 1,
//                             subscribersCount: 1,
//                             isSubscribed: 1
//                         }
//                     }
//                 ]
//             }
//         },
//         {
//             $addFields: {
//                 likesCount: {
//                     $size: "$likes"
//                 },
//                 owner: {
//                     $first: "$owner"
//                 },
//                 isLiked: {
//                     $cond: {
//                         if: {$in: [req.user?._id, "$likes.likedBy"]},
//                         then: true,
//                         else: false
//                     }
//                 }
//             }
//         },
//         {
//             $project: {
//                 "videoFile.url": 1,
//                 title: 1,
//                 description: 1,
//                 views: 1,
//                 createdAt: 1,
//                 duration: 1,
//                 comments: 1,
//                 owner: 1,
//                 likesCount: 1,
//                 isLiked: 1
//             }
//         }
//     ]);

//     if (!video) {
//         throw new ApiError(500, "failed to fetch video");
//     }

//     // increment views if video fetched successfully
//     await Video.findByIdAndUpdate(videoId, {
//         $inc: {
//             views: 1
//         }
//     });

//     // add this video to user watch history
//     await User.findByIdAndUpdate(req.user?._id, {
//         $addToSet: {
//             watchHistory: videoId
//         }
//     });

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, video[0], "video details fetched successfully")
//         );
// });
//===============================final code


// update video details like title, description, thumbnail
// const updateVideo = asyncHandler(async (req, res) => {
//     const { title, description } = req.body;
//     const { videoId } = req.params;

//     if (!isValidObjectId(videoId)) {
//         throw new ApiError(400, "Invalid videoId");
//     }

//     if (!(title && description)) {
//         throw new ApiError(400, "title and description are required");
//     }

//     const video = await Video.findById(videoId);

//     if (!video) {
//         throw new ApiError(404, "No video found");
//     }

//     if (video?.owner.toString() !== req.user?._id.toString()) {
//         throw new ApiError(
//             400,
//             "You can't edit this video as you are not the owner"
//         );
//     }

//     //deleting old thumbnail and updating with new one
//     const thumbnailToDelete = video.thumbnail.public_id;

//     const thumbnailLocalPath = req.file?.path;

//     if (!thumbnailLocalPath) {
//         throw new ApiError(400, "thumbnail is required");
//     }

//     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

//     if (!thumbnail) {
//         throw new ApiError(400, "thumbnail not found");
//     }

//     const updatedVideo = await Video.findByIdAndUpdate(
//         videoId,
//         {
//             $set: {
//                 title,
//                 description,
//                 thumbnail: {
//                     public_id: thumbnail.public_id,
//                     url: thumbnail.url
//                 }
//             }
//         },
//         { new: true }
//     );

//     if (!updatedVideo) {
//         throw new ApiError(500, "Failed to update video please try again");
//     }

//     if (updatedVideo) {
//         await deleteOnCloudinary(thumbnailToDelete);
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
// });

// update video details like title, description, thumbnail
const updateVideo = asyncHandler( async (req,res)=>{
      //take title description from req.body and videoId from req.param
      // check for valid object Id
      // check for title description enetered
      // find videoId in database
      // check if logged in user is owner only then he can edit
      //deleting old thumbnail and updating with new one
      //make updations in database
      //return json response

      const {title,description} = req.body
      const {videoId} = req.params

      if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId");
      }

      if(!title || !description){
        throw new ApiError(400, "details not found");
      }

      const video = await  Video.findById(videoId)

      if (!video) {
        throw new ApiError(404, "No video found");
    }

      if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(
            400,
            "You can't edit this video as you are not the owner"
        );
      }

    //deleting old thumbnail and updating with new one
    const thumbnailToDelete = video.thumbnail.public_id;

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
         videoId,
         {
            $set: {
                title,
                description,
                thumbnail: {
                    public_id: thumbnail.public_id,
                    url: thumbnail.url
                }
            }
        },
        { new: true }

    )

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,  "Video updated successfully"));





})

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
    //take video url from the req.params
    //check if videoId exist or not
    // find videoId in database
    //check if the user is owner or not
    //make query in database to delete it findById and delete
    //return json response

    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await  Video.findById(videoId)

      if (!video) {
        throw new ApiError(404, "No video found");
    }

    if(req.user?._id.toString() !== video?.owner.toString()){
        throw new ApiError(
            400,
            "You can't delete this video as you are not the owner"
        );
    }

    // const deletedvideo = await Video.findByIdAndDelete(
    //     videoId,
    //     {
    //         $unset: videoId
    //     },
    
    //     {new : true}
    
    // )
    const videoDeleted = await Video.findByIdAndDelete(video?._id);

    if (!deletedvideo) {
        throw new ApiError(400, "Failed to delete the video please try again");
    }

//     const updatedVideo = await Video.findByIdAndUpdate(
//         videoId,
//         {
//            $set: {
//                title,
//                description,
//                thumbnail: {
//                    public_id: thumbnail.public_id,
//                    url: thumbnail.url
//                }
//            }
//        },
//        { new: true }

//    )

    return res
    .status(200)
    .json(new ApiResponse(200,  "Video deleted successfully"));


});

// toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }

    const toggledVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video?.isPublished
            }
        },
        { new: true }
    );

    if (!toggledVideoPublish) {
        throw new ApiError(500, "Failed to toogle video publish status");
    }

    
    await deleteOnCloudinary(video.thumbnail.public_id); // video model has thumbnail public_id stored in it->check videoModel
    await deleteOnCloudinary(video.videoFile.public_id, "video"); // specify video while deleting video

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: toggledVideoPublish.isPublished },
                "Video publish toggled successfully"
            )
        );
});

export {
    publishAVideo,
    updateVideo,
    deleteVideo,
    getAllVideos,
    getVideoById,
    togglePublishStatus,
};


//work more on getVideoById
//view wale pa