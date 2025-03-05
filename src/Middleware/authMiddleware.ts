import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import getClientIp from "../Helper/getIp";
interface JwtPayload {
  id: string,
  email: string,
  userType: string,
  ipAdress:string,
  iat: number,
  exp: number,
}


interface adminJwtPayload {
  adminId: string;
  adminName: string;
  ipAddress: string
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {

  console.log(req.url);
  if (req.url.startsWith("/admin")) {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new Error("Unauthorized: Missing authorization header for admin");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized: Missing Admin token");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "") as adminJwtPayload;
    //req.admin = payload; 

    (req as any).admin = payload;

    const clientip:string = getClientIp(req);
   
    console.log('clientip',clientip);
    console.log('payload',payload.ipAddress,!(clientip.localeCompare(payload.ipAddress)!==0));
    
    if((clientip.localeCompare(payload.ipAddress)!==0)){
      throw new Error("Unauthorized: Invalid IP Please login again");
    }

    next();
    return;
  }



  try {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new Error("Unauthorized: Missing authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized: Missing token");
    }

    
    const clientip:string = getClientIp(req);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "defaultSecretKey") as JwtPayload;
    
    // console.log('clientip',clientip);
    // console.log('payload',payload.ipAdress);
    // console.log('payload',payload.ipAdress,!(clientip.localeCompare(payload.ipAdress)!==0));
    
    if((clientip.localeCompare(payload.ipAdress)!==0)){
      throw new Error("Unauthorized: Invalid IP Please login again");
    }
    const Credate = new Date(payload.iat * 1000);
    const Expdate = new Date(payload.exp * 1000);

    // if(Expdate < new Date()){
    //   throw new Error("Unauthorized: Token Expired,Please Login Again");
    // }
    

    (req as any).user = payload;

    next();
  
  } catch (err) {
    next(err);
  }
  
};

export default authMiddleware;


// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// interface JwtPayload {
//   id: string,
//   email: string,
//   userType: string,
// }

// const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {

//   try {

//     const authHeader = req.headers["authorization"];

//     if (!authHeader) {
//       throw new Error("Unauthorized: Missing authorization header");
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       throw new Error("Unauthorized: Missing token");
//     }

//     const payload = jwt.verify(token, process.env.JWT_SECRET || "defaultSecretKey") as JwtPayload;
    

//     (req as any).user = payload;

//     next();
//   } catch (err) {
//     next(err);
//   }
  
// };

// export default authMiddleware;
