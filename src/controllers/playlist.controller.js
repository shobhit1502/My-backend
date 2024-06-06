
import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

 //TODO: create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    //step1 name and description from req.body
    // check for validations
    //step2 take channel id from req.user
    // playlist model has name,description,videos,owner
    //create playlist scheama with owner req.user
    //return response


    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400,"Enetr detailss plzz!!!")
    }

    const playlist = Playlist.create({
        name,
        description,
        owner : req.user._id
    })

    if(!playlist){
        throw new ApiError(400,"playlist not created!!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

    //step1 take userId from req.params
    //step2 validate that userId
    //step3 

    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"userId not valid!!")
    }
    
    // const playlist = await Playlist.findById(owner.userId)

    // if(!playlist){
    //     throw new ApiError(400,"playlist not foundddd")
    // }

    const pipeline = []

    pipeline.push(
        {
            $match:{
                //owner : owner._id
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
                $addFields: {
                    totalVideos: {
                        $size: "$videos"
                    },
                    totalViews: {
                        $sum: "$videos.views"
                    }
                }
        },
        {
            
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    videos: 1,
                    owner:1,
                    totalVideos: 1,
                    totalViews: 1,
                    updatedAt: 1
                }
            
        }
    
    )

    const getPlaylistUserDetails = await Playlist.aggregate(pipeline)
    //hata ke bhi try krnaa
    return res
    .status(200)
    .json(
        new ApiResponse(200,getPlaylistUserDetails[0],"got user playlist successfully!!")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id

    //step1 take playlist id from user
    //validate id
    //search that id in database
    //if not found throw error
    //create pipeline
    //return response

    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400,"playlist id not valid!!")
    }

    const playlist = Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Playlist does not exist")
    }

    const pipeline = []

    pipeline.push(
        {
            $match:{
                _id : new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project:{
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                }
            }
        }
    )

    const playlistaggregreate = await Playlist.aggregate(pipeline)

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistaggregreate,"Playlist retreived successfully")
    )

    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //step1 take playlist Id videoId from req.param
    //step2 do validation
    //find playlistid and videoid from database
    //do validations
    //check for owner
    //run findByIdAndUpdate to set video fields
    //return response
    
    const {playlistId,videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlst Id not valid")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Playlst Id not valid")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    if(!video){
        throw new ApiError(400,"video not found")
    }

    // if(req.user?._id.toString() !== playlist.owner._id.toString() !== video.owner._d.toString()){
    //     throw new ApiError(400,"YOU ARE NOT OWNER YOU CANT ADD")
    // }

    if (
        (playlist.owner?.toString() && video.owner.toString()) !==
        req.user?._id.toString()
    ) {
        throw new ApiError(400, "only owner can add video to thier playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
         playlistId,
        //playlist?._id,
        {
            $addToSet: {
                videos: videoId,
            },
        },
        {new : true}
    )

    if (!updatedPlaylist) {
        throw new ApiError(
            400,
            "failed to add video to playlist please try again"
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"video added successfully to playlist")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    
    // TODO: remove video from playlist
    const {playlistId,videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlst Id not valid")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Playlst Id not valid")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    if(!video){
        throw new ApiError(400,"video not found")
    }

    if (
        (playlist.owner?.toString() && video.owner.toString()) !==
        req.user?._id.toString()
    ) {
        throw new ApiError(400, "only owner can delete video to thier playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
         playlistId,
        //playlist?._id,
        {
            $pull: {
                videos: videoId,
            },
        },
        {new : true}
    )

    if (!updatedPlaylist) {
        throw new ApiError(
            400,
            "failed to delete video to playlist please try again"
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"video deleted successfully to playlist")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid PlaylistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can delete the playlist");
    }
    
    await Playlist.findByIdAndDelete(playlist?._id);
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
     //TODO: update playlist

    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId!!!")
    }

    if(!name || !description){
        throw new ApiError(400,"Enter details!!")
    }
    
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only owner can edit the playlist");
    }
    
    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist details updated successfully")
    )

   
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
 