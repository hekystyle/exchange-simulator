import { BTCEUR_YEAR_DAILY_CANDLES } from './data';
import { SimulatedExchange } from './SimulatedExchange';
import { StrategyDCA } from './StrategyDCA';

export async function runSimulation() {
  const exchange = new SimulatedExchange(BTCEUR_YEAR_DAILY_CANDLES[0]?.open ?? 0);
  const strategies = [new StrategyDCA()];
  strategies.forEach(strategy => strategy.setup(exchange));
  exchange.simulate();

  return { exchange };
}
