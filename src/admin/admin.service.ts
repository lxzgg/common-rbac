import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  admin() {
    return 'AdminService';
  }
}