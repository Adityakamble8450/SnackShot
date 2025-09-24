import express from "express"
const router = express.Router()
import { foodAuthmiddleware } from "../middlewares/auth.middleware.js"
import { getFoodpartnerId } from "../controller/getFoodpartnerId.controller.js"
import { getFoodPartnerProfile } from "../controller/getFoodPartnerProfile.controller.js"


router.get("/:id", foodAuthmiddleware , getFoodpartnerId)
router.get("/profile/:id", getFoodPartnerProfile)


export default router