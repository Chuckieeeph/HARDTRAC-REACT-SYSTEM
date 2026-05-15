import { ZodError } from "zod";
import { httpError } from "./httpError.js";

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.validated = {
        body: schema.body ? schema.body.parse(req.body) : req.body,
        query: schema.query ? schema.query.parse(req.query) : req.query,
        params: schema.params ? schema.params.parse(req.params) : req.params
      };
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(httpError(400, err.issues.map((i) => i.message).join(", ")));
      }
      return next(err);
    }
  };
}

