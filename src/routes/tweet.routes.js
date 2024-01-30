import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOwnerForTweet } from "../middlewares/verifyOwner.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router
  .route("/:tweetId")
  .patch(verifyIsOwnerForTweet, updateTweet)
  .delete(verifyIsOwnerForTweet, deleteTweet);

export default router;
