

// import mongoose from 'mongoose'
// import dotenv from 'dotenv'
// import connectDB from "./db/index.js"

// dotenv.config({
//     path: './env'
// })
// connectDB()


import dotenv from 'dotenv';
import connectDB from './db/index.js';

// dotenv.config({ path: './.env' });
dotenv.config({
    path: './env'
})


console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);  // Debug statement

connectDB();









//try catch async await

// function connectDB(){

// }
// connectDB()


// ;( async ()=>{
//      try{
//         await mongoose.connect(`${process.env.MONGO_URI} / ${DB_NAME}`)
//      }
//      catch(error){
//         console.error("ERROR: ",error)
//         throw err
//      }
// })()