import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const totalVideoViews = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalSubscribers = await Subscription.countDocuments({ channel: req.user._id });

  const totalVideos = await Video.countDocuments({ owner: req.user._id });

  const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: req.user._id }, "_id") } });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVideoViews, totalSubscribers, totalVideos, totalLikes },
        "Channel Stats Fetched Successfully"
      )
    );

});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.find({
    owner : req.user._id
  })

  if(!videos){
    throw new ApiError(500, "Something went wrong while fetching videos of user");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, videos, "Videos of Channel Fetched Successfully"));
});

export { getChannelStats, getChannelVideos };
