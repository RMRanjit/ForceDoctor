"use client";

import React, { useEffect, useState } from "react";
import { getTopic } from "@/lib/Salesforce";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "lucide-react";

type Props = {};

export default function UnusedCodeDetection({}: Props) {
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>();

  const getDataFromServer = async () => {
    try {
      setIsLoading(true);
      setData(undefined);
      setError(undefined);
      const response = await getTopic("allSymbolTables");
      console.log("getDataFromServer: Success", response);
      //@ts-ignore
      const unusedCode = await getUnusedCode(response[0]?.records);
      //@ts-ignore
      response[0].unUsedCode = unusedCode;
      setData(response[0]);
    } catch (err) {
      console.error("getDataFromServer: Error", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  enum SymbolVisibility {
    PRIVATE,
    GLOBAL,
    PUBLIC,
  }

  interface UnusedMethodInfo {
    id: string;
    className: string;
    methodName: string;
    location: { column: number; line: number };
  }

  /**
   * Given a list of ApexClassMembers with their SymbolTables, identify unused private methods.
   * A private method is considered unused if it is not referenced by any other method.
   * @returns An array of UnusedMethodInfo objects, one for each unused private method.
   * The array is sorted by ApexClass name, then by method name.
   */
  async function getUnusedCode(data: any): Promise<UnusedMethodInfo[]> {
    const declaredMethods: Map<string, UnusedMethodInfo> = new Map();
    const methodReferences: Set<string> = new Set();

    for (const apexClassMember of data) {
      const symbolTable = apexClassMember.SymbolTable;
      if (!symbolTable) continue;

      // console.log("ApexClass", apexClassMember.Name);
      // console.log("symbolTable.Methods", symbolTable.methods);

      for (const method of symbolTable.methods) {
        // if (
        //   method.name.toLowerCase().includes("test") &&
        //   method.visibility === SymbolVisibility.PRIVATE &&
        //   (!method.references || method.references.length === 0)
        // ) {
        //   continue;
        // }

        // if (method.visibility === SymbolVisibility.GLOBAL) {
        //   continue;
        // }

        // if (method.name === "aot") {
        //   continue;
        // }

        if (
          method.annotations.includes("IsTest") ||
          method.modifiers.includes("global") ||
          method.modifiers.includes("private")
        ) {
          continue;
        }

        const qualifiedMethodName = `${symbolTable.name}.${method.name}`;
        declaredMethods.set(qualifiedMethodName, {
          id: apexClassMember.Id,
          className: apexClassMember.Name,
          methodName: method.name,
          location: method.location,
        });
        // console.log("Method added", method);

        if (method.references && method.references.length > 0) {
          methodReferences.add(qualifiedMethodName);
        }
      }

      for (const externalRef of symbolTable.externalReferences) {
        for (const externalMethodRef of externalRef.methods) {
          methodReferences.add(`${externalRef.name}.${externalMethodRef.name}`);
        }
      }
    }

    const unusedMethods: UnusedMethodInfo[] = Array.from(
      declaredMethods.entries()
    )
      .filter(([qualifiedName]) => !methodReferences.has(qualifiedName))
      .map(([, methodInfo]) => methodInfo)
      .sort(
        (a, b) =>
          a.className.localeCompare(b.className) ||
          a.methodName.localeCompare(b.methodName)
      );

    // console.log("unusedMethods", unusedMethods);
    return unusedMethods;
  }

  useEffect(() => {
    getDataFromServer();
  }, []);

  if (isLoading) {
    return <Loader className="h-8 w-8 animate-spin duration-9000" />;
  }

  if (error) {
    return (
      <div className="text-destructive font-sm">Error: {error.message}</div>
    );
  }

  if (!data) {
    return <div className="text-destructive font-sm">No data found!!!</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Class</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Line Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.unUsedCode.map((item: any) => (
            <TableRow key={item.id + item.methodName}>
              <TableCell className="font-medium">{item.className}</TableCell>
              <TableCell>{item.methodName}</TableCell>
              <TableCell>{item.location.line}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell></TableCell>
            <TableCell colSpan={3}>Total Unused Methods</TableCell>
            {/* <TableCell>{data?.reduce((acc: any, item: any) => acc + item.unusedCode, 0)}</TableCell> */}
            <TableCell>{data.unUsedCode.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
