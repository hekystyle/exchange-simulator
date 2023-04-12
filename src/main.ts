import { BTCEUR_YEAR_DAILY_CANDLES } from './data';
import { SimulatedExchange } from './SimulatedExchange';
import { StrategyDCA } from './StrategyDCA';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA';

export async function runSimulation() {
  const exchange = new SimulatedExchange();
  const strategies = [new StrategyDCA(), new StrategyEnhancedDCA(1)];
  strategies.forEach(strategy => strategy.setup(exchange));
  exchange.simulate(BTCEUR_YEAR_DAILY_CANDLES);

  return { exchange };
}
