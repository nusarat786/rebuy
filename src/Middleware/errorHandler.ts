import { Request, Response, NextFunction } from 'express';

const errorHandler =  (err: any, req: Request, res: Response, next: NextFunction) => {
  //console.error(err); 

  console.log("Eror name",err.name)
  console.log("Eror ",err)

  let status = 500;
  let message = 'Internal Server Error';

  
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message || 'Validation Error';
  } else if (err.name === 'MongoError') {
    status = 400;
    message = 'Database Error';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid Data Format';
  }

  
  res.status(status).json({
    success: false,
    message: err.message || message,
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    errorObj:process.env.NODE_ENV === 'production' ? undefined : err,

  });



}

export default errorHandler;
