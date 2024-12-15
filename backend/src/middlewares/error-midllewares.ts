import { errors } from "@vinejs/vine";
import { Exception, FieldException, RecordNotFoundException, UnauthorizedException } from "../utils/exception-utils";
import { FastifyReply, FastifyRequest } from "fastify";

//
//
//
//

interface ErrorType {
  message: string;
  field?: string;
  data?: any;
}

//
//
//
//

export const handleError = (error: any, request: FastifyRequest, reply: FastifyReply) => {
  let errorsToSend: ErrorType[] = [];
  reply.status(400);
  if (error instanceof UnauthorizedException) {
    errorsToSend.push({ message: "Unauthorized" });
    reply.status(401);
  } else if (error instanceof RecordNotFoundException) {
    const errorObj = error.toObject();
    errorsToSend.push({ message: errorObj.message });
    reply.status(404);
  } else if (error instanceof errors.E_VALIDATION_ERROR) {
    errorsToSend = error.messages;
  } else if (error instanceof FieldException) {
    const errorObj = error.toObject();
    errorsToSend.push({ field: errorObj.field, message: errorObj.data.message });
  } else if (error instanceof Exception) {
    const errorObj = error.toObject();

    errorsToSend.push({ data: errorObj.options?.data, message: errorObj.message });
  } else if (error.name === "CastError") {
    errorsToSend.push({ message: "Id not valid" });
  } else {
    errorsToSend.push({ message: error?.message || "Error" });
  }

  console.log(error);
  
  console.log(errorsToSend);
  

  reply.send({ errors: errorsToSend });
};
