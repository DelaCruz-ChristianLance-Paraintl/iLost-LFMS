import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "cn"

function Popover(props) {
  return <PopoverPrimitive.Root {...props} />
}

function PopoverTrigger(props) {
  return <PopoverPrimitive.Trigger {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-auto rounded-xl border border-[#E8DEE4] bg-white p-0 shadow-md outline-none",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }