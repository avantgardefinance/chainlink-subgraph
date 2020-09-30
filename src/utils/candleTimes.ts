import { BigInt } from '@graphprotocol/graph-ts';

let hour = BigInt.fromI32(3600);
let day = BigInt.fromI32(86400);
let week = BigInt.fromI32(604800);
let weekAdjustment = BigInt.fromI32(345600);

// export function getHourlyCandleTimes(timestamp: BigInt): [BigInt, BigInt] {
//   let start = getStartTime(timestamp, hour);
//   let end = start.plus(hour);
//   return [start, end];
// }

// export function getDailyCandleTimes(timestamp: BigInt): [BigInt, BigInt] {
//   let start = getStartTime(timestamp, day);
//   let end = start.plus(day);
//   return [start, end];
// }

// export function getWeeklyCandleTimes(timestamp: BigInt): [BigInt, BigInt] {
//   let start = getStartTime(timestamp, week, weekAdjustment);
//   let end = start.plus(day);
//   return [start, end];
// }

// export function getStartTime(timestamp: BigInt, interval: BigInt, adjustment?: BigInt): BigInt {
//   let excess = timestamp.minus(adjustment || BigInt.fromI32(0)).mod(interval);
//   return timestamp.minus(excess);
// }

export function getPreviousStartTime(current: BigInt, type: string): BigInt {
  if (type == 'Hourly') {
    return current.minus(hour);
  } else if (type == 'Daily') {
    return current.minus(day);
  }
  return current.minus(week);
}
