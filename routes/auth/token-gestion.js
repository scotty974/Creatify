import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, emai: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


export const generateRefreshToken = (user) =>{
    return jwt.sign({id : user.id, email: user.email}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : "7d"
    })
}