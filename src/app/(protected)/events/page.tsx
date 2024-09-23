"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { SalesforceEventType } from "@/types/Salesforce.types";
import { Check, ChevronsUpDown } from "lucide-react";
import { PerformanceMetrics } from "@/components/common/PerformanceCard";

type Props = {};

function EventsPage({}: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const [selectedEventType, setSelectedEventType] =
    useState<SalesforceEventType | null>(null);

  return (
    <>
      <div className="flex flex-row justify-between">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between my-2 "
            >
              {selectedEventType ? selectedEventType : "Select Event Type..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-max-[250px] ">
            <Command>
              <CommandInput placeholder="Search Events for  ..." />
              <CommandList>
                {Object.values(SalesforceEventType).map((eventType) => (
                  <CommandItem
                    key={eventType}
                    onSelect={() => {
                      setSelectedEventType(eventType as SalesforceEventType);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEventType === eventType
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {eventType}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <PerformanceMetrics eventType={selectedEventType} />
    </>
  );
}

export default EventsPage;
