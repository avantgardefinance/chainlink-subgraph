import { BigInt } from '@graphprotocol/graph-ts';
import { Price } from '../generated/schema';
import { getPreviousStartTime } from '../utils/candleTimes';
import { logCritical } from '../utils/logCritical';
import { createCandle } from './Candle';
import { Aggregate, Candle } from './Entity';
import { usePriceFeed } from './PriceFeed';

export function aggregateId(type: String, open: BigInt): string {
  return type + '/' + open.toString();
}

export function ensureAggregate(type: string, open: BigInt, close: BigInt): Aggregate {
  let id = aggregateId(type, open);
  let aggregate = Aggregate.load(type, id) as Aggregate;

  if (aggregate) {
    return aggregate;
  }

  aggregate = new Aggregate(id);
  aggregate.openTimestamp = open;
  aggregate.closeTimestamp = close;
  aggregate.candles = [];
  aggregate.save(type);

  // need to do this
  aggregate.candles = prePopulateCandles(type, open, close).map<string>((candle) => candle.id);
  aggregate.save(type);

  return aggregate;
}

export function useAggregate(type: string, id: string): Aggregate {
  let aggregate = Aggregate.load(type, id) as Aggregate;
  if (aggregate == null) {
    logCritical('{} Aggregate {} does not exist', [type, id]);
  }
  return aggregate;
}

export function prePopulateCandles(type: string, open: BigInt, close: BigInt): Candle[] {
  let previousAggregateId = aggregateId(type, getPreviousStartTime(open, type));
  let previousAggregate = Aggregate.load(type, previousAggregateId);

  if (previousAggregate == null) {
    return [] as Candle[];
  }

  let newCandles: Candle[] = [];
  let candles = previousAggregate.candles;
  for (let i: i32 = 0; i < candles.length; i++) {
    let previousCandle = Candle.load(type, candles[i]);
    if (previousCandle == null) {
      continue;
    }

    let prices = previousCandle.includedPrices;
    let last = prices[prices.length - 1];
    let price = Price.load(last) as Price;

    if (price == null) {
      continue;
    }

    let newCandleId = usePriceFeed(previousCandle.priceFeed).id + '/' + open.toString();
    let newCandle = createCandle(newCandleId, type, price, open, close);
    newCandles = newCandles.concat([newCandle]);
  }

  return newCandles;
}
