"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50"
        >
            <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
            <Moon className="hidden h-5 w-5 dark:block" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}