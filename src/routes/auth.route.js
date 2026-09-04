import { Router } from "express";
import { getRefreshTokenController, getUserController, userRegisterController } from "../controller/auth.controller.js";

const router = Router()

router.post('/register',userRegisterController)

router.get('/getme',getUserController)

router.get('/refresh-token',getRefreshTokenController)

export default router