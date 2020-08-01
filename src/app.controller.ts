import { Controller, Get } from '@nestjs/common';
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

  @Get('/v8')
  v8(): Promise<Result> {
    return this.appService.v8();
  }

  @Get('/v9')
  v9(): Promise<Result> {
    return this.appService.v9();
  }

  @Get('/v10')
  v10(): Promise<Result> {
    return this.appService.v10();
  }
}
