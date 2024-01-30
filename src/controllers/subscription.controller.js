import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  if (!channelId?.trim()) {
    throw new ApiError(400, "channelId is missing");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId format");
  }

  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }
  const existingSubscriber = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (existingSubscriber) {
    await Subscription.findByIdAndDelete(existingSubscriber._id);
    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Unsubscribed Successfully"));
  } else {
    const subscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });

    const subscribedUser = await Subscription.findById(subscription._id);

    if (!subscribedUser) {
      throw new ApiError(500, "Something went wrong while subscribing");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, subscribedUser, "Channel Subscribed Successfully!")
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId?.trim()) {
    throw new ApiError(400, "channelId is missing");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId format");
  }
  const subscribers = await Subscription.find({
    channel : channelId
  })
  
  return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscriber Fetched Successfully!")
      );

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId?.trim()) {
    throw new ApiError(400, "subscriberId is missing");
  }
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriberId format");
  }
  const channels = await Subscription.find({
    subscriber : subscriberId
  })
  
  return res
      .status(200)
      .json(
        new ApiResponse(200, channels, "Channels Fetched Successfully!")
      );


});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
