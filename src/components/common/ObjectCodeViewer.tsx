import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { getTopic } from "@/lib/Salesforce";

interface ObjectInfo {
  Id: string;
  // Add other properties of ObjectInfo if needed
}

interface AuraDefinition {
  Id: string;
  DefType: string;
  Format: string;
  Source: string;
}

interface ServerResponse {
  records: AuraDefinition[];
}

// Assuming this is your server function
declare function GetTopic(
  objectType: string,
  params: { id: string }
): Promise<ServerResponse>;

export const AuraDefinitionEditor: React.FC<{ objectInfo: ObjectInfo }> = ({
  objectInfo,
}) => {
  const [auraDefinitions, setAuraDefinitions] = useState<AuraDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDataFromServer = async () => {
      try {
        const response = await getTopic("auraDefinition", {
          id: objectInfo.Id,
        });
        //@ts-ignore
        setAuraDefinitions(response[0].records);
        //@ts-ignore
        if (response[0].records.length > 0) {
          //@ts-ignore
          setActiveTab(response[0].records[0].Id);
        }
      } catch (err) {
        setError("Failed to fetch Aura Definitions. Please try again later.");
        console.error("Error fetching Aura Definitions:", err);
      }
    };

    getDataFromServer();
  }, [objectInfo.Id]);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
  };

  const activeDefinition = auraDefinitions.find((def) => def.Id === activeTab);

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap mb-4">
        {auraDefinitions.map((def) => (
          <button
            key={def.Id}
            className={`
              px-2 py-1 mr-1 mb-1 rounded-t-md font-semibold text-sm focus:outline-none
              ${
                activeTab === def.Id
                  ? "bg-primary text-primary-foreground text-xs"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs"
              }
            `}
            onClick={() => handleTabClick(def.Id)}
          >
            {`${def.DefType} - ${def.Format}`}
          </button>
        ))}
      </div>
      {activeDefinition && (
        <div className=" rounded-b-lg overflow-hidden">
          <Editor
            height="calc(100vh - 300px)"
            width="100%"
            theme="vs-dark"
            language={
              activeDefinition.Format.toLowerCase() === "js"
                ? "javascript"
                : activeDefinition.Format.toLowerCase()
            }
            value={activeDefinition.Source}
            options={{
              readOnly: true,
              minimap: { enabled: false },
            }}
          />
        </div>
      )}
    </div>
  );
};
