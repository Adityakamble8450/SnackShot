import mongoose from "mongoose"

 const likeShema = mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User",
        required : true
    } ,
    food : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "food",
        required  : true
    }
    
})

// Prevent duplicate likes by same user on the same food
likeShema.index({ user: 1, food: 1 }, { unique: true })

 export  const likeModel = mongoose.model("like" , likeShema)
