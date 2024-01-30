import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const verifyIsOwnerForVideo = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      throw new ApiError(401, "Video ID Not Found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(401, "Video Not Found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "You are not the owner of this.");
    }
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Video Not Found");
  }
});

const verifyIsOwnerForTweet = asyncHandler(async (req, res, next) => {
  try {
    const { tweetId } = req.params;

    if (!tweetId) {
      throw new ApiError(401, "Tweet ID Not Found");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(401, "Tweet Not Found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "You are not the owner of this.");
    }
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Tweet Not Found");
  }
});

const verifyIsOwnerForComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      throw new ApiError(401, "Comment ID Not Found");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(401, "Comment Not Found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "You are not the owner of this.");
    }
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment Not Found");
  }
});

export { verifyIsOwnerForVideo, verifyIsOwnerForTweet, verifyIsOwnerForComment };
