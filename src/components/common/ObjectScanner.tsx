// @ts-nocheck
import { useState } from "react";
import { Button } from "../ui/button";
import { scanApexCode } from "@/lib/Salesforce";
import { Loader } from "lucide-react";
import { ScanResult, Violation } from "@/types/Common.types";

type Props = {
  objectInfo: any;
};

function ObjectScanner({ objectInfo }: Props) {
  const [scanResults, setScanResults] = useState<any>(undefined);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const StartScan = async () => {
    if (objectInfo.Body) {
      setIsScanning(true);
      const results = await scanApexCode(objectInfo.Body);
      setScanResults(results);
      setIsScanning(false);
    } else {
      console.log("No code to scan");
    }
  };

  return scanResults ? (
    <ScanResults data={scanResults} />
  ) : isScanning ? (
    <Loader className="animate-spin h-12 w-12" />
  ) : (
    <div>
      <Button variant="destructive" onClick={() => StartScan()}>
        Start Code Scan
      </Button>

      <span className="text-destructive text-sm font-mono mx-10">
        Warning: Code scan could take a few mins and could freeze up your
        screen!!!
      </span>
    </div>
  );
}

function ScanResults({ data }: { data: ScanResult }) {
  return data.violations ? (
    <table>
      <thead>
        <tr className="border bg-secondary text-left">
          <th>Rule</th>
          <th>Severity</th>
          <th>Line</th>
          <th>Column</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {data.violations.map((violation: Violation, index) => (
          <tr key={index} className="border hover:bg-secondary">
            <td>
              <a href={violation.url} target="_blank" rel="noreferrer noopener">
                {violation.ruleName}{" "}
              </a>
            </td>
            <td className="">{violation.severity}</td>
            <td>{violation.line}</td>
            <td>{violation.column}</td>
            <td>{violation.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <span>No violations found</span>
  );
}

export default ObjectScanner;
