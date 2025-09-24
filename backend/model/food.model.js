import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
        name : {
            type:String,
        required:true
        } ,
        video : {
            type:String,
        required:true
        },
        description : {
            type : String,
            maxlength: 200
        },
        foodPartner :{
            type : mongoose.Schema.Types.ObjectId ,
            ref : "foodpartner"
        },
        count :{
            type : Number ,
            default : 0
        }

},{ timestamps: true })
const foodModel = mongoose.model("food" , foodSchema)
export default foodModel