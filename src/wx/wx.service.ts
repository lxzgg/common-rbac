import { Injectable } from '@nestjs/common';

@Injectable()
export class WxService {
  admin() {
    return 'WxService';
  }
}