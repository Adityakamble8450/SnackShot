import mongoose from "mongoose";

const foodPartnerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone :{
        type : String ,
        required : true
    } ,
    address :{
        type : String , 
        required : true
    } , 
    cuisineType : {
        type : String ,
    }
})

const foodPartner = mongoose.model("foodpartner" , foodPartnerSchema)
export default foodPartner;