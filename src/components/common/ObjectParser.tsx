// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState, cache } from "react";
import Editor from "@monaco-editor/react";
import TreeView, { flattenTree } from "react-accessible-treeview";
import {
  Folder,
  FolderOpen,
  SquareFunction,
  Braces,
  AtSign,
  Variable,
  Parentheses,
  Asterisk,
  ArrowRight,
  Dot,
  FileCode2,
  FlagTriangleRight,
  Wrench,
  Loader,
} from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

import lodash, { set } from "lodash";
import styles from "./ObjectParser.module.css";
import { getTopic } from "@/lib/Salesforce";

type Props = {
  objectInfo?: any;
  location?: any;
};

const initialTree = { name: "", id: "Initial", parent: null, children: [] };
function getTreeStructure(data: any) {
  // console.log("CodeParser: getTreeStructure: start Function ", data);

  if (!data) return initialTree;

  //reset the treeObject if it exists

  const treeObject = lodash.cloneDeep(initialTree);

  // console.log("CodeParser: getTreeStructure: initialize ", treeObject);

  try {
    //Loop through the dataElements. There could be multiple Symbol Tables
    data.forEach((item: any, index: number) => {
      // Get the symbolTable
      try {
        const symbolTable = item.SymbolTable;
        // if the symbolTable is not defined, break
        if (!symbolTable) {
          //   console.log('SymbolTable not defined for item ', item.Name);
          throw new Error("SymbolTable not defined for item: " + item.Name);
        }

        // Create the root object for the Class name
        const id = symbolTable.id;
        const itemObject = {
          id: symbolTable.id,
          parent: "Initial",
          name: symbolTable.name,
          // metadata: {
          //   location: symbolTable.tableDeclaration?.location,
          // },
          children: [] as any,
        };
        // Add it to the root
        //@ts-ignore
        treeObject.children.push(itemObject);

        //Loop through the items in the itemObject and parse them
        Object.keys(symbolTable).forEach((key, index) => {
          if (symbolTable[key] && symbolTable[key] != null) {
            // console.log("key ", key, "KeyType", typeof symbolTable[key]);
            // if the attribute is an array then we need to add a header and then add the values to the header
            if (
              Array.isArray(symbolTable[key]) &&
              symbolTable[key].length > 0
            ) {
              parseChildren(itemObject, symbolTable[key], key);
            }

            // If it is an object, loop through the attributes and parse them if they are arrays. We are not processing objects eg. Location
            if (
              typeof symbolTable[key] === "object" &&
              !Array.isArray(symbolTable[key])
            ) {
              Object.keys(symbolTable[key]).forEach((child, childIndex) => {
                if (
                  Array.isArray(symbolTable[key][child]) &&
                  symbolTable[key][child].length > 0
                ) {
                  parseChildren(itemObject, symbolTable[key][child], child);
                }
              });
            }
          }
        });
      } catch (error: any) {
        console.error("Symbol Table Error: ", error.message);
      }
    });
  } catch (error: any) {
    console.error("Error in parsing object: ", error.message);
  }
  // console.info("CodeParser: getTreeStructure: return", treeObject);

  return treeObject;
}

/**
 * Recursively parses an array of objects and adds them to the tree structure.
 * @param itemObject The parent item object that we are adding children to.
 * @param child The array of objects to be parsed.
 * @param key The key of the array in the parent object.
 */
function parseChildren(itemObject: any, child: any, key: any) {
  // console.log("parseChildren:key", key);
  // console.log("parseChildren:child", child);
  // console.log("parseChildren:itemObject", JSON.stringify(itemObject));

  const RootId = itemObject.id + "-" + key;
  const headerNode = {
    id: RootId,
    parent: itemObject.id,
    name: key,
    isBranch: true,
    metadata: { type: key, lineNumber: itemObject.location?.line },
    children: [],
  };
  itemObject.children.push(headerNode);

  // add items in the key item
  child.map((property: any, index: number) => {
    const childId = RootId + "-" + index;

    const childNode = {
      id: childId,
      parent: RootId,
      name: property.name || property,
      metadata: { type: key, lineNumber: property.location?.line },
      children: [],
    };
    headerNode.children.push(childNode);
    if (typeof property === "object") {
      // Loop through the attributes in the object
      Object.keys(property).forEach((childKey, childKeyIndex) => {
        childNode.name =
          property.name + (property.type ? ":::" + property.type : "");
        if (
          Array.isArray(property[childKey]) &&
          property[childKey].length > 0
        ) {
          parseChildren(childNode, property[childKey], childKey);
        }
      });
    }
  });
}

function ObjectParser({ objectInfo, location }: Props) {
  const [lineNumber, setLineNumber] = useState(0);
  const [data, setData] = useState<any | undefined>(initialTree);
  const [isTreeLoading, setIsTreeLoading] = useState<boolean>(false);

  const editorRef = useRef(null);

  useEffect(() => {
    // get the Symbol Table
    const getSymbolTable = cache(async () => {
      if (!objectInfo.Id) return;

      try {
        setIsTreeLoading(true);
        // console.log("ID received", objectInfo.Id);
        // const data = await getApexSymbolTable(objectInfo.Id);
        const data = await getTopic("symbolTable", {
          id: objectInfo.Id,
        });
        // console.log("getSymbolTable: Data", data);
        const treeData = getTreeStructure(data[0]?.records);
        // console.log("Tree Data", treeData);
        const flattenedData = flattenTree(treeData);
        // console.log("Flattened Data", flattenedData);
        setData(flattenedData);
      } catch (error) {
        console.error("Error in getSymbolTable: ", error.message);
        setData(initialTree);
      } finally {
        setIsTreeLoading(false);
      }
    });
    getSymbolTable();
  }, [objectInfo]);

  // useEffect(() => {
  //   // console.log("CodeEditor: useEffect: ", location);
  //   // console.log("CodeTree: useEffect: ", data);
  //   if (location && location.line && editorRef.current) {
  //     const currentEditor = editorRef.current as any;
  //     currentEditor.revealLineInCenter(location.line);
  //     setLineNumber(location.line);
  //   }
  // }, [location]);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen w-screen rounded-lg border"
    >
      <ResizablePanel defaultSize={20}>
        {isTreeLoading ? (
          <Loader className="animate-spin h-8 w-8 overflow-hidden" />
        ) : (
          data &&
          data[0] &&
          data[0].children?.length > 0 && (
            <div className={styles.ide} style={{ overflowX: "auto" }}>
              <TreeView
                data={data}
                // className="pr-6"
                aria-label="Apex Symbol Table"
                togglableSelect
                clickAction="EXCLUSIVE_SELECT"
                multiSelect
                nodeRenderer={({
                  element,
                  isBranch,
                  isExpanded,
                  getNodeProps,
                  level,
                  handleSelect,
                }) => (
                  <div
                    {...getNodeProps()}
                    style={{ paddingLeft: 20 * (level - 1) }}
                    className="flex flex-row text-xs"
                  >
                    {/* {isBranch ? (
                <FolderIcon isOpen={isExpanded} />
              ) : (
                <TypeIcon type={element.type} />
              )} */}
                    <TypeIcon
                      // type={element.name as string}
                      type={element.metadata?.type as string}
                      isBranch={isBranch}
                      isOpen={isExpanded}
                    />
                    {element.name}
                  </div>
                )}
              />
            </div>
          )
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <div className="h-auto">
          <Editor
            height="calc(100vh - 300px)"
            width="100%"
            // ref={editorRef}
            defaultLanguage="apex"
            defaultValue=""
            onMount={handleEditorDidMount}
            line={lineNumber}
            value={objectInfo?.Body}
            // disabled={true}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
            }}
          ></Editor>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/**
 * Returns a LucideReact icon based on the type of the element, or a default Braces icon.
 * @param {string} type - The type of the element.
 * @param {boolean} isBranch - Whether the element is a branch.
 * @param {boolean} isOpen - Whether the element is open.
 * @param {number} [strokeWidth=1.5] - The stroke width of the icon.
 * @param {number} [size=18] - The size of the icon.
 * @returns {JSX.Element} - A LucideReact icon.
 */
const TypeIcon = ({
  type,
  isBranch,
  isOpen,
  strokeWidth = 1.5,
  size = 18,
}: {
  type: string;
  isBranch: boolean;
  isOpen: boolean;
  strokeWidth?: number;
  size?: number;
}) => {
  const { resolvedTheme, theme } = useTheme();

  // console.log("TypeIcon: type",type,"isBranch",isBranch,"isOpen",isOpen,"resolvedTheme",resolvedTheme,"theme",theme);

  let color = isOpen
    ? isBranch
      ? resolvedTheme === "dark"
        ? "orange"
        : "green "
      : "black"
    : resolvedTheme === "dark"
    ? "white"
    : "black";

  switch (type) {
    case "classes":
      return (
        <Braces
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "methods":
      return (
        <Parentheses
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "interfaces":
      return (
        <Asterisk
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "variables":
      return (
        <Variable
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "modifiers":
      return (
        <AtSign
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "parameters":
      return (
        <ArrowRight
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "properties":
      return (
        <FileCode2
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "annotations":
      return (
        <FlagTriangleRight
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    case "constructors":
      return (
        <Wrench
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          className="px-1"
        />
      );
    default:
      return <Braces size={size} strokeWidth={strokeWidth} className="px-1" />;
  }
};

export default ObjectParser;
