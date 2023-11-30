import mongoose, { Schema } from "mongoose";

//büyük harfle tanımlı olması gerekmektedir
const UserSchema=new Schema({
    username:{
        type:String,
        required:true,
        //aynı kullanıcı adına sahip iki kullanıcı olamayacağını söyleriz
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
});
export default mongoose.model('User', UserSchema);