import { isPlainObject } from '../Utils';

export function getFields<
  TAccesorData extends object | undefined | null,
  TAccesorKeys extends keyof TAccesorData
>(accessor: TAccesorData, ...keys: TAccesorKeys[]): TAccesorData {
  if (accessor == null) return accessor;

  if (keys.length) {
    for (const key of keys) {
      //@ts-expect-error
      accessor[key];
    }
  } else {
    for (const key in accessor) {
      //@ts-expect-error
      accessor[key];
    }
  }

  return accessor;
}

export function getArrayFields<
  TArrayValue extends object | null | undefined,
  TArray extends TArrayValue[] | null | undefined,
  TArrayValueKeys extends keyof NonNullable<TArray>[number]
>(accessorArray: TArray, ...keys: TArrayValueKeys[]): TArray {
  if (accessorArray == null) return accessorArray;

  if (Array.isArray(accessorArray)) {
    for (const value of accessorArray) {
      if (isPlainObject(value)) {
        getFields(value, ...keys);
        break;
      }
    }
  }
  return accessorArray;
}