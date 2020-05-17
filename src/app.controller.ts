import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/v1')
  v1(): string {
    return this.appService.v1();
  }

  @Get('/v2')
  v2(): string {
    return this.appService.v2();
  }

  @Get('/v3')
  v3(): string {
    return this.appService.v3();
  }

  @Get('/v4')
  v4(): string {
    return this.appService.v4();
  }

  @Get('/v5')
  v5(): string {
    return this.appService.v5();
  }

  @Get('/v6')
  v6(): string {
    return this.appService.v6();
  }
}
