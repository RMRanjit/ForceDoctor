import { memo } from "react";

type Props = {
  data: any;
  isConnectable?: boolean;
  header?: boolean;
};

function GeneralNode({ data, isConnectable, header = false }: Props) {
  return (
    <div className="flex flex-row font-sm">
      <div>
        <span
          className="font-semibold line-clamp-1"
          style={{ fontSize: "80%" }}
        >
          {data.label}
        </span>
        {data.value ? (
          <div
            style={{ position: "relative", bottom: "-0.5em", fontSize: "40%" }}
          >
            {data.value}
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

export default memo(GeneralNode);
