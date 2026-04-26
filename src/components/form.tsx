'use client';

import type { z } from 'zod';
import * as React from 'react';
import { Slot } from 'radix-ui';
import { Controller, FormProvider, useFormContext, useForm as useRHForm } from 'react-hook-form';
import type {
  FieldPath,
  FieldValues,
  UseFormProps,
  UseFormReturn,
  ControllerProps,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Field, FieldError } from '@/components/ui/field';

interface FormProps<TFieldValues extends FieldValues> extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> {
  form: UseFormReturn<TFieldValues>;
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(className)}
        noValidate
        {...props}
      >
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
  const { getFieldState, formState } = useFormContext();

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

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <Field
          ref={ref}
          data-slot='form-item'
          className={cn('gap-2', className)}
          {...props}
        />
      </FormItemContext.Provider>
    );
  },
);

FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { formItemId, error } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        error && 'text-destructive',
        'text-xs font-bold text-muted-foreground dark:text-white',
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});

FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot.Root>,
  React.ComponentPropsWithoutRef<typeof Slot.Root>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot.Root
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      data-invalid={!!error}
      {...props}
    />
  );
});

FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
});

FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) return null;

  return (
    <FieldError
      ref={ref}
      id={formMessageId}
      errors={error ? [error] : []}
      className={cn('text-xs font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </FieldError>
  );
});

FormMessage.displayName = 'FormMessage';

function useForm<T extends FieldValues>(
  args: Omit<UseFormProps<T>, 'resolver'> & { schema: z.Schema<T, any, any> },
) {
  const { schema, ...props } = args;
  return useRHForm<T>({ ...props, resolver: zodResolver(schema) });
}

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useForm,
  useFormField,
};
