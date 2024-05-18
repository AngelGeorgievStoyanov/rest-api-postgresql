import { Request, Response, NextFunction } from "express";
function trimAndValidate(obj: any): void {
  function recursiveTrim(obj: any) {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].trim();
        if (obj[key].length === 0) {
          throw new Error(`${key} cannot be an empty string.`);
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        recursiveTrim(obj[key]);
      }
    }
  }

  recursiveTrim(obj);
}
export function trimBody(req: Request, res: Response, next: NextFunction) {
  const methodsToTrim = ["POST", "PUT", "PATCH"];
  if (methodsToTrim.includes(req.method)) {
    try {
      trimAndValidate(req.body);
      next();
    } catch (err) {
      console.log(err.message);
      return res.status(400).json(err.message);
    }
  } else {
    next();
  }
}
