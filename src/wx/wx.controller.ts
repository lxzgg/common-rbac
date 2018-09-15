import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { WxService } from './wx.service';

@Controller()
export class WxController {
  private readonly adminService: AdminService;
  private readonly wxService: WxService;

  constructor(wxService: WxService, adminService: AdminService) {
    this.wxService = wxService;
    this.adminService = adminService;
  }

  @Get('wx')
  admin() {
    return this.wxService.admin();
  }

  @Get('wx1')
  admin1() {
    return this.adminService.admin();
  }
}