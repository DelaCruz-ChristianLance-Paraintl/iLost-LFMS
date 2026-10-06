import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "cn"
import { buttonVariants } from "./button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        
        // Month name + arrows stay together
       month_caption:
  "flex justify-center items-center pt-1",

caption_label:
  "text-sm font-semibold",

nav:
  "absolute left-1/2 top-[27.3px] flex w-[160px] -translate-x-1/2 -translate-y-1/2 items-center justify-between",

button_previous: cn(
  buttonVariants({ variant: "outline", size: "icon-sm" }),
  "h-7 w-7 border-0 bg-transparent p-0 hover:bg-[#FBE4F0] hover:text-[#650033]"
),

button_next: cn(
  buttonVariants({ variant: "outline", size: "icon-sm" }),
  "h-7 w-7 border-0 bg-transparent p-0 hover:bg-[#FBE4F0] hover:text-[#650033]"
),
        month_grid: "w-full border-collapse",

        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",

        week: "flex w-full mt-2",

        day:
          "h-9 w-9 text-center text-sm p-0 relative",

        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-9 w-9 p-0 font-normal"
        ),

        selected:
          "[&>button]:bg-[#D1006F] [&>button]:text-white [&>button]:hover:bg-[#98004F] [&>button]:hover:text-white",

        today:
          "[&>button]:bg-[#FBE4F0] [&>button]:text-[#650033] [&>button]:font-semibold",

        outside:
          "text-muted-foreground opacity-50",

        disabled:
          "text-muted-foreground opacity-30 cursor-not-allowed [&>button]:cursor-not-allowed",

        hidden:
          "invisible",

        ...classNames,
      }}

      components={{
        Chevron: ({ orientation, className, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft
                className={cn("h-4 w-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronRight
              className={cn("h-4 w-4", className)}
              {...props}
            />
          )
        },
      }}

      {...props}
    />
  )
}

export { Calendar }