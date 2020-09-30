import { BigInt } from '@graphprotocol/graph-ts';

export let hour = BigInt.fromI32(3600);
export let day = BigInt.fromI32(86400);
export let week = BigInt.fromI32(604800);

export let hourAdjustment = BigInt.fromI32(0);
export let dayAdjustment = BigInt.fromI32(0);
export let weekAdjustment = BigInt.fromI32(345600);

export function getPreviousStartTime(current: BigInt, type: string): BigInt {
  if (type == 'Hourly') {
    return current.minus(hour);
  } else if (type == 'Daily') {
    return current.minus(day);
  }
  return current.minus(week);
}
