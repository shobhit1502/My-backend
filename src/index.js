
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

// dotenv.config({ path: './.env' });

dotenv.config({
    path: './.env'
})


console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);  // Debug statement

connectDB()
.then( ()=>{
    app.listen( process.env.PORT || 8000,()=>{
        console.log(`SERVER IS RUNNING AT ${process.env.PORT}`);
    })
    //step1 give a callback
    //step2 In app.listen specify port and callback for server run check
})
.catch((err)=>{
    console.log("MONGODB CONNECTION FAILED!!!!1",err);
    //step1 give a callback with argument err
})



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