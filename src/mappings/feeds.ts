import {
  Candle,
  createMissingDailyCandles, createMissingHourlyCandles, updateDailyCandle, updateHourlyCandle,
  updateWeeklyCandle
} from '../entities/Candles';
import { createPrice } from '../entities/Price';
import { ensurePriceFeed } from '../entities/PriceFeed';
import { AnswerUpdated, NewRound } from '../generated/AggregatorInterface';


export function handleAnswerUpdatedForPair(
  pair: string,
  event: AnswerUpdated,
): void {
  let feed = ensurePriceFeed(event, pair);
  let price = createPrice(event, feed);
  let hourly = updateHourlyCandle(price);
  let daily = updateDailyCandle(price);
  let weekly = updateWeeklyCandle(price);

  createMissingHourlyCandles(feed, hourly as Candle);
  createMissingDailyCandles(feed, daily as Candle);

  feed.latestPrice = price.id;
  feed.latestHourlyCandle = hourly.id;
  feed.latestDailyCandle = daily.id;
  feed.latestWeeklyCandle = weekly.id
  feed.save();
}

export function handleNewRoundForPair(pair: string, event: NewRound): void {
  // TODO: Do this later.
}
