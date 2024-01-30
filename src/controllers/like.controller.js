import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Like removed from Video successfully!"));
  } else {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    const likedVideo = await Like.findById(like._id);

    if (!likedVideo) {
      throw new ApiError(500, "Something went wrong while liking video");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, likedVideo, "Video Liked Successfully!"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on video
  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId format");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(201)
      .json(
        new ApiResponse(200, {}, "Like removed from comment successfully!")
      );
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    const likedComment = await Like.findById(like._id);

    if (!likedComment) {
      throw new ApiError(500, "Something went wrong while liking comment");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, likedComment, "Comment Liked Successfully!"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on video
  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId format");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Like removed from tweet successfully!"));
  } else {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    const likedTweet = await Like.findById(like._id);

    if (!likedTweet) {
      throw new ApiError(500, "Something went wrong while liking Tweet");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, likedTweet, "Tweet Liked Successfully!"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
      },
    },

    {
      $unwind: "$videos",
    },

    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        _id: "$videos._id",
        title: "$videos.title",
        description: "$videos.description",
        videoFile: "$videos.videoFile",
        thumbnail: "$videos.thumbnail",
        duration: "$videos.duration",
        views: "$videos.views",
        owner: "$videos.owner",
        likesCount: "$likesCount",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos Fetched Successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
