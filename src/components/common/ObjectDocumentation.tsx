import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useState, useEffect } from "react";
import {
  getDefaultPrompt,
  getDocumentation,
  getFlowDocumentation,
} from "@/lib/generative";
import { Code, Code2Icon, DockIcon, Loader } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ActionType } from "@/types/Common.types";
import { isDevelopment } from "@/lib/utils";

const markdownContent =
  "Keys are **missing** . Grab your *key* and update it in the ```.env.*```. ";
type Props = { objectInfo: any };

function ObjectDocumentation({ objectInfo }: Props) {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string | undefined>("");

  async function getDocumentationFromServer() {
    setIsLoading(true);
    setMarkdownContent("");
    let prompt: string | undefined = promptText;
    if (promptText?.trim() === "") {
      prompt = await getPrompt();
      setPromptText(prompt);
    }

    console.log("ObjectDocumentation: useEffect: objectInfo", objectInfo);
    const documentation =
      objectInfo.attributes.type === "Flow"
        ? await getFlowDocumentation(objectInfo)
        : await getDocumentation(objectInfo, prompt as string);
    setMarkdownContent(documentation);
    setIsLoading(false);
  }
  useEffect(() => {
    getDocumentationFromServer();
  }, [objectInfo]);

  async function getPrompt(): Promise<string | undefined> {
    try {
      // const prompt = await readPromptFromFile(
      //   "/src/prompts/CodeConversion.txt",
      //   true
      // );

      const prompt = getDefaultPrompt(objectInfo, ActionType.Documentation);
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

  return isLoading ? (
    <Loader className="animate-spin w-12 h-12" />
  ) : (
    // <div className="bg-secondary rounded-md p-2">
    <Tabs
      className="bg-secondary rounded-md p-2 h-full"
      orientation="vertical"
      defaultValue="documentation"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="documentation">
          <DockIcon /> &nbsp; Documentation
        </TabsTrigger>
        {isDevelopment() && (
          <TabsTrigger value="prompt">
            <Code2Icon /> Prompt Design
            <pre className="font-mono text-xs text-red-500">
              Development Only
            </pre>
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="documentation">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {markdownContent}
        </Markdown>
      </TabsContent>
      <TabsContent value="prompt">
        <div>
          <Label htmlFor="instruction">Instructions</Label>
          <Textarea
            placeholder="Instructions for conversion..."
            defaultValue={promptText}
            id="instruction"
            onChange={handleChange}
            className="text-xs h-[500px]"
          ></Textarea>

          <Button className="w-full mt-4 " onClick={getDocumentationFromServer}>
            Document using the new prompt
          </Button>
        </div>
      </TabsContent>
    </Tabs>
    // </div>
  );
}

export default ObjectDocumentation;
