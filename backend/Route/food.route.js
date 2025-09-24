import express from 'express'
import { createFood  , getFoodItems , likes , save, likeStatus, saveStatus, getSavedReels} from '../controller/food.controller.js'
import {foodAuthmiddleware , userAuthMiddleware, anyUserAuthMiddleware} from "../middlewares/auth.middleware.js"
import multer, { memoryStorage } from "multer"

const router = express.Router()

const upload = multer({
    storage : memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowed = ["video/mp4", "video/quicktime"]
        if (allowed.includes(file.mimetype)) return cb(null, true)
        cb(new Error("Invalid file format"))
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

// POST /api/food/upload-video
router.post("/upload-video" , foodAuthmiddleware , upload.single("videoFile"), createFood)

// GET /api/food/ (list for any authenticated user - normal users or food partners)
router.get("/" ,anyUserAuthMiddleware , getFoodItems)

router.post("/like" , anyUserAuthMiddleware ,likes )

router.post("/save" , anyUserAuthMiddleware , save)

// Bulk status endpoints
router.post("/like-status", anyUserAuthMiddleware, likeStatus)
router.post("/save-status", anyUserAuthMiddleware, saveStatus)

// Get saved reels for current user
router.get("/saved", anyUserAuthMiddleware, getSavedReels)

export default router


