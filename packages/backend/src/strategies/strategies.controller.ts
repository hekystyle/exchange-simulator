import { BadRequestException, Controller, Get, Put, Query } from '@nestjs/common';
import rx from 'rxjs';
import { StrategiesService } from './strategies.service.js';

@Controller('strategies')
export class StrategiesController {
  constructor(private strategies: StrategiesService) {}

  @Get()
  find(): rx.Observable<Array<{ id: string; enabled: boolean }>> {
    return this.strategies.find().pipe(
      rx.map(({ id, strategy }) => ({
        id,
        enabled: strategy.enabled,
      })),
      rx.toArray(),
    );
  }

  @Put('enable')
  async enable(@Query('id') id: string): Promise<void> {
    const strategy = await this.strategies.findById(id);

    if (!strategy) throw new BadRequestException(`Strategy not found by ID: ${id}`);

    strategy.enable();
  }

  @Put('disable')
  async disable(@Query('id') id: string): Promise<void> {
    const strategy = await this.strategies.findById(id);

    if (!strategy) throw new BadRequestException(`Strategy not found by ID: ${id}`);

    strategy.disable();
  }
}
