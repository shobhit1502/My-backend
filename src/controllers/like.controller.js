import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    //step 1 get video id 
    const {videoId} = req.params

    //check for valid video id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    //check if video is already liked or not
    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });
    
    //if liked delete that like
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: false },"Video not liked by you succesfully"));    
    }
    
    //if not like create that like
    await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true },"Video liked by you succesfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    
    //TODO: toggle like on comment
    const {commentId} = req.params

    //check for valid video id
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    //check if video is already liked or not
    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });
    
    //if liked delete that like
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: false },"comment not liked by you succesfully"));    
    }
    
    //if not like create that like
    await Like.create({
        comment : commentId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true },"comment liked by you succesfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  

    //TODO: toggle like on tweet

    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }


    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    //console.log(likedAlready);

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { tweetId, isLiked: false }));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const pipeline = []

    pipeline.push(
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            }

        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline:[
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                        $unwind: "$ownerDetails",
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            },
        }

    )

    //console.log("Pipeline details:" ,pipeline);
    const likeAggregate =  await Like.aggregate(pipeline);
    //console.log("likeAggregate details" ,likeAggregate);


    return res
        .status(200)
        .json(new ApiResponse(200, likeAggregate, "All liked videos  fetched successfully"));
})




export {
    toggleCommentLike, 
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}


//work more on 
//toggleCommentLike,
//toggleTweetLike,

