// @ts-nocheck
"use client";
import { getTopic } from "@/lib/Salesforce";
import { useEffect, useState, useCallback } from "react";

import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  DefaultEdgeOptions,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Position,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
// import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import { toPng } from "html-to-image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ObjectNode from "../nodeTypes/ObjectNode";

import dagre from "dagre"; // Require to arrange nodes by determining position of the nodes
import {
  Download,
  FileImage,
  LayoutGrid,
  Loader,
  TableProperties,
} from "lucide-react";
import { getObjectName } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Button } from "../ui/button";
import { MetaDataRecord } from "@/types/Common.types";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

// const nodeTypes = { defaultNode: ObjectNode, default: ObjectNode };

type Props = {
  objectInfo: any;
};

interface FlowElement {
  label: string;
  name: string;
  locationX: number;
  locationY: number;
  connector?: {
    targetReference: string;
  };
}

interface Decision extends FlowElement {
  rules: Array<{
    label: string;
    connector: {
      targetReference: string;
    };
  }>;
}

interface FlowData {
  decisions: Decision[];
  screens: FlowElement[];
  subflows: FlowElement[];
  start: {
    connector: {
      targetReference: string;
    };
    locationX: number;
    locationY: number;
  };
}
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 20;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  console.log("getLayoutedElements", nodes, edges);

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { layoutNodes: nodes, layoutEdges: edges };
};

function FlowVisualizer({ objectInfo }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDisplayType, setSelectedDisplayType] = useState<
    "Image" | "Table"
  >("Image");

  useEffect(() => {
    async function getDataFromServer() {
      setIsLoading(true);
      setNodes([]);
      setEdges([]);
      try {
        const result = await getTopic("workFlowMetaData", {
          Id: objectInfo.Id,
        });

        console.log("FlowVisualizer: getDataFromServer:", result[0]);

        const data = await generateReactFlowElements(
          result[0].records[0].Metadata
        );
        console.log("data", data);

        setData(data);

        console.log("result from getDependenciesFromServer", result);
        const { layoutNodes, layoutEdges } = getLayoutedElements(
          data.nodes,
          data.edges,
          "TB"
        );
        setNodes([...layoutNodes]);
        setEdges([...layoutEdges]);
        // setNodes(data.nodes);
        // setEdges(result.edges);
      } catch (error) {
        console.log("error", error);
        setNodes([]);
        setEdges([]);
      } finally {
        setIsLoading(false);
      }
    }

    console.log("FlowVisualizer: useEffect");

    getDataFromServer();
    console.log("FlowVisualizer: useEffect Complete");
  }, [objectInfo]);

  function downloadImage(dataUrl) {
    const a = document.createElement("a");

    a.setAttribute("download", type + ".png");
    a.setAttribute("href", dataUrl);
    a.click();
  }

  const onDownload = () => {
    const IMAGE_WIDTH = 768;
    const IMAGE_HEIGHT = 1024;
    if (selectedDisplayType == "Image") {
      // const { getNodes } = useReactFlow();
      const nodesBounds = getRectOfNodes(nodes);
      const transform = getTransformForBounds(
        nodesBounds,
        IMAGE_HEIGHT,
        IMAGE_WIDTH,
        0.5,
        2,
        0
      );
      // get the ViewPort of react flow

      const reactViewPort = document.querySelector(
        ".react-flow__viewport"
      )! as HTMLElement;

      if (reactViewPort)
        toPng(reactViewPort, {
          // backgroundColor: "#1a365d",
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          style: {
            width: IMAGE_WIDTH.toString(),
            height: IMAGE_HEIGHT.toString(),
            transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
          },
        }).then(downloadImage);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type);
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(dataBlob, type + ".xlsx");
    }
  };

  function generateReactFlowElements(data: FlowData): {
    nodes: Node[];
    edges: Edge[];
  } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    function addNode(
      id: string,
      label: string,
      x: number,
      y: number,
      type: string = "default"
    ): void {
      nodes.push({
        id,
        data: { label },
        position: { x, y },
        type,
      });
    }

    function addEdge(source: string, target: string, label?: string): void {
      edges.push({
        id: `${source}-${target}`,
        source,
        target,
        label,
      });
    }

    // Add start node
    addNode(
      "Start",
      "Start",
      data.start.locationX,
      data.start.locationY,
      "input"
    );
    addEdge("Start", data.start.connector.targetReference);

    // Process decisions
    data.decisions.forEach((decision) => {
      const decisionId = decision.name.replace(/\s+/g, "");
      addNode(
        decisionId,
        decision.label,
        decision.locationX,
        decision.locationY,
        "default"
      );
      decision.rules.forEach((rule) => {
        addEdge(decisionId, rule.connector.targetReference, rule.label);
      });
    });

    // Process screens
    data.screens.forEach((screen) => {
      addNode(
        screen.name.replace(/\s+/g, ""),
        screen.label,
        screen.locationX,
        screen.locationY,
        "output"
      );
      if (screen.connector) {
        addEdge(
          screen.name.replace(/\s+/g, ""),
          screen.connector.targetReference
        );
      }
    });

    // Process subflows
    data.subflows.forEach((subflow) => {
      const subflowId = subflow.name.replace(/\s+/g, "");
      addNode(
        subflowId,
        subflow.label,
        subflow.locationX,
        subflow.locationY,
        "default"
      );
      if (subflow.connector) {
        addEdge(subflowId, subflow.connector.targetReference);
      }
    });

    // Add end node (you might want to adjust its position or add it only if it's referenced)
    addNode(
      "End",
      "End",
      Math.max(...nodes.map((n) => n.position.x)) + 200,
      data.start.locationY,
      "output"
    );

    return { nodes, edges };
  }
  return (
    // <div style={{ width: "calc(100vw-250px)", height: "calc(100vh-50px)" }}>
    <div style={{ width: "70vw", height: "70vh" }}>
      {isLoading ? (
        <Loader className="flex items-center justify-center animate-spin duration-1000 h-12 w-12" />
      ) : (
        <>
          <span className="text-destructive font-mono"> DONOT USE </span>
          <div className="flex flex-row justify-end pb-2">
            <ToggleGroup
              type="single"
              defaultValue={selectedDisplayType}
              value={selectedDisplayType}
              onValueChange={(value) => {
                if (value) setSelectedDisplayType(value);
              }}
            >
              <ToggleGroupItem value="Image">
                <FileImage />
              </ToggleGroupItem>
              <ToggleGroupItem value="Table">
                <TableProperties />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="ghost" onClick={onDownload}>
              <Download />
            </Button>
          </div>
          {selectedDisplayType === "Image" ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              // onConnect={onConnect}
              fitView
              fitViewOptions={fitViewOptions}
              // nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
            />
          ) : (
            <div className="flex justify-center">
              <div className="">TBD</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FlowVisualizer;
