import express from "express";
import { register , login , logout , registerFoodPartner , loginFoodPartner , logoutFoodPartner , me } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/logout", logout);


router.post('/foodpartner/register' , registerFoodPartner)
router.post('/foodpartner/login' , loginFoodPartner)
router.get("/foodpartner/logout" , logoutFoodPartner)

// who am I / role detection
router.get('/me', me)

export default router;
