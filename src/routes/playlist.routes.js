import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {verifyIsOwnerForPlaylist} from "../middlewares/verifyOwner.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(verifyIsOwnerForPlaylist, updatePlaylist)
    .delete(verifyIsOwnerForPlaylist, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyIsOwnerForPlaylist, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyIsOwnerForPlaylist, removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router