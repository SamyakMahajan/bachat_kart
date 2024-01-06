import mongoose from 'mongoose'

let isConnected=false;//variable to track connection status

export const connectToDB=async ()=>{
    mongoose.set('strictQuery',true);
    console.log(process.env.MONGODB_URI);
    if(!process.env.MONGODB_URI)return console.log('No MONGODBURI');
    if(isConnected) return console.log('=> using existing database connection');

    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(process.env.MONGODB_URI);
        isConnected=true;
        console.log("=> using new database connection");
    }

    catch(error:any){
        console.log(error);
    }
}