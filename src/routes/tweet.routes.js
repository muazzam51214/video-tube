import { Router } from "express";
import { postTweet } from "../controllers/tweet.controller.js";
const router = Router();
router.route("/post").post(postTweet);
export default router;