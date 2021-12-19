
export interface AggregatesGroup<TID, TKey, TValue> {
  key: TID;
  aggregates: Map<TKey, TValue>;
}

export interface OrderedAggregate<TKey, TItem,TTotals> {
  key: TKey;
  first: TItem;
  last: TItem;
  low: TItem[];
  high: TItem[];
  totals: TTotals[];
  all: TItem[];
}
