import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WxController } from './wx.controller';
import { WxService } from './wx.service';
import { AdminModule } from '../admin/admin.module';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';

@Module({
  imports: [AdminModule],
  controllers: [WxController],
  providers: [WxService],
})
export class WxModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(LoggerMiddleware).with('WxModule').exclude('wx').forRoutes(WxController);
  }
}