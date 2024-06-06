
import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId not found")
    }

    const pipeline = []

    pipeline.push(
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner"

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
                createdAt: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
            }
        }
    )

    const commentAggregate =  await Comment.aggregate(pipeline);
    return res
        .status(200)
        .json(new ApiResponse(200, commentAggregate, "All comment fetched successfully"));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    if (!comment) {
        throw new ApiError(500, "Failed to add comment please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
    
})

const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        // comment?._id,
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(500, "Failed to edit comment please try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment edited successfully")
        );


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if(!commentId){
        throw new ApiError(400,"commentId not found")
    }
    const comment = await Comment.findById(commentId);

    if(req.user?._id.toString() !== comment?.owner.toString()){
        throw new ApiResponse(400,"tu mat kar delete")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Comment deleted successfully")
        );



})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }

//work on feature delete comment assiociated like
//work more on getAllComments
