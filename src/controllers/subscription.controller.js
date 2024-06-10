import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"

import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  
    // TODO: toggle subscription

    //step1 take channelId
    //step2 check if the user is subscribed or not
    //step3 if subscribed already delete and return response
    //step4 if not subscribed create a Subcription document
    
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"channelId not found")
    }

    const isSubscribed = await Subscription.findOne({
        //req.user?._d
        subscriber: req.user?._id,
        channel: channelId,
    }
    )

    if(isSubscribed){
        //await Subscription.findByIdAndDelete(req.user?._id)
        await Subscription.findByIdAndDelete(isSubscribed?._id)

        return res
        .status(200)
        .json(
            new ApiResponse(200,{ subscribed: false },"CHANNEL UNSUBSCRIBED")
        )
    }

    await Subscription.create({
        subscriber : req.user?._id,
        channel: channelId
    }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,{ subscribed: false },"CHANNEL SUBSCRIBED krlia")
    )
})

// controller to return subscriber list of a channel
// const getUserChannelSubscribers = asyncHandler(async (req, res) => {

//     let { channelId } = req.params;
//     if (!isValidObjectId(channelId)) {
//         throw new ApiError(400, "Invalid channelId");
//     }
//     channelId = new mongoose.Types.ObjectId(channelId);
//     const channelSubscribers = await Subscription.aggregate([
//         {
//             $match: {
//                 channel: channelId,
//             },
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "subscriber",
//                 foreignField: "_id",
//                 as: "subscribers",
//             },
//         },
//         {
//             $unwind: "$subscribers",
//         },
//         {
//             $project: {
//                 _id: 0,
//                 subscriber: {
//                     _id: "$subscribers._id",
//                     username: "$subscribers.username",
//                     fullName: "$subscribers.fullName",
//                     "avatar.url": "$subscribers.avatar.url",
//                 },
                
//             },
//         },
//     ]);
    
//     const subscribersCount = channelSubscribers.length
//     //console.log(channelSubscribers.length);
//     return res.status(200).json(new ApiResponse(200, {channelSubscribers,subscribersCount}, "Subscribers fetched successfully"));
    
// })

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $unwind: "$subscribers"
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "subscribers._id",
                foreignField: "channel",
                as: "subscriberSubscriptions"
            }
        },
        {
            $addFields: {
                "subscribers.subscribersCount": { $size: "$subscriberSubscriptions" },
                "subscribers.subscribedToSubscriber": {
                    $in: [new mongoose.Types.ObjectId(channelId), "$subscriberSubscriptions.subscriber"]
                }
            }
        },
        {
            $group: {
                _id: null,
                subscribers: { $push: "$subscribers" }
            }
        },
        {
            $project: {
                _id: 0,
                subscribers: 1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, channelSubscribers[0]?.subscribers || [], "Subscribers fetched successfully"));
});


/*
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }
    //channelId = new mongoose.Types.ObjectId(channelId);
    
    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                //channel: channelId,
                channel: new mongoose.Types.ObjectId(channelId)
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
            },
        },
        {
            $unwind: "$subscribers",
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "subscribers._id",
                foreignField: "channel",
                as: "subscriberSubscriptions",
            },
        },
        {
            $addFields: {
                "subscriber.subscribersCount": { $size: "$subscriberSubscriptions" },
            },
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: "$subscribers._id",
                    username: "$subscribers.username",
                    fullName: "$subscribers.fullName",
                    //"avatar.url": "$subscribers.avatar.url",
                    subscribersCount: "$subscriber.subscribersCount",
                },
                //subscribers: 1
                
            },
        },
    ]);
    
    const subscribersCount = channelSubscribers.length;
    
    return res.status(200).json(new ApiResponse(200,  channelSubscribers, "Subscribers fetched successfully"));
});
*/


// controller to return channel list to which user has subscribed
// const getSubscribedChannels = asyncHandler(async (req, res) => {
//     const { subscriberId } = req.params
//     const subscribedChannels = await Subscription.aggregate([
//         {
//         $match:{
//             subscriberId: new mongoose.Types.ObjectId(subscriberId),
//         }
//     },
//     {
//         $lookup:{
//             from: "users",
//             localField: "channel",
//             foreignField: "_id",
//             as: "subscribedChannel",
//             pipeline:[
//             {
//                 $lookup: {
//                     from: "videos",
//                     localField: "_id",
//                     foreignField: "owner",
//                     as: "videos",
//                 },
//             },
//             {
//                 $addFields: {
//                     latestVideo: {
//                         $last: "$videos",
//                     },
//                 },
//             },
//             ]
//         }
//     },
//         {
//             $unwind: "$subscribedChannel",
//         },
//         {
//             $project:{
//                 _id: 0,
//                 subscribedChannel: {
//                     _id: 1,
//                     username: 1,
//                     fullName: 1,
//                     "avatar.url": 1,
//                     latestVideo: {
//                         _id: 1,
//                         "videoFile.url": 1,
//                         "thumbnail.url": 1,
//                         owner: 1,
//                         title: 1,
//                         description: 1,
//                         duration: 1,
//                         createdAt: 1,
//                         views: 1
//                     },
//                 },
//             }

//         }
//     ])
// console.log(subscribedChannels);
//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 subscribedChannels,
//                 "subscribed channels fetched successfully"
//             )
//         );
// })

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    //videos: 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched successfully"
            )
        );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}

//all done but study more about getUserChannelSubscribers,getSubscribedChannels