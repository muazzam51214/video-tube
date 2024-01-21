import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type:"auto"
    })
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);

    return null;
  }
}

const deleteFromCloudinary = async (oldAvatarURL) => {
  try {
    if (!oldAvatarURL) return null;

    // Get the public ID from the URL (assuming it's a Cloudinary URL)
    const publicId = cloudinary.url(oldAvatarURL).public_id;
    

    // Delete the resource using the public ID
    const deletionResult = await cloudinary.uploader.destroy(publicId);
    return deletionResult;
  } catch (error) {
    console.log("Error while deleting from Cloudinary: ", error);
    return null;
  }
}

export {uploadOnCloudinary, deleteFromCloudinary};
