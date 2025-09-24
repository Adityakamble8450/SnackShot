import ImageKit from "imagekit";
import dotenv from "dotenv"

dotenv.config()


const imagekit = new ImageKit({
    publicKey : "public_PfVIbacNSxGuslNuUdeHS3OhLq4=",
    privateKey : process.env.IMAGEKIT_PRIVETE_KEY,
    urlEndpoint : process.env.IMAGEKIT_ENDPOINT
});

export const uploadFile = async(file , fileName)=>{
    const result = await imagekit.upload({
        file : file ,
        fileName : fileName
    })
    return result

}

