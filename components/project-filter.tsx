"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

interface ProjectFilterProps {
  types: string[]
  generations: number[]
  onTypeChange: (type: string | null) => void
  onGenerationChange: (generation: number | null) => void
  onExcellentChange: (excellent: boolean) => void
  selectedType: string | null
  selectedGeneration: number | null
  excellentOnly: boolean
}

export function ProjectFilter({
  types,
  generations,
  onTypeChange,
  onGenerationChange,
  onExcellentChange,
  selectedType,
  selectedGeneration,
  excellentOnly,
}: ProjectFilterProps) {
  const [typeOpen, setTypeOpen] = useState(false)
  const [genOpen, setGenOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 flex-wrap">
      <Popover open={typeOpen} onOpenChange={setTypeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={typeOpen}
            className="w-full sm:w-[200px] justify-between"
          >
            {selectedType ? selectedType : "모든 카테고리"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full sm:w-[200px] p-0">
          <Command>
            <CommandInput placeholder="카테고리 검색..." />
            <CommandList>
              <CommandEmpty>카테고리를 찾을 수 없습니다.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onTypeChange(null)
                    setTypeOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedType === null ? "opacity-100" : "opacity-0")} />
                  모든 카테고리
                </CommandItem>
                {types.map((type) => (
                  <CommandItem
                    key={type}
                    onSelect={() => {
                      onTypeChange(type)
                      setTypeOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedType === type ? "opacity-100" : "opacity-0")} />
                    {type}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={genOpen} onOpenChange={setGenOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={genOpen}
            className="w-full sm:w-[200px] justify-between"
          >
            {selectedGeneration ? `${selectedGeneration}기` : "모든 기수"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full sm:w-[200px] p-0">
          <Command>
            <CommandInput placeholder="기수 검색..." />
            <CommandList>
              <CommandEmpty>기수를 찾을 수 없습니다.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onGenerationChange(null)
                    setGenOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedGeneration === null ? "opacity-100" : "opacity-0")} />
                  모든 기수
                </CommandItem>
                {generations.map((gen) => (
                  <CommandItem
                    key={gen}
                    onSelect={() => {
                      onGenerationChange(gen)
                      setGenOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedGeneration === gen ? "opacity-100" : "opacity-0")} />
                    {gen}기
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Toggle
        pressed={excellentOnly}
        onPressedChange={onExcellentChange}
        className="data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-800"
      >
        우수 프로젝트만 보기
      </Toggle>
    </div>
  )
}
