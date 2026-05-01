'use client';

import {
  type Control,
  type FieldArray,
  type FieldArrayPath,
  type FieldValues,
  useFieldArray,
} from 'react-hook-form';

type FieldArrayOptions<
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TFieldArrayName;
  maxItems: number;
  createItem: (currentCount: number) => FieldArray<TFieldValues, TFieldArrayName>;
  keyName?: string;
};

export function useLimitedFieldArray<
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues>,
>({
  control,
  createItem,
  keyName,
  maxItems,
  name,
}: FieldArrayOptions<TFieldValues, TFieldArrayName>) {
  const { fields, append, remove, ...fieldArray } = useFieldArray({
    control,
    name,
    keyName,
  });

  const hasReachedLimit = fields.length >= maxItems;

  const addItem = () => {
    if (hasReachedLimit) return;
    append(createItem(fields.length));
  };

  return {
    fields,
    append,
    remove,
    addItem,
    hasReachedLimit,
    itemCount: fields.length,
    ...fieldArray,
  };
}
