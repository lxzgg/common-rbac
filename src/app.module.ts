import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { WxModule } from './wx/wx.module';

@Module({
  imports: [AdminModule, WxModule],
})
export class AppModule {
}
