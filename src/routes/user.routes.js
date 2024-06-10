import { Router } from "express";
import { getCurrentUser, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {logoutUser} from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import {changeCurrentPassword} from "../controllers/user.controller.js";
import {updateAccountDetails} from "../controllers/user.controller.js";
import { updateUserAvatar } from "../controllers/user.controller.js";
import { updateUserCoverImage } from "../controllers/user.controller.js";
import {getUserChannelProfile} from "../controllers/user.controller.js";
import {getWatchHistory} from "../controllers/user.controller.js";
//import {getCurrentUser} from "../controllers/user.controller.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser);

 router.route("/login").post(upload.none(),loginUser);

 //secured routes
  router.route("/logout").post(verifyJWT,logoutUser);

  //router.route("/changePassword").post(verifyJWT,changeCurrentPassword);
  router.route("/changePassword").post(upload.none(), verifyJWT, changeCurrentPassword);

  

  router.route("/refreshAccessToken").post(refreshAccessToken)
  
//   router.route("/getCurrentUser").post(getCurrentUser)
router.route("/getCurrentUser").post(verifyJWT, getCurrentUser);


router.route("/updateAccountDetails").post(verifyJWT,upload.none(), updateAccountDetails);

router.route("/updateAvatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route("/updateCoverImage").patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/watchhistory").get(verifyJWT, getWatchHistory);
//router.route("/login").post(upload.none(), loginUser);

// export default router
export default router