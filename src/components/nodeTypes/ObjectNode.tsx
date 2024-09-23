import { memo } from "react";
import { Handle, Position, Node, NodeProps } from "reactflow";

type Props = {
  data: data;
  isConnectable?: boolean;
};

type data = {
  label: string;
  id: string;
  type: string;
};

function ObjectNode({ data, isConnectable }: Props) {
  return (
    <div className="min-w-[250px] min-h-[20px] px-0 rounded-sm border-inherit  relative flex flex-col">
      {/* Top handle for connecting incoming nodes */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-0 rounded !bg-primary"
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      {/* Bottom handle for connecting outgoing nodes */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-0 rounded !bg-primary"
        isConnectable={isConnectable}
      />
      <div className="items-center justify-between flex p-[2] bg-primary text-secondary">
        <div className="text-sm pl-2  tracking-widest ">{data.type}</div>
      </div>
      <div className="text-xs pl-2">
        {" "}
        {data.label?.split(":::")[0] ? data.label.split(":::")[0] : data.label}
      </div>
      {/* if the data id and name are same,  dont want to repeat it, the id */}
      <div className="text-xs pl-2 ">
        {data.id == data.label ? "" : data.id}
      </div>
    </div>
  );
}

export default memo(ObjectNode);
