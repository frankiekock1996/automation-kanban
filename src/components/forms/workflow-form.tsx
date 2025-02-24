import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useModal } from '@/providers/modal-provider';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';

// Define the schema outside the component
const WorkflowFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  pilotStartDate: z.date(),
  pilotEndDate: z.date(),
  frcDate: z.date(),
});

type Props = {
  subTitle?: string;
  title?: string;
};

const WorkflowForm = ({ subTitle, title }: Props) => {
  const { setClose } = useModal();
  const form = useForm<z.infer<typeof WorkflowFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(WorkflowFormSchema),
    defaultValues: {
      name: '',
      description: '',
      pilotStartDate: new Date(),
      pilotEndDate: new Date(),
      frcDate: new Date(),
    },
  });

  const isLoading = form.formState.isSubmitting;
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof WorkflowFormSchema>) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      toast({
        title: "Form submitted successfully",
        description: "Your workflow has been created.",
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your form.",
        variant: "destructive",
      });
    }
  }

  const DatePicker = ({ name, label }: { name: 'pilotStartDate' | 'pilotEndDate' | 'frcDate', label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
  
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
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <div className="relative">
              <Button
                ref={buttonRef}
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setIsOpen(!isOpen)}
              >
                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
              {isOpen && (
                <div
                  ref={calendarRef}
                  className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setIsOpen(false);
                    }}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={2023}
                    toYear={2026}
                  />
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Card className="w-full max-w-[650px] border-none">
      {title && subTitle && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subTitle}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Project Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DatePicker name="pilotStartDate" label="Pilot Start Date" />
            <DatePicker name="pilotEndDate" label="Pilot End Date" />
            <DatePicker name="frcDate" label="FRC Date" />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WorkflowForm;