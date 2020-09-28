import { BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';

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
  aggregate.save(type);

  return aggregate as Aggregate;
}

export class Aggregate extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'Aggregate', this.get('id').toString(), this);
  }

  static load(type: string, id: string): Aggregate | null {
    return store.get(type + 'Aggregate', id) as Aggregate | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
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

  get candles(): Array<string> {
    let value = this.get('candles');
    return value.toStringArray();
  }

  set candles(value: Array<string>) {
    this.set('candles', Value.fromStringArray(value));
  }
}
