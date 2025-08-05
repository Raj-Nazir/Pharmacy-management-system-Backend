// middleware/errorMiddleware.js

// If the   route was not matched by any defined route, this line creates a new error object with a message indicating that the requested route was not found.

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: err.message,
  });
};
