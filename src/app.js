import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

//for middleware configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}
))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({extended: true,limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

//routes import

import userRouter from './routes/user.routes.js'
//import videoRouter from './routes/video.routes.js'


//routes declaration bcz we are having seperates routes and controllers

 app.use('/api/v1/users',userRouter)
 //app.use("/api/v1/video", videoRouter);
 
 //http://localhost:3000/api/v1/users/register
//


import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/video", videoRouter);

import likeRouter from "./routes/like.routes.js";
app.use("/api/v1/likes", likeRouter);

import tweetRouter from "./routes/tweet.routes.js"
app.use("/api/v1/tweet", tweetRouter)


export {app}