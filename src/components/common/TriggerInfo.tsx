"use client";
import { Switch } from "@/components/ui/switch";
import { getObjectName } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";

export function TriggerInfo({
  objectInfo,
  showHeader = false,
}: {
  objectInfo: any;
  showHeader: boolean;
}) {
  return (
    <>
      {showHeader && (
        <caption className="mr-5 max-w-[100px] text-sm">
          {getObjectName(objectInfo)}
        </caption>
      )}
      <table>
        <thead>
          <tr>
            <th className="text-left">Action</th>
            <th className="text-left ">After</th>
            <th className="text-left ">Before</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Delete </td>
            <td className="px-5">
              <Switch checked={objectInfo.UsageAfterDelete} disabled={false} />
            </td>
            <td>
              <Switch checked={objectInfo.UsageBeforeDelete} disabled={false} />
            </td>
          </tr>
          <tr>
            <td>Insert </td>
            <td className="px-5">
              <Switch checked={objectInfo.UsageAfterInsert} disabled={false} />
            </td>
            <td>
              <Switch checked={objectInfo.UsageBeforeInsert} disabled={false} />
            </td>
          </tr>
          <tr>
            <td>Undelete </td>
            <td className="px-5">
              <Switch
                checked={objectInfo.UsageAfterUndelete}
                disabled={false}
              />
            </td>
            <td>
              <Switch
                checked={objectInfo.UsageBeforeUndelete}
                disabled={false}
              />
            </td>
          </tr>
          <tr>
            <td>Update </td>
            <td className="px-5">
              <Switch checked={objectInfo.UsageAfterUpdate} disabled={false} />
            </td>
            <td>
              <Switch checked={objectInfo.UsageBeforeUpdate} disabled={false} />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
