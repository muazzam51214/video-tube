import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

export const verifyIsOwner = asyncHandler( async(req,res,next) => {

  try {
    const {videoId} = req.params;
  
    if(!videoId){
      throw new ApiError(401, "Video ID Not Found");
    }
    
  
    const video = await Video.findById(videoId);
    if(!video){
      throw new ApiError(401, "Video Not Found");
    }
    console.log('video.ownerId:', video.owner);
    console.log('req.user._id:', req.user._id);
  
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "You are not the owner of this.");
    }
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Video Not Found")
  }
})
