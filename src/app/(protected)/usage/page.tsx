"use client";
import { useEffect, useState } from "react";
import GeneralNode from "@/components/nodeTypes/GeneralNode";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Node,
} from "reactflow";
// import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import lodash, { initial } from "lodash";
import { entityMapping } from "@/config/EntityMapping";
import { getTopic } from "@/lib/Salesforce";
import { Loader } from "lucide-react";

type Props = {};

const nodeTypes = {
  defaultNode: GeneralNode,
  default: GeneralNode,
};
// const nodeTypes = {};
const GROUP_WIDTH = 165;
const GROUP_HEIGHT = 290;
const ITEM_HEIGHT = 40;
const ITEM_WIDTH = 150;
const ITEM_ROW_COUNT = 5;
const ITEM_MARGIN = 10;

interface Template {
  id: string;
  position: { x: number; y: number };
  data: { label: string; value: number };
  style: { height: number; width: number };
  parentId: string;
  extent?: "parent" | undefined;
  hidden: boolean;
}

const template: Template = {
  id: "",
  position: { x: 0, y: 0 },
  data: { label: "", value: 0 },
  style: { height: ITEM_HEIGHT, width: ITEM_WIDTH },
  parentId: "",
  extent: undefined,
  hidden: false,
};
const headerStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  paddingTop: "1px",
  fontWeight: 600,
  width: GROUP_WIDTH,
  height: GROUP_HEIGHT,
  textAlign: "left",
  letterSpacing: "7px",
  textTransform: "uppercase",
};

const itemStyle = {
  width: ITEM_WIDTH,
  height: ITEM_HEIGHT,
  letterSpacing: "1px",
};

const initialEdges = [{}];
const initialNodes = [template];

function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function UsagePage({}: Props) {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState([]);
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Read values from config/EntityMapping.json

  function buildFormat(data: any) {
    const headers: Node[] = [];

    console.log("Usage: buildFormat, data Recieved", data);

    // get the headers from entityMapping
    // const entityHeaders = entityMapping.filter(
    //   (item) => item.parentId === undefined && item.hidden === false
    // );
    // console.log("Usage: buildFormat: EntityHeaders", entityHeaders);
    let headerStartPositionX = 0;
    let headerStartPositionY = GROUP_HEIGHT + ITEM_MARGIN;

    // We do verticals first, coz we want to get the total width of the verticals
    // for (let index = 0; index < entityHeaders.length; index++) {
    entityMapping
      .filter(
        (item) =>
          item.type === "vertical" &&
          item.parentId === undefined &&
          item.hidden === false
      )
      .map((entityHeader, entityHeaderIndex) => {
        // get the rows related to the entity Header...
        const entityValues = entityMapping.filter(
          (item) => item.parentId === entityHeader.id && item.hidden === false
        );

        const itemCount = entityValues.length; //getRandomIntInclusive(5, 20);
        // check if the filtered entity values exist in Data
        const valuesExist =
          entityValues.some((value) => data.includes(value.data.source)) ||
          data.some((value: any) =>
            entityValues.some((obj) => obj.data.source === value.name)
          );

        // Process only if there are items to process i.e there are Items in the Config and Sobjects has a record count for some of the items
        if (itemCount > 0 && valuesExist) {
          const header = lodash.cloneDeep(template);
          header.id = entityHeader.id + entityHeaderIndex.toString();
          header.position.x = headerStartPositionX + GROUP_WIDTH; //index * GROUP_WIDTH;
          header.position.y = 0;
          // if there are no items for this header, then dont show
          header.hidden = itemCount === 0;

          // Widen the header based on the number of items in it i.e.
          // Calculate the number of columns that each header would have and adjust the width accordingly
          const cols = Math.ceil(itemCount / ITEM_ROW_COUNT);
          header.data.label = entityHeader.data.label;
          // console.log("EntityData", entityHeaders[index].data);

          header.style = lodash.cloneDeep(headerStyle);
          header.style.width = GROUP_WIDTH * cols;

          // Add it only if the header is supposed to be visible
          if (header.hidden == false) headers.push(header);
          headerStartPositionX += header.style.width + ITEM_MARGIN;

          let itemPositionY = ITEM_HEIGHT;
          let itemPositionX = ITEM_MARGIN;
          let recordCounter = 0;

          for (
            let itemIndex = 0;
            itemIndex < entityValues.length;
            itemIndex++
          ) {
            if (itemIndex != 0) {
              if (itemIndex % ITEM_ROW_COUNT === 0) {
                // console.log("Resetting X & Y at index", itemIndex);
                itemPositionY = ITEM_HEIGHT;
                itemPositionX = itemPositionX + ITEM_MARGIN + ITEM_WIDTH;
                //* Math.floor(itemIndex + 1 / ITEM_ROW_COUNT);
              } else {
                itemPositionY = itemPositionY + ITEM_HEIGHT + ITEM_MARGIN;
              }
            }

            const item = lodash.cloneDeep(template);
            item.id = header.id + "-" + itemIndex.toString();
            item.parentId = header.id;
            item.position.x = itemPositionX; //ITEM_MARGIN;
            item.position.y = itemPositionY;
            //itemPositionY + itemIndex * (ITEM_HEIGHT + ITEM_MARGIN * 2);
            item.data.label = entityValues[itemIndex].data.label;

            const objValue = data?.filter((sObject: any) => {
              return sObject.name === entityValues[itemIndex].data.source;
            });

            // console.log(
            //   "Processing for ",
            //   entityValues[itemIndex].data.source,
            //   " and got ",
            //   objValue
            // );
            item.data.value = objValue && objValue[0] ? objValue[0].count : 0; //getRandomIntInclusive(100, 10000);

            if (item.data.value && item.data.value > 0) recordCounter++;
            // console.log(
            //   "Item:",
            //   item.data.label,
            //   " has value of ",
            //   item.data.value,
            //   " Incrementing the record counter to ",
            //   recordCounter
            // );

            item.style = lodash.cloneDeep(itemStyle);
            item.extent = "parent";
            headers.push(item);
          }

          // if the items donot have any records, then remove the header
          // if (recordCounter === 0) header.hidden = true;
        }
      });

    //set the width based on the number of columns displayed
    // May need to account for the width of the last vertical item
    const horizantalWidth = headerStartPositionX + ITEM_WIDTH - GROUP_WIDTH;
    // Calculate the number of items that we can accomodate in this width
    const itemColCount = Math.floor(
      horizantalWidth / (ITEM_WIDTH + ITEM_MARGIN * 2)
    );

    // Now do the Horizontals
    entityMapping
      .filter(
        (item) =>
          item.type !== "vertical" &&
          item.parentId === undefined &&
          item.hidden === false
      )
      .map((entityHeader, entityHeaderIndex) => {
        // get the rows related to the entity Header...
        const entityValues = entityMapping.filter(
          (item) => item.parentId === entityHeader.id && item.hidden === false
        );

        const itemCount = entityValues.length; //getRandomIntInclusive(5, 20);

        // check if the filtered entity values exist in Data
        const valuesExist =
          entityValues.some((value) => data.includes(value.data.source)) ||
          data.some((value: any) =>
            entityValues.some((obj) => obj.data.source === value.name)
          );
        if (itemCount > 0 && valuesExist) {
          const header = lodash.cloneDeep(template);
          header.id = entityHeader.id + entityHeaderIndex.toString();
          header.position.x = GROUP_WIDTH;
          header.position.y = headerStartPositionY;
          // if there are no items for this header, then dont show
          // header.hidden = itemCount === 0;

          // Increase height of header based on the number of items in it i.e.
          // The number of columns would be total number of items that can fit into the width
          let rows =
            itemColCount === 0 ? 1 : Math.ceil(itemCount / itemColCount);
          header.data.label = entityHeader.data.label;
          // console.log(
          //   "Usage: buildFormat: EntityData",
          //   entityHeader.data.label,
          //   " requires ",
          //   rows,
          //   "rows, because itemColCount is ",
          //   itemColCount,
          //   " and itemCount is ",
          //   itemCount
          // );

          header.style = lodash.cloneDeep(headerStyle);
          header.style.width = horizantalWidth;
          header.style.height = (rows + 1) * ITEM_HEIGHT + ITEM_MARGIN * 2;

          // Add it only if the header is supposed to be visible
          if (header.hidden == false) headers.push(header);
          headerStartPositionY += header.style.height + ITEM_MARGIN;

          let itemPositionY = ITEM_HEIGHT;
          let itemPositionX = ITEM_MARGIN;
          for (
            let itemIndex = 0;
            itemIndex < entityValues.length;
            itemIndex++
          ) {
            if (itemIndex != 0) {
              if (itemIndex % rows === 0) {
                // console.log("Resetting X & Y at index", itemIndex);
                itemPositionY = ITEM_HEIGHT;
                itemPositionX = itemPositionX + ITEM_MARGIN + ITEM_WIDTH;
                //* Math.floor(itemIndex + 1 / ITEM_ROW_COUNT);
              } else {
                itemPositionY = itemPositionY + ITEM_HEIGHT + ITEM_MARGIN;
              }
            }

            const item = lodash.cloneDeep(template);
            item.id = header.id + "-" + itemIndex.toString();
            item.parentId = header.id;
            item.position.x = itemPositionX; //ITEM_MARGIN;
            item.position.y = itemPositionY;
            //itemPositionY + itemIndex * (ITEM_HEIGHT + ITEM_MARGIN * 2);
            item.data.label = entityValues[itemIndex].data.label;

            //get values from data, which is the parameter for this function

            const objValue = data?.filter((sObject: any) => {
              return sObject.name === entityValues[itemIndex].data.source;
            });
            item.data.value = objValue && objValue[0] ? objValue[0].count : 0; //getRandomIntInclusive(100, 10000);
            item.style = lodash.cloneDeep(itemStyle);
            item.extent = "parent";
            headers.push(item);
          }
        }
      });

    return headers;
  }

  useEffect(() => {
    async function getDataFromServer() {
      setIsLoading(true);
      const res = await getTopic("sObjectsRecordCount");
      // console.log("Usage: useEffect:  Data from Server", res);
      // @ts-ignore
      setData(res[0]?.sObjects);
      setIsLoading(false);
    }
    getDataFromServer();
  }, []);

  useEffect(() => {
    if (data) {
      setIsLoading(true);
      const headers = buildFormat(data);
      // console.log("Headers", headers);
      setNodes(headers);
      setIsLoading(false);
    }
  }, [data]);
  return isLoading ? (
    <Loader className="h-8 w-8 animate-spin" />
  ) : (
    <div style={{ width: "100vw", height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        maxZoom={2}
        minZoom={0.75}
      ></ReactFlow>
    </div>
  );
}

export default UsagePage;
