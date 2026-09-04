import userModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../model/session.model.js";
import { sendEmail } from "../services/email.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../model/otp.model.js";

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

  // const salt = await bcrypt.genSalt(10);
  // const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

  // const refreshToken = jwt.sign({ id: user._id }, config.JWT_SCRET, {
  //   expiresIn: "7d",
  // });

  // const session = await sessionModel.create({
  //   userId: user._id,
  //   refreshTokenHash,
  //   ip: req.ip,
  //   userAgent: req.headers["user-agent"],
  // });

  // const accessToken = jwt.sign(
  //   { id: user._id, sessionId: session._id },
  //   config.JWT_SCRET,
  //   {
  //     expiresIn: "15m",
  //   },
  // );

  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  const otp = generateOtp();
  const html = getOtpHtml();

  const otpHash = await bcrypt.hash(otp, 10);
  await otpModel.create({
    email,
    user: user._id,
    otpHash,
  });

  return res.status(201).json({
    message: "User register ",
    use: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
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
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Token is not found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SCRET);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(400).json({
      messaage: "Invalid refresh token",
    });
  }

  const accessToken = jwt.sign({ id: decode }, config.JWT_SCRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: decode.id }, config.JWT_SCRET, {
    expiresIn: "7d",
  });

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  session.refreshTokenHash = newRefreshTokenHash;

  await session.save();

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

export const logoutUserController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      messaage: "Refresh token not found",
    });
  }

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(400).json({
      messaage: "Invalid refresh token",
    });
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "Logged out successfully",
  });
};

export const logoutAllUserController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      messaage: "Refresh token not found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SCRET);

  await sessionModel.updateMany(
    {
      user: decoded.id,
      revoked: false,
    },
    {
      revoked: true,
    },
  );

  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "Logged out from all devices sucessfully",
  });
};

export const loginUserController = async (req, res) => {
  const { email, password } = req.boady;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Incorrect Email",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SCRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await sessionModel.findOne({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  if (!session) {
    return res.status(400).json({
      messaage: "Invalid refresh token",
    });
  }

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

  res.status(200).json({
    messaage: "Logged In successfully ",
    user: {
      username: user.username,
      email: user.email,
    },
    accessToken,
  });
};
