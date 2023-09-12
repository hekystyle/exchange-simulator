import { BadRequestException, Controller, Get, Post, Query } from '@nestjs/common';
import rx from 'rxjs';
import { StrategiesService } from './strategies.service.js';

@Controller('strategies')
export class StrategiesController {
  constructor(private strategies: StrategiesService) {}

  @Get()
  async find() {
    return this.strategies.find().pipe(
      rx.map(({ id, strategy }) => ({
        id,
        enabled: strategy.enabled,
      })),
    );
  }

  @Post('enable')
  enable(@Query('id') id: string): rx.Observable<never> {
    return this.strategies.findById(id).pipe(
      rx.throwIfEmpty(() => new BadRequestException(`Strategy with id "${id}" not found`)),
      rx.map(s => s?.enable()),
      rx.ignoreElements(),
    );
  }

  @Post('disable')
  disable(@Query('id') id: string): rx.Observable<never> {
    return this.strategies.findById(id).pipe(
      rx.throwIfEmpty(() => new BadRequestException(`Strategy with id "${id}" not found`)),
      rx.map(s => s?.disable()),
      rx.ignoreElements(),
    );
  }
}
