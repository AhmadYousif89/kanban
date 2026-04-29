'use client';

import type { z } from 'zod';
import * as React from 'react';
import { Slot } from 'radix-ui';
import { Controller, FormProvider, useFormContext, useForm, useFormState } from 'react-hook-form';
import type {
  FieldPath,
  FieldValues,
  UseFormProps,
  UseFormReturn,
  ControllerProps,
  Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Field, FieldError } from '@/components/ui/field';

interface FormProps<TFieldValues extends FieldValues> extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> {
  form: UseFormReturn<TFieldValues, unknown, TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
}

const Form = <TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: FormProps<TFieldValues>) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(className)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
};

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { control, getFieldState } = useFormContext();
  const formState = useFormState({ control, name: fieldContext?.name });

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <Field data-slot='form-item' className={cn('gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
};

FormItem.displayName = 'FormItem';

const FormLabel = ({ className, ...props }: React.ComponentProps<'label'>) => {
  const { formItemId, error } = useFormField();

  return (
    <Label
      className={cn(
        error && 'text-destructive',
        'text-xs font-bold text-muted-foreground dark:text-white',
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
};

FormLabel.displayName = 'FormLabel';

const FormControl = ({ ...props }: React.ComponentProps<typeof Slot.Root>) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot.Root
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      data-invalid={!!error}
      {...props}
    />
  );
};

FormControl.displayName = 'FormControl';

const FormMessage = ({
  className,
  children,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) return null;

  return (
    <FieldError
      id={formMessageId}
      errors={error ? [error] : []}
      className={cn('text-xs font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </FieldError>
  );
};

FormMessage.displayName = 'FormMessage';

function useCustomForm<T extends FieldValues>(
  args: Omit<UseFormProps<T>, 'resolver'> & { schema: z.ZodTypeAny },
) {
  const { schema, ...props } = args;
  return useForm({
    ...props,
    resolver: zodResolver(schema as never) as Resolver<T, unknown, T>,
  }) as UseFormReturn<T, unknown, T>;
}

export {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  FormField,
  useFormField,
  useCustomForm,
};
