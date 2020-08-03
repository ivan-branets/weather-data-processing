import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Result } from './models';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/v1')
  v1(): Result {
    return this.appService.v1();
  }

  @Get('/v2')
  v2(): Result {
    return this.appService.v2();
  }

  @Get('/v3')
  v3(): Result {
    return this.appService.v3();
  }

  @Get('/v4')
  v4(): Result {
    return this.appService.v4();
  }

  @Get('/v5')
  v5(): Result {
    return this.appService.v5();
  }

  @Get('/v6')
  v6(): Result {
    return this.appService.v6();
  }

  @Get('/v7')
  v7(): Promise<Result> {
    return this.appService.v7();
  }

  @Get('/v9')
  v9(@Query('cityId') cityId): Promise<Result> {
    return this.appService.v9(cityId);
  }

  @Get('/v10')
  v10(@Query('cityId') cityId): Promise<Result> {
    return this.appService.v10(cityId);
  }

  @Get('/v11')
  v11(@Query('cityId') cityId): Promise<Result> {
    return this.appService.v11(cityId);
  }

  @Get('/v12')
  v12(@Query('cityId') cityId): Promise<Result> {
    return this.appService.v12(cityId);
  }
}
