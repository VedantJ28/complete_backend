import { Router } from "express";
import { 
    loginUser,
    logoutUser,
    registerUser,
    accessTokenRefresh,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvater,
    updateUserCoverImage,
    getChannelDetails,
    getWatchHistory
    } 
    from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    ]),
    registerUser
);
router.route('/login').post(loginUser);

// secure routes

router.route('/logout').post(verifyJWT ,logoutUser);
router.route('/refresh-token').post(accessTokenRefresh);

router.route('/change-password').post(verifyJWT, changeCurrentPassword);

router.route('/me').get(verifyJWT, getCurrentUser);

router.route('/update-account-details').patch(verifyJWT, updateAccountDetails);
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvater);
router.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

router.route('/getChannelDetails/:username').get(getChannelDetails);
router.route('/getWatchHistory').get(verifyJWT, getWatchHistory);



export default router;