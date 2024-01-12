import { Router } from "express";
import { addVideo } from "../controllers/video.controller.js";
const router = Router();
router.route("/create").post(addVideo);
export default router;