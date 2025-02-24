'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { TimePicker } from '../ui/time-picker';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  dateTime: z.date(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function DateTimePickerForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateTime: new Date(),
    },
  });

  function onSubmit(values: FormSchemaType) {
    console.log(values);
    toast({
      title: 'Form submitted',
      description: `Selected date and time: ${format(values.dateTime, 'PPP HH:mm:ss')}`,
    });
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dateTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date and Time</FormLabel>
              <div className="relative">
                <Button
                  ref={buttonRef}
                  type="button"
                  variant={'outline'}
                  className={cn(
                    'w-[280px] justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, 'PPP HH:mm:ss')
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                </Button>
                {isOpen && (
                  <div
                    ref={calendarRef}
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        if (newDate) {
                          const newDateTime = new Date(field.value);
                          newDateTime.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                          field.onChange(newDateTime);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                    <div className="p-3 border-t border-gray-200">
                      <TimePicker
                        setDate={(newDate) => {
                          field.onChange(newDate);
                          setDate(newDate);
                        }}
                        date={field.value}
                      />
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}