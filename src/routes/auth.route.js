import { Router } from "express";
import { getRefreshTokenController, getUserController, logoutAllUserController, logoutUserController, userRegisterController } from "../controller/auth.controller.js";

const router = Router()

router.post('/register',userRegisterController)

router.post('/login',loginUserController)

router.get('/getme',getUserController)

router.get('/refresh-token',getRefreshTokenController)

router.get('/logout',logoutUserController)

router.get('/logout-all',logoutAllUserController)

export default router