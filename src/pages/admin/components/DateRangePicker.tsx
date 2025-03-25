"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DateRangePicker() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 7),
    })

    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

    const handleQuickSelect = (days: number) => {
        const today = new Date()
        setDate({
            from: today,
            to: addDays(today, days - 1),
        })
        setIsDropdownOpen(false)
    }

    return (
        <div className="flex items-center space-x-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal w-[240px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "MM/dd/yyyy")} - {format(date.to, "MM/dd/yyyy")}
                                </>
                            ) : (
                                format(date.from, "MM/dd/yyyy")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleQuickSelect(1)}>Today</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickSelect(2)}>Yesterday</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickSelect(7)}>Last 7 Days</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickSelect(30)}>Last 30 Days</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickSelect(365)}>This Year</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickSelect(730)}>Next Year</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsCalendarOpen(true)}>Custom Range</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

