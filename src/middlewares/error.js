import { StatusCodes } from 'http-status-codes';

export default (err, _req, res, _next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: 'Internal server error' });
};
