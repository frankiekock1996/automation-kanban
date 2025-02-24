import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { format, setMonth, setYear } from "date-fns";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonthState] = React.useState<Date>(new Date());

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value, 10);
    setMonthState(prevMonth => setMonth(prevMonth, newMonth));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value, 10);
    setMonthState(prevMonth => setYear(prevMonth, newYear));
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 bg-[#C8C7FF]",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 bg-[#C8C7FF]",
        head_row: "flex",
        head_cell: "text-black rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-black text-sm p-0 relative bg-[#C8C7FF]",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-black aria-selected:opacity-100"
        ),
        day_selected: "bg-primary text-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black",
        day_today: "bg-accent text-white",
        day_outside: "day-outside text-black opacity-50 aria-selected:bg-accent/50 aria-selected:text-black aria-selected:opacity-30",
        day_disabled: "text-black opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth }) => (
          <div className="flex justify-center space-x-2">
            <select
              value={displayMonth.getMonth()}
              onChange={handleMonthChange}
              className="bg-[#7540A9] text-white p-1 rounded"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {format(setMonth(new Date(), i), "MMM")}
                </option>
              ))}
            </select>
            <select
              value={displayMonth.getFullYear()}
              onChange={handleYearChange}
              className="bg-[#7540A9] text-white p-1 rounded"
            >
              {Array.from({ length: 4 }, (_, i) => (
                <option key={i} value={2023 + i}>
                  {2023 + i}
                </option>
              ))}
            </select>
          </div>
        )
      }}
      month={month}
      onMonthChange={setMonthState}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
