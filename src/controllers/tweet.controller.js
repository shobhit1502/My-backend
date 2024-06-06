
import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// const createTweet = asyncHandler(async (req, res) => {
//     const { content } = req.body;

//     if (!content) {
//         throw new ApiError(400, "content is required");
//     }

//     const tweet = await Tweet.create({
//         content,
//         owner: req.user?._id,
//     });

//     if (!tweet) {
//         throw new ApiError(500, "failed to create tweet please try again");
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, tweet, "Tweet created successfully"));
// });
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //step1 take content from req.body
    //step2 check for valid user logged in
    //step3 create a tweet in database
    //step4 return response
    const {content} = req.body

    if(!content){
        throw new ApiError(400,"Enter content!!")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"USERID NOT FOUND")
    }


    const pipeline = []

    pipeline.push(
        {
            $match:{
               owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        
            {
                $project: {
                    content: 1,
                    ownerDetails: 1,
                    // likesCount: 1,
                    // createdAt: 1,
                    // isLiked: 1
                },
            }
        
    )
    
    const tweetAggregate =  await Tweet.aggregate(pipeline);
    return res
        .status(200)
        .json(new ApiResponse(200, tweetAggregate, "All tweets  fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body;
    const { tweetId } = req.params;

    if(!content){
        throw new ApiError(400,"please enter content broo!!!")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id!!!")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400,"tweet id not found in db!!!")
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can edit thier tweet");
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {new : true}
    )

    if (!newTweet) {
        throw new ApiError(500, "Failed to edit tweet please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet Id not found")
    }

    

    // const tweet = await Tweet.findByIdAndDelete(tweetId)

    // if(!tweet){
    //     throw new ApiResponse(400,"Tweet mila hi nahi db meii")
    // }

    // console.log(tweet);
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete thier tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {tweetId},"Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

//more work in getUserTweets
