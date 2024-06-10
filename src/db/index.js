import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'



const connectDB = async () => {
    const connectionString = process.env.MONGODB_URI;
    console.log(`Connecting to MongoDB with URI: ${connectionString}`);  // Debug statement

    try {
        const connectionInstance = await mongoose.connect(connectionString);
        console.log(`MONGODB CONNECTED !!! DB HOST: ${connectionInstance.connection.host}`);
    } 
    
    catch (error) {
        console.error('MONGODB CONNECTION ERROR', error);
        process.exit(1);
    }
};

export default connectDB