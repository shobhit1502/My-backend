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

//routes declaration bcz we are having seperates routes and controllers

 app.use('/api/v1/users',userRouter)

 //http://localhost:3000/api/v1users/register
//


export {app}