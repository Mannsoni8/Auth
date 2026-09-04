import { Router } from "express";
import { getRefreshTokenController, getUserController, logoutUserController, userRegisterController } from "../controller/auth.controller.js";

const router = Router()

router.post('/register',userRegisterController)

router.get('/getme',getUserController)

router.get('/refresh-token',getRefreshTokenController)

router.get('/logout',logoutUserController)

export default router