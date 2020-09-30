import { BigInt } from '@graphprotocol/graph-ts';

let hour = BigInt.fromI32(3600);
let day = BigInt.fromI32(86400);
let week = BigInt.fromI32(604800);

export function getPreviousStartTime(current: BigInt, type: string): BigInt {
  if (type == 'Hourly') {
    return current.minus(hour);
  } else if (type == 'Daily') {
    return current.minus(day);
  }
  return current.minus(week);
}
