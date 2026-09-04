import userModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../model/session.model.js";

export const userRegisterController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All the field are required",
    });
  }

  const isUserExits = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExits) {
    return res.status(409).json({
      message: "User is already register",
    });
  }

  const user = await userModel.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
  });

  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SCRET, {
    expiresIn: "7d",
  });

  const salt = await bcrypt.genSalt(10);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

  const session = await sessionModel.create({
    userId: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    { id: user._id, sessionId: session._id },
    config.JWT_SCRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    message: "User register ",
    use: {
      username: user.username,
      email: user.email,
    },
    accessToken,
  });
};

export const getUserController = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token is not found",
    });
  }

  const decoded = jwt.verify(token, config.JWT_SCRET);

  const user = await userModel.findById(decoded.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

export const getRefreshTokenController = async (req, res) => {
  const refreshToken = req.cookie.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Token is not found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SCRET);

  const accessToken = jwt.sign({ id: user._id }, config.JWT_SCRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: decode }, config.JWT_SCRET, {
    expiresIn: "7d",
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    messaage: "Access token",
    accessToken,
  });
};
