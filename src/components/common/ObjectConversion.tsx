"use client";
import React, { useEffect, useRef, useState, cache } from "react";
import { Textarea } from "@/components/ui/textarea";
import Editor, { DiffEditor, type Monaco } from "@monaco-editor/react";

import { getCodeConversion, getDefaultPrompt } from "@/lib/generative";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import {
  Flashlight,
  FlaskConical,
  Github,
  Loader,
  RefreshCcw,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ActionType } from "@/types/Common.types";
import { isDevelopment } from "@/lib/utils";

type Props = {
  objectInfo?: any;
  location?: any;
};

function ObjectConversion({ objectInfo, location }: Props) {
  const [lineNumber, setLineNumber] = useState(0);
  const [data, setData] = useState<any | undefined>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string | undefined>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const editorRef = useRef(null);

  /**
   * Converts the code based on the prompt
   */
  const getCodeConversionFromServer = cache(async () => {
    if (!objectInfo.Body) return;
    setIsLoading(true);
    setData("");

    let prompt: string | undefined = promptText;
    if (promptText?.trim() === "") {
      prompt = await getPrompt();
      setPromptText(prompt);
    }

    const convertedCode = await getCodeConversion(objectInfo, prompt as string);
    setData(convertedCode);
    setIsLoading(false);
  });

  useEffect(() => {
    getCodeConversionFromServer();
  }, [objectInfo]);

  const diffEditorRef = useRef(null);
  function handleEditorDidMount(editor: any, monaco: Monaco) {
    diffEditorRef.current = editor;
  }

  async function getPrompt(): Promise<string | undefined> {
    try {
      // const prompt = await readPromptFromFile(
      //   "/src/prompts/CodeConversion.txt",
      //   true
      // );

      const prompt = getDefaultPrompt(objectInfo, ActionType.Conversion);
      // console.log("ObjectConversion: getPrompt: prompt", prompt);
      return prompt;
    } catch (error) {
      console.error("ObjectConversion: getPrompt: error", error);
      return undefined;
    }
  }

  const handleChange = (event: any) => {
    setPromptText(event.target.value);
  };

  return (
    <div>
      <div className="flex flex-col h-auto">
        {isLoading ? (
          <Loader className="animate-spin w-8 h-8" />
        ) : (
          <>
            {/* <div>
              Full URL:
              {typeof window !== "undefined" ? window.location.href : ""}
            </div> */}
            {isDevelopment() && (
              <div className="text-xs p-4 m-1 bg-secondary">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <div className="grid w-full gap-1.5">
                    <CollapsibleTrigger asChild>
                      <pre className="text-xs text-red-600">
                        visible only in Development version ** Click to Modify
                        the prompt **
                      </pre>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div>
                      <Label htmlFor="instruction">Instructions</Label>
                      <Textarea
                        placeholder="Instructions for conversion..."
                        defaultValue={promptText}
                        id="instruction"
                        onChange={handleChange}
                        className="text-xs h-[70%]"
                      ></Textarea>

                      <Button
                        className="w-full mt-4 "
                        onClick={getCodeConversionFromServer}
                      >
                        Convert using the new prompt
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            <DiffEditor
              height="calc(100vh - 300px)"
              width="100%"
              original={objectInfo.Body}
              originalLanguage="apex"
              modified={data}
              modifiedLanguage="java"
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
              }}
            />
            <div className="flex flex-row justify-end">
              <Button
                className="m-2 w-52 p-2"
                onClick={getCodeConversionFromServer}
              >
                Try again!
                <RefreshCcw className="ml-2 " strokeWidth={1} />
              </Button>
              <Button className="m-2 w-52 p-2">
                Deploy Code
                <Github className="ml-2 " strokeWidth={1} />
              </Button>
              <Button className="m-2 w-52 p-2">Show POM.xml</Button>
              <Button className="m-2 w-52 p-2">
                Create Test Class
                <FlaskConical className="ml-2" strokeWidth={1} />
              </Button>
              <Button className="m-2 w-52 p-2">
                Test Data
                <FlaskConical className="ml-2" strokeWidth={1} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ObjectConversion;
