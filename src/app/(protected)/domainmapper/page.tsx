"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { getDomainMapping } from "@/lib/Salesforce";
import { Button } from "@/components/ui/button";
import {
  ArrowBigLeft,
  ArrowLeft,
  ArrowRight,
  Download,
  LayoutGrid,
  Loader,
  TableProperties,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Attribute {
  type: string;
  url: string;
}

interface Object {
  Id: string;
  Name: string;
  attributes: Attribute;
  type: string;
  complexity: string | undefined;
  codeSize: string;
}

interface Column {
  Module: string;
  Objects: Object[];
  isStatic?: boolean;
}

const DomainMapperPage = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"file" | "database" | null>(
    null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDataSourceSelection = (source: "file" | "database") => {
    setDataSource(source);
    if (source === "database") {
      loadDataFromDatabase();
    }
  };

  const filterItems = useCallback(
    (items: Object[]) => {
      if (!searchTerm) return items;
      return items.filter(
        (item) =>
          item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.attributes.type
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [searchTerm]
  );

  const renderColumn = (column: Column, columnIndex: number) => {
    const filteredObjects = column.isStatic
      ? filterItems(column.Objects)
      : column.Objects;

    return (
      <React.Fragment key={column.Module}>
        {column.isStatic ? (
          <div className="flex-1">
            <div className="text-sm font-semibold mb-2 bg-secondary p-2 rounded uppercase">
              {column.Module}
            </div>
            {column.isStatic && (
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-6 text-sm  p-2 mb-2 border rounded"
              />
            )}
            <Droppable droppableId={column.Module} type="item">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`p-4 rounded-lg min-h-[200px] min-w-[330px] ${
                    snapshot.isDraggingOver ? "bg-blue-100 text-slate-600" : ""
                  }`}
                >
                  {filteredObjects.map((object, index) => (
                    <Draggable
                      key={object.Id}
                      draggableId={object.Id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          // className=" p-4 mb-2 rounded shadow min-w-[300px] border"
                          className={`flex-1 ${
                            snapshot.isDragging
                              ? "p-4 mb-2 border-2 border-dashed  rounded shadow min-w-[300px]m text-slate-600"
                              : "p-4 mb-2 border rounded shadow min-w-[300px] "
                          }`}
                        >
                          <div className="flex flex-row justify-between">
                            <div className="text-xs uppercase tracking-widest">
                              {object.attributes.type || object.type}
                            </div>
                            <div className="text-xs uppercase ">
                              <Badge
                                variant={
                                  object.complexity === "Complex"
                                    ? "destructive"
                                    : object.complexity === "Medium"
                                    ? "default"
                                    : "outline"
                                }
                                className="h-4 text-[10px]"
                              >
                                {object.complexity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {object.Name}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ) : (
          <Draggable draggableId={column.Module} index={columnIndex}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className="flex-1"
              >
                <div
                  className="text-sm font-semibold mb-2 bg-secondary p-2 rounded uppercase "
                  {...provided.dragHandleProps}
                >
                  {column.Module}
                </div>
                <Droppable droppableId={column.Module} type="item">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      // className="border p-4 rounded-lg min-h-[200px] "
                      className={`p-4 rounded-lg min-h-[200px] ${
                        snapshot.isDraggingOver
                          ? "bg-blue-100 text-slate-600"
                          : ""
                      }`}
                    >
                      {filteredObjects.map((object, index) => (
                        <Draggable
                          key={object.Id}
                          draggableId={object.Id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              // className="bg-secondary p-4 mb-2 rounded shadow"
                              className={`flex-1 ${
                                snapshot.isDragging
                                  ? "p-4 mb-2 border-2 border-dashed  rounded shadow text-slate-600 "
                                  : "bg-secondary p-4 mb-2 border rounded shadow  "
                              }`}
                            >
                              <div className="flex flex-row justify-between">
                                <div className="text-xs uppercase tracking-widest">
                                  {object.attributes.type || object.type}
                                </div>
                                <div className="text-xs uppercase ">
                                  <Badge
                                    variant={
                                      object.complexity === "Complex"
                                        ? "destructive"
                                        : object.complexity === "Medium"
                                        ? "default"
                                        : "outline"
                                    }
                                    className="h-4 text-[10px]"
                                  >
                                    {object.complexity}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm font-semibold">
                                {object.Name}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </Draggable>
        )}
      </React.Fragment>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const loadDataFromFile = useCallback(() => {
    if (!uploadedFile) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n");
      const headers = lines[0].split(",");

      if (!validateHeaders(headers)) {
        alert(
          "Invalid file format. Please upload a CSV file with the correct headers."
        );
        setIsLoading(false);
        return;
      }

      const newColumns: Column[] = [];
      let currentModule = "";
      let currentObjects: Object[] = [];

      lines.slice(1).forEach((line) => {
        if (line.trim() === "") return;
        const [
          module,
          id,
          name,
          type,
          attributeType,
          attributeUrl,
          complexity,
          codeSize,
        ] = line.split(",").map((item) => item.trim().replace(/^"|"$/g, ""));

        if (module !== currentModule) {
          if (currentModule !== "") {
            newColumns.push({ Module: currentModule, Objects: currentObjects });
          }
          currentModule = module;
          currentObjects = [];
        }

        currentObjects.push({
          Id: id,
          Name: name,
          attributes: { type: attributeType, url: attributeUrl },
          type: type,
          complexity: complexity,
          codeSize: codeSize,
        });
      });

      if (currentModule !== "") {
        newColumns.push({ Module: currentModule, Objects: currentObjects });
      }

      setColumns(newColumns);
      setSelectedColumns(newColumns.map((col) => col.Module));
      setIsLoading(false);
    };

    reader.readAsText(uploadedFile);
  }, [uploadedFile]);

  const loadDataFromDatabase = async () => {
    setIsLoading(true);
    try {
      const data = await getDomainMapping();
      console.log("DomainMapper: loadDataFromDatabase", data.details);
      setColumns(data.details);
      setSelectedColumns(data.details.map((col) => col.Module));
    } catch (error) {
      console.error("Error fetching domain mapping:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateHeaders = (headers: string[]) => {
    const expectedHeaders = [
      "Module",
      "Object ID",
      "Object Name",
      "Object Type",
      "Attribute Type",
      "Attribute URL",
      "Complexity",
      "CodeSize",
    ];
    return expectedHeaders.every((header) => headers.includes(header));
  };

  const toggleColumnSelection = useCallback((columnModule: string) => {
    console.log("toggleColumnSelection", columnModule);
    setSelectedColumns((prev) =>
      prev.includes(columnModule)
        ? prev.filter((mod) => mod !== columnModule)
        : [...prev, columnModule]
    );
  }, []);

  const handleBackButton = useCallback(() => {
    setDataSource(null);
    setColumns([]);
    setSelectedColumns([]);
  }, []);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;

      if (!destination) return;

      setColumns((prevColumns) => {
        const newColumns = [...prevColumns];

        // Moving columns
        if (result.type === "column") {
          const [removed] = newColumns.splice(source.index, 1);
          newColumns.splice(destination.index, 0, removed);
          return newColumns;
        }

        // Moving items
        const sourceColumn = newColumns.find(
          (col) => col.Module === source.droppableId
        );
        const destColumn = newColumns.find(
          (col) => col.Module === destination.droppableId
        );

        if (!sourceColumn || !destColumn) return prevColumns;

        const sourceItems =
          // sourceColumn.Module === "Available Items"
          sourceColumn.isStatic
            ? filterItems(sourceColumn.Objects)
            : sourceColumn.Objects;
        const destItems =
          // destColumn.Module === "Available Items"
          destColumn.isStatic
            ? filterItems(destColumn.Objects)
            : destColumn.Objects;

        // Moving items within the same column
        if (source.droppableId === destination.droppableId) {
          const reorderedItems = Array.from(sourceItems);
          const [movedItem] = reorderedItems.splice(source.index, 1);
          reorderedItems.splice(destination.index, 0, movedItem);

          const updatedColumn = {
            ...sourceColumn,
            Objects:
              // sourceColumn.Module === "Available Items"
              sourceColumn.isStatic
                ? sourceColumn.Objects.filter(
                    (item) => filterItems([item]).length > 0
                  )
                : reorderedItems,
          };

          return newColumns.map((col) =>
            col.Module === source.droppableId ? updatedColumn : col
          );
        } else {
          // Moving items between columns
          const sourceReorderedItems = Array.from(sourceItems);
          const [movedItem] = sourceReorderedItems.splice(source.index, 1);
          const destReorderedItems = Array.from(destItems);
          destReorderedItems.splice(destination.index, 0, movedItem);

          const updatedSourceColumn = {
            ...sourceColumn,
            Objects:
              // sourceColumn.Module === "Available Items"
              sourceColumn.isStatic
                ? sourceColumn.Objects.filter(
                    (item) => item.Id !== movedItem.Id
                  )
                : sourceReorderedItems,
          };

          const updatedDestColumn = {
            ...destColumn,
            Objects:
              // destColumn.Module === "Available Items"
              destColumn.isStatic
                ? [...destColumn.Objects, movedItem]
                : destReorderedItems,
          };

          return newColumns.map((col) => {
            if (col.Module === source.droppableId) return updatedSourceColumn;
            if (col.Module === destination.droppableId)
              return updatedDestColumn;
            return col;
          });
        }
      });
    },
    [filterItems]
  );

  const downloadCSV = useCallback(() => {
    const headers = [
      "Module",
      "Object ID",
      "Object Name",
      "Object Type",
      "Attribute Type",
      "Attribute URL",
      "Complexity",
      "CodeSize",
    ];
    let csvContent = headers.join(",") + "\n";

    columns
      .filter((column) => selectedColumns.includes(column.Module))
      .forEach((column) => {
        column.Objects.forEach((object) => {
          const row = [
            column.Module,
            object.Id,
            object.Name,
            object.type,
            object.attributes.type,
            object.attributes.url,
            object.complexity,
            object.codeSize,
          ]
            .map((value) => `"${value}"`)
            .join(",");
          csvContent += row + "\n";
        });
      });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "domain_mapping.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [columns, selectedColumns]);

  const toggleColumnSelections = useCallback((selectedOptions: Option[]) => {
    setSelectedColumns(selectedOptions.map((option) => option.value));
  }, []);

  const options: Option[] = columns.map((column) => ({
    value: column.Module,
    label: column.Module,
  }));

  if (isLoading) {
    return (
      <div>
        <Loader className="animate-spin duration-9000 h-8 w-8 " />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold mb-4">Domain Mapper</div>
        {dataSource && (
          <Button variant="ghost" onClick={handleBackButton}>
            <ArrowLeft />
            Back
          </Button>
        )}
      </div>
      {!dataSource && (
        <div className="mb-4">
          <div className="text-lg font-semibold mb-2">Select Data Source:</div>
          <Button
            onClick={() => handleDataSourceSelection("file")}
            variant="secondary"
            className="py-2 px-4 rounded mr-2"
          >
            Upload File
          </Button>
          <Button
            onClick={() => handleDataSourceSelection("database")}
            className=" py-2 px-4 rounded"
          >
            Retrieve
          </Button>
        </div>
      )}
      {dataSource === "file" && !columns.length && (
        <div className="mb-4">
          <div className="text-lg font-semibold mb-2">Upload Data:</div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              "
          />
          {uploadedFile && (
            <Button
              onClick={loadDataFromFile}
              className="mt-2 py-2 px-4 rounded"
            >
              Load Data
            </Button>
          )}
        </div>
      )}

      {columns.length > 0 && (
        <>
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">
              Select Domains to view:
            </div>
            {/* <div className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <label
                  key={column.Module}
                  className="flex items-center text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.Module)}
                    onChange={() => toggleColumnSelection(column.Module)}
                    className="mr-2"
                  />
                  {column.Module}
                </label>
              ))}
            </div> */}
            <div className="flex flex-col gap-5 ">
              <MultipleSelector
                defaultOptions={options}
                onChange={(selectedOptions) =>
                  toggleColumnSelections(selectedOptions)
                }
                hidePlaceholderWhenSelected
                placeholder="Select domains to display"
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    no results found.
                  </p>
                }
              />
            </div>
          </div>
          {/* <Button onClick={downloadCSV} className="py-2 px-4 rounded mb-4">
            Download CSV
          </Button> */}
          <div className="flex flex-row justify-end pb-2">
            <ToggleGroup
              type="single"
              // defaultValue={selectedDisplayType}
              // value={selectedLimitType}
              // onValueChange={(value) => {
              //   // @ts-ignore
              //   if (value) setSelectedDisplayType(value);
              // }}
            >
              <ToggleGroupItem value="Grid">
                <LayoutGrid />
              </ToggleGroupItem>
              <ToggleGroupItem value="Table">
                <TableProperties />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="ghost" onClick={downloadCSV}>
              <Download />
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="columns"
              direction="horizontal"
              type="column"
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex space-x-4"
                >
                  {columns
                    .filter((column) => selectedColumns.includes(column.Module))
                    .map((column, columnIndex) =>
                      renderColumn(column, columnIndex)
                    )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </div>
  );
};

export default DomainMapperPage;
