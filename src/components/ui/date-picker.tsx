// Frontend\src\components\ui\date-picker.tsx
"use client"

import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface DatePickerProps {
    startYear?: number;
    endYear?: number;
    onChange?: (date: Date) => void;
    value?: Date;
    className?: string;
}

export function DatePicker({
    startYear = getYear(new Date()) - 100,
    endYear = getYear(new Date()),
    onChange,
    value,
    className
}: DatePickerProps) {
    const [date, setDate] = React.useState<Date>(value || new Date());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
    );

    const handleMonthChange = (month: string) => {
        const newDate = setMonth(date, months.indexOf(month))
        setDate(newDate)
    }

    const handleYearChange = (year: string) => {
        const newDate = setYear(date, parseInt(year));
        setDate(newDate)
    }

    const handleSelect = (selectedData: Date | undefined) => {
        if (selectedData) {
            setDate(selectedData)
            onChange?.(selectedData)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "h-12 w-full pl-3 text-left font-normal bg-background/50",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="flex justify-between p-2">
                    <Select
                        onValueChange={handleMonthChange}
                        value={months[getMonth(date)]}
                    >
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                months.map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                    <Select
                        onValueChange={handleYearChange}
                        value={getYear(date).toString()}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>

                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                    month={date}
                    onMonthChange={setDate}
                />
            </PopoverContent>
        </Popover>
    )
}