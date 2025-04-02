import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    
    // You can access the message from the exception and format it as needed
    const exceptionResponse = exception.getResponse();
    const message = (typeof exceptionResponse === 'string') ? exceptionResponse : exceptionResponse['message'];

    // Custom response structure
    if (status >= 400) {
      response.status(status).json({
        error: {
          message: message || 'Something went wrong',
          statusCode: status,
        },
      });
    } else {
      response.status(status).json({
        data: {
          message: message || 'Request was successful',
          statusCode: status,
        },
      });
    }
  }
}
