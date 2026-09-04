import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not define in environment variables");
}

// if(!process.env.REFRESH_TOKEN){
//     throw new Error("REFRESH_TOKEN is not define in environment variables")
// }
// if(!process.env.ACCESS_TOKEN){
//     throw new Error("ACCESS_TOKEN is not define in environment variables")
// }

if (!process.env.JWT_SCRET) {
  throw new Error("JWT_SCRET is not define in environment variables");
}

const config = {
  MONGO_URI: process.env.MONGO_URI,
  // REFRESH_TOKEN:,
  // ACCESS_TOKEN:,
  JWT_SCRET: process.env.JWT_SCRET,
};

export default config;
