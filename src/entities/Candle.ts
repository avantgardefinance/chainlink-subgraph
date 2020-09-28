import { BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';
import { DailyCandle, HourlyCandle, Price, PriceFeed, WeeklyCandle } from '../generated/schema';
import { calculateAverage, calculateMedian } from '../utils/math';
import { ensureAggregate } from './Aggregate';

export function updateHourlyCandle(price: Price): HourlyCandle {
  let interval = BigInt.fromI32(3600);
  let adjustment = BigInt.fromI32(0);
  return updateCandle('Hourly', interval, adjustment, price) as HourlyCandle;
}

export function updateDailyCandle(price: Price): DailyCandle {
  let interval = BigInt.fromI32(86400);
  let adjustment = BigInt.fromI32(0);
  return updateCandle('Daily', interval, adjustment, price) as DailyCandle;
}

export function updateWeeklyCandle(price: Price): WeeklyCandle {
  let interval = BigInt.fromI32(604800);
  let adjustment = BigInt.fromI32(345600);
  return updateCandle('Weekly', interval, adjustment, price) as WeeklyCandle;
}

export function createMissingHourlyCandles(feed: PriceFeed, latest: Candle): void {
  let previous = feed.latestHourlyCandle;
  let interval = BigInt.fromI32(3600);
  createMissingCandles('Hourly', feed, latest, previous, interval);
}

export function createMissingDailyCandles(feed: PriceFeed, latest: Candle): void {
  let previous = feed.latestDailyCandle;
  let interval = BigInt.fromI32(86400);
  createMissingCandles('Daily', feed, latest, previous, interval);
}

export function createMissingWeeklyCandles(feed: PriceFeed, latest: Candle): void {
  let previous = feed.latestDailyCandle;
  let interval = BigInt.fromI32(604800);
  createMissingCandles('Weekly', feed, latest, previous, interval);
}

export function createMissingCandles(
  type: string,
  feed: PriceFeed,
  latest: Candle,
  previd: string,
  interval: BigInt,
): void {
  let previous = Candle.load(type, previd);
  if (!previous) {
    return;
  }

  let open = previous.openTimestamp;
  let prices = previous.includedPrices;
  let last = prices[prices.length - 1];
  let price = Price.load(last) as Price;

  while (price != null && open.plus(interval).lt(latest.openTimestamp)) {
    open = open.plus(interval);
    let id = feed.id + '/' + open.toString();
    let candle = createCandle(id, type, price, open, open.plus(interval));
    candle.save(type);
  }
}

export function createCandle(id: string, type: string, price: Price, open: BigInt, close: BigInt): Candle {
  let candle = new Candle(id);
  candle.aggregate = ensureAggregate(type, open, close).id;
  candle.openTimestamp = open;
  candle.closeTimestamp = close;
  candle.assetPair = price.assetPair;
  candle.priceFeed = price.priceFeed;
  candle.averagePrice = price.price;
  candle.medianPrice = price.price;
  candle.openPrice = price.price;
  candle.closePrice = price.price;
  candle.highPrice = price.price;
  candle.lowPrice = price.price;
  candle.includedPrices = [price.id];
  return candle;
}

export function updateCandle(type: string, interval: BigInt, adjustment: BigInt, price: Price): Candle {
  let excess = price.timestamp.minus(adjustment).mod(interval);
  let open = price.timestamp.minus(excess);

  let id = price.priceFeed + '/' + open.toString();
  let candle = Candle.load(type, id);

  if (!candle) {
    candle = createCandle(id, type, price, open, open.plus(interval));
  } else {
    candle.includedPrices = candle.includedPrices.concat([price.id]);
    let prices = candle.includedPrices.map<BigInt>((id) => Price.load(id).price);

    candle.averagePrice = calculateAverage(prices);
    candle.averagePrice = calculateMedian(prices);
    candle.closePrice = price.price;

    if (price.price.lt(candle.lowPrice)) {
      candle.lowPrice = price.price;
    }

    if (price.price.gt(candle.highPrice)) {
      candle.highPrice = price.price;
    }
  }

  candle.save(type);

  return candle as Candle;
}

export class Candle extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'Candle', this.get('id').toString(), this);
  }

  static load(type: string, id: string): Candle | null {
    return store.get(type + 'Candle', id) as Candle | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get aggregate(): string {
    let value = this.get('aggregate');
    return value.toString();
  }

  set aggregate(value: string) {
    this.set('aggregate', Value.fromString(value));
  }

  get priceFeed(): string {
    let value = this.get('priceFeed');
    return value.toString();
  }

  set priceFeed(value: string) {
    this.set('priceFeed', Value.fromString(value));
  }

  get assetPair(): string {
    let value = this.get('assetPair');
    return value.toString();
  }

  set assetPair(value: string) {
    this.set('assetPair', Value.fromString(value));
  }

  get openTimestamp(): BigInt {
    let value = this.get('openTimestamp');
    return value.toBigInt();
  }

  set openTimestamp(value: BigInt) {
    this.set('openTimestamp', Value.fromBigInt(value));
  }

  get closeTimestamp(): BigInt {
    let value = this.get('closeTimestamp');
    return value.toBigInt();
  }

  set closeTimestamp(value: BigInt) {
    this.set('closeTimestamp', Value.fromBigInt(value));
  }

  get averagePrice(): BigInt {
    let value = this.get('averagePrice');
    return value.toBigInt();
  }

  set averagePrice(value: BigInt) {
    this.set('averagePrice', Value.fromBigInt(value));
  }

  get medianPrice(): BigInt {
    let value = this.get('medianPrice');
    return value.toBigInt();
  }

  set medianPrice(value: BigInt) {
    this.set('medianPrice', Value.fromBigInt(value));
  }

  get openPrice(): BigInt {
    let value = this.get('openPrice');
    return value.toBigInt();
  }

  set openPrice(value: BigInt) {
    this.set('openPrice', Value.fromBigInt(value));
  }

  get closePrice(): BigInt {
    let value = this.get('closePrice');
    return value.toBigInt();
  }

  set closePrice(value: BigInt) {
    this.set('closePrice', Value.fromBigInt(value));
  }

  get lowPrice(): BigInt {
    let value = this.get('lowPrice');
    return value.toBigInt();
  }

  set lowPrice(value: BigInt) {
    this.set('lowPrice', Value.fromBigInt(value));
  }

  get highPrice(): BigInt {
    let value = this.get('highPrice');
    return value.toBigInt();
  }

  set highPrice(value: BigInt) {
    this.set('highPrice', Value.fromBigInt(value));
  }

  get includedPrices(): Array<string> {
    let value = this.get('includedPrices');
    return value.toStringArray();
  }

  set includedPrices(value: Array<string>) {
    this.set('includedPrices', Value.fromStringArray(value));
  }
}
