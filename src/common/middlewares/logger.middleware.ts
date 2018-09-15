import { MiddlewareFunction, NestMiddleware } from '@nestjs/common';

export class LoggerMiddleware implements NestMiddleware {
  resolve(...args: any[]): MiddlewareFunction | Promise<MiddlewareFunction> {
    console.log(args);
    return (req, res, next) => {
      console.log(`${args} Request...`);
      next();
    };
  }
}