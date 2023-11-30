//veritabanı bağlantısı
import mongoose from "mongoose";
const connectDB= async()=>{
    try {
        //esnek sorgu yapısını kullanmaya izin veriyoruz
        mongoose.set('strictQuery', false);
        //mongoose ile mongoDB bağlantısı kuruluyor
        const conn= await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Veritabanı host:${conn.connection.host} bağlandı`);
    } catch (error) {
        console.log(error);
    }
}
export default connectDB; 