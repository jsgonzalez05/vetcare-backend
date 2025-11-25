// src/common/filters/mongo-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Error } from 'mongoose';

@Catch(Error)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let error = 'Internal Server Error';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof Error.CastError) {
      status = HttpStatus.BAD_REQUEST;
      error = `El ID proporcionado no es válido: ${exception.value}`;
    }
    
    if (exception instanceof Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Error de validación en los datos enviados';
    }

    response.status(status).json({
      statusCode: status,
      message: error,
      error: exception.name,
    });
  }
}