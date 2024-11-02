import { Request, Response } from "express";
import { catchError } from "../../helpers/catch/CatchErrorHelper";
import { handleResponse } from "../../helpers/response/HandleResponseHelper";
export const healthCheck = catchError(async (req: Request, res: Response): Promise<void> => {
  return handleResponse(res, 200, "OK", null);
});
