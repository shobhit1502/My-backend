import mongoose, {Schema} from "mongoose";


const LikeSchema = new Schema({

    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamp : true})
export const Like = mongoose.model("Like", LikeSchema)