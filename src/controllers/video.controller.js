import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/cloudinary.js";
import { extractPublicId } from "cloudinary-build-url";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // Define the base query
  let videoQuery = {};

  // Apply filters based on the request parameters
  if (query) {
    videoQuery = { ...videoQuery, title: new RegExp(query, "i") };
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId format");
    }
    videoQuery = { ...videoQuery, owner: userId };
  }

  // Get the total count of videos matching the query
  const totalVideos = await Video.countDocuments(videoQuery);
  // Apply sorting based on sortBy and sortType
  let sortCriteria = {};
  if (sortBy) {
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
  }

  // Retrieve videos based on pagination, query, and sort
  const videos = await Video.find(videoQuery)
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos Fetched Successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // Validiation
  if (!title || !description) {
    throw new ApiError(400, "All field are required!");
  }

  // Uploading Files on local server

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video File is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail Image is required");
  }

  // Uploading Files on Cloudinary

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "videoFile is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail is required");
  }
  // Saving data in DB
  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: videoFile?.duration,
    owner: req.user._id,
  });

  const uploadedVideo = await Video.findById(video._id);

  if (!uploadedVideo) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedVideo, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched By ID Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }

  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "All Fields are required");
  }
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    new ApiError(400, "Thumbnai Local File is Missing");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    new ApiError(400, "Error while uploading on cloudinary");
  }

  // Deleting Old Avatar
  const oldVideo = await Video.findById(videoId);
  const oldThumbnailURL = oldVideo.thumbnail;
  if (!oldThumbnailURL) {
    new ApiError(400, "Old Thumbnail not found");
  }
  const tpid = extractPublicId(oldThumbnailURL);

  const oldThumbnail = await deleteFromCloudinary(tpid);
  if (!oldThumbnail) {
    new ApiError(400, "Error while deleting from cloudinary");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
        title,
        description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }
  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(500, "Video File Not Found");
  }

  // Delete Video File From Coudinary
  const vpid = extractPublicId(video.videoFile);
  const videoFile = await deleteVideoFromCloudinary(vpid);
  if (!videoFile) {
    throw new ApiError(500, "Error while deleting Video File from cloudinary");
  }

  // Delete Thumbnail File From Coudinary
  const tpid = extractPublicId(video.thumbnail);
  const thumbnailFile = await deleteFromCloudinary(tpid);

  if (!tpid) {
    throw new ApiError(
      500,
      "Error while deleting Thumbnail File from cloudinary"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted  Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is missing");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }
  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Status Toggled Successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
