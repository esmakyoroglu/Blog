import mongoose, { Schema } from "mongoose";
//büyük harfle tanımlı olması gerekmektedir
//her belgenin başlığı, gövdesinde ne yazacağı zorunlu olduğu için required:true yazdık
const PostSchema=new Schema({
    title:{
        type:String,
        //oluşturulması zorunlu demek
        required:true
    },
    body:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updateDate:{
        type:Date,
        default:Date.now
    },
});
export default mongoose.model('Post', PostSchema);