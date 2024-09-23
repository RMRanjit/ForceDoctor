import { memo } from "react";
import { Handle, Position, Node, NodeProps } from "reactflow";

type Props = {
  data: data;

  isConnectable?: boolean;
};

type data = {
  label: string;
  id: string;
  source?: boolean;
  target?: boolean;
  type: string;
};

function FieldNode({ data, isConnectable }: Props) {
  return (
    <div className="min-w-[250px] min-h-[20px] px-0 rounded-sm border-2  relative flex flex-col">
      {/* Top handle for connecting incoming nodes */}
      {data.target == true ? (
        <Handle
          type="target"
          position={Position.Left}
          className="w-0 rounded !bg-primary"
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={isConnectable}
        />
      ) : (
        <></>
      )}
      {/* Bottom handle for connecting outgoing nodes */}
      {data.source == true ? (
        <Handle
          type="source"
          position={Position.Right}
          className="w-0 rounded !bg-primary"
          isConnectable={isConnectable}
        />
      ) : (
        <></>
      )}
      <div className="text-xs pl-2 ">
        {data.label?.split(":::")[0] ? data.label.split(":::")[0] : data.label}
      </div>
    </div>
  );
}

export default memo(FieldNode);
