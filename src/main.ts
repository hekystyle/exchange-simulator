import { BTCEUR_YEAR_DAILY_CANDLES } from './data';
import { SimulatedExchange } from './SimulatedExchange';
import { StatisticsCollector } from './StatisticsCollector';
import { StrategyDCA } from './StrategyDCA';
import { StrategyEnhancedDCA } from './StrategyEnhancedDCA';

export async function runSimulation() {
  const exchange = new SimulatedExchange();
  const strategies = [new StrategyDCA(), new StrategyEnhancedDCA(1)];
  strategies.forEach(strategy => strategy.setup(exchange));
  new StatisticsCollector(exchange).setup();

  exchange.simulate(BTCEUR_YEAR_DAILY_CANDLES);

  return { exchange };
}
