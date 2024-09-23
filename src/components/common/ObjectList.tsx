"use client";

import { getAllsObjects, getTopic } from "@/lib/Salesforce";
import { notFound } from "next/navigation";
import { cache, useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader, SearchIcon, X } from "lucide-react";
import { cn, getObjectName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { dashboardConfig } from "@/config/dashboard.config";
import { Input } from "../ui/input";

const topics = dashboardConfig.filter((item) => item.detailsLink != undefined);

type Props = {
  objectType: string | undefined;
  onSelect?: Function;
  onTopicSelect?: Function;
  onLoading?: Function;
};

function ObjectList({ objectType, onSelect, onTopicSelect, onLoading }: Props) {
  const [objects, setObjects] = useState<any>();
  const [filteredObjects, setFilteredObjects] = useState<any>();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    objectType
  );
  const [isLoading, setIsLoading] = useState<boolean>(true); //setting the loader true by default
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const getObjects = cache(async () => {
      let data: any;
      setIsLoading(true);
      if (onLoading) onLoading(true);
      setObjects(undefined);
      data = await getTopic(selectedTopic);
      console.log(data);
      console.log("ObjectList: useEffect", data[0], selectedTopic);
      if (
        data.length > 0 &&
        data[0] &&
        data[0].records != undefined &&
        data[0].records?.length > 0
      ) {
        setObjects(data[0].records);
        setFilteredObjects(data[0].records);
        // } else if (
        //   data[0].sobjects.length > 0 &&
        //   data[0].sobjects != undefined &&
        //   data[0].sobjects?.length > 0
        // ) {
        //   setObjects(data[0].sobjects);
        //   setFilteredObjects(data[0].sobjects);
      } else {
        setObjects([]);
        setFilteredObjects(undefined);

        //notFound();
      }
      setIsLoading(false); //Turning the loader off after data loading
      if (onLoading) onLoading(false);
    });

    if (selectedTopic) getObjects();
  }, [objectType, selectedTopic]);

  useEffect(() => {
    if (search && search == "") {
      setFilteredObjects(objects);
    } else {
      // Search by Name or ID
      objects &&
        objects.length > 0 &&
        setFilteredObjects(
          objects.filter(
            (object: any) =>
              getObjectName(object)
                .toLowerCase()
                .includes(search.trim().toLowerCase()) ||
              object.Id?.toLowerCase().includes(search.trim().toLowerCase())
          )
        );
    }
  }, [search]);

  //

  // //code for the loader
  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <div className="flex-row h-max ">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between my-2 "
          >
            {selectedTopic
              ? topics.find((topic) => topic.topic === selectedTopic)?.header
              : "Select topic..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full ">
          <Command>
            <CommandInput placeholder="Search topics..." />
            <CommandList>
              <CommandEmpty>No topics found.</CommandEmpty>
              <CommandGroup>
                {topics.map((topic) => (
                  <CommandItem
                    key={topic.topic}
                    value={topic.topic}
                    onSelect={(currentValue) => {
                      setSelectedTopic(
                        currentValue === selectedTopic ? "" : currentValue
                      );
                      onTopicSelect &&
                        onTopicSelect(
                          currentValue === selectedTopic ? "" : currentValue
                        );
                      // setObjects(undefined); // reset the value of the selected Object
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTopic === topic.topic
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {topic.header}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedTopic && isLoading ? (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin duration-9000 h-8 w-8 " />
        </div>
      ) : (
        <div>
          {/* <div className="w-[250px] rounded-md border h-[calc(100vh-200px)] mt-2 overflow-x-hidden overflow-y-auto"> */}
          {selectedTopic && objects && (
            <>
              {search === "" ? (
                <label className="relative focus-within:text-gray-600 block my-2  ">
                  {objects.length > 0 && (
                    <SearchIcon
                      className="w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3"
                      onClick={() => {
                        //console.log("Clicked");
                        setSearch(" ");
                      }}
                    />
                  )}
                  <span className="text-xs font-semibold  px-3  h-4 w-full  pl-8 ">
                    {objects.length} records
                  </span>
                </label>
              ) : (
                <label className="relative text-gray-400 focus-within:text-gray-600 block my-2 mx-1">
                  <SearchIcon className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3" />
                  <Input
                    className=" py-3 px-4  h-4 w-full block pl-8 focus:outline-none text-xs"
                    placeholder="Search here"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <X
                    className=" w-5 h-5 absolute top-1/2 transform -translate-y-1/2 right-3"
                    onClick={() => {
                      setSearch("");
                    }}
                    strokeWidth={2}
                  />
                </label>
              )}

              <ScrollArea className=" min-w-[250px] rounded-md border h-[calc(100vh-165px)] mt-2">
                {filteredObjects?.map((object: any, objectIndex: number) => (
                  <ul>
                    <div
                      //key={object.Id || getObjectName(object)} // Warning Key must be unique, occurs when selecting ApexClass
                      key={(
                        objectIndex +
                        "-" +
                        (object.Id || object.id || object.ID)
                      ).toString()}
                      className="text-xs hover:bg-secondary flex flex-row justify-between "
                      onClick={() => onSelect && onSelect(object)}
                    >
                      {object.LengthWithoutComments > 0
                        ? object.LengthWithoutComments && (
                            <span className="h-2 w-2 bg-green-400 rounded pr-2 "></span>
                          )
                        : object.LengthWithoutComments && (
                            <span className="h-2 w-2 rounded  bg-slate-400 pr-2"></span>
                          )}

                      <div
                        className="flex-1"
                        key={(
                          "Name" +
                          objectIndex +
                          "-" +
                          (object.Id || object.id || object.ID)
                        ).toString()}
                      >
                        {getObjectName(object)}
                      </div>
                      {/* )} */}
                    </div>
                    <Separator />
                  </ul>
                ))}
                {/* </div> */}
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ObjectList;
