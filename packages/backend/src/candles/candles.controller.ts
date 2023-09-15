import { BadRequestException, Controller, Get, ParseEnumPipe, ParseIntPipe, Query } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Controller('candles')
export class CandlesController {
  constructor(private readonly database: PrismaClient) {}

  @Get()
  async index(
    @Query('distinct', new ParseEnumPipe(Prisma.CandleScalarFieldEnum, { optional: true }))
    distinct: Prisma.CandleScalarFieldEnum,
    @Query('select')
    select: string,
  ) {
    return await this.database.candle.findMany({
      distinct,
      select: select ? { [select]: true } : null,
    });
  }

  @Get('range')
  async range(
    @Query('symbol')
    symbol: string,
    @Query('interval', ParseIntPipe)
    interval: number,
  ) {
    const [first, last] = await Promise.all([
      this.database.candle.findFirst({
        where: { symbol, interval },
        orderBy: { timestamp: 'asc' },
      }),
      this.database.candle.findFirst({
        where: { symbol, interval },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    if (!first || !last) throw new BadRequestException('No candles found');

    return {
      first: first.timestamp,
      last: last.timestamp,
    };
  }
}
