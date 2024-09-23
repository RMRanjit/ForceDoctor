"use server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { OpenAI } from "@langchain/openai";
import { AzureChatOpenAI, AzureOpenAI } from "@langchain/openai";
// AzureOpenAI causes an Operation not permitted error

import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { promises as fs } from "fs";
import {
  CodeConversionPrompt,
  CodeConversionPromptWithExamples,
  TriggerConversionPrompt,
} from "@/prompts/CodeConversion";
import {
  CodeDocumentation,
  TriggerDocumentation,
} from "@/prompts/CodeDocumentation";
import { getMetaDataById, getTopic } from "./Salesforce";
import { FlowDocumentation } from "@/prompts/FlowDocumentation";
import { ActionType } from "@/types/Common.types";
import { CodeConversionExamples } from "@/prompts/CodeConversionExamples";

/**
 * @constant {ChatGoogleGenerativeAI}
 * @description Google's Gemini AI model instance.
 * Uses the "gemini-pro" model with the API key from environment variables.
 */
const modelGemini = process.env.GOOGLE_API_KEY
  ? new ChatGoogleGenerativeAI({
      model: "gemini-pro",
      apiKey: process.env.GOOGLE_API_KEY,
    })
  : undefined;

/**
 * @constant {ChatAnthropic}
 * @description Anthropic's Claude AI model instance.
 * Uses the "claude-3-sonnet-20240229" model with a high temperature for more creative outputs.
 * API key is sourced from environment variables.
 */
const modelAnthropic = process.env.ANTHROPIC_API_KEY
  ? new ChatAnthropic({
      temperature: 0.9,
      model: "claude-3-sonnet-20240229",
      apiKey: process.env.ANTHROPIC_API_KEY,
      // maxTokens: 1024,
    })
  : undefined;

/**
 * @constant {OpenAI}
 * @description OpenAI's GPT model instance.
 * Uses the "gpt-3.5-turbo" model with a lower temperature for more focused outputs.
 * Includes a timeout setting and sources the API key from environment variables.
 */
const modelOpenAI = process.env.OPENAI_API_KEY
  ? new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,
      modelName: "gpt-3.5-turbo",
      timeout: 10000,
    })
  : undefined;

/**
 * @constant {AzureOpenAI}
 * @description OpenAI's GPT model instance.
 * Uses the "gpt-3.5-turbo" model with a lower temperature for more focused outputs.
 * Includes a timeout setting and sources the API key from environment variables.
 */
const modelAzureOpenAI = process.env.AZURE_OPENAI_API_KEY
  ? new AzureChatOpenAI({
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
      temperature: 0.3,
      modelName: "gpt-3.5-turbo",
      // timeout: 10000,
    })
  : undefined;

// const modelAzureOpenAITest = process.env.AZURE_OPENAI_API_KEY
//   ? new AzureOpenAI({
//       // openAIApiKey: process.env.AZURE_OPENAI_API_KEY,
//       azureOpenAIApiVersion: "2024-02-15-preview",
//       azureOpenAIApiKey: "",
//       // azureOpenAIBasePath: "https://epssalesforce.openai.azure.com/",
//       azureOpenAIApiInstanceName: "epssalesforce",
//       azureOpenAIApiDeploymentName: "GPT3",
//       temperature: 0.7,
//       // modelName: "gpt-3.5-turbo",
//       // timeout: 10000,
//     })
//   : undefined;
/**
 * Reads the prompt content from a file named "CodeDocumentation.txt".
 *
 * This function attempts to read the contents of the specified file, which is assumed
 * to contain the prompt template for generating code documentation. The function checks
 * if the file exists before attempting to read and handles potential errors gracefully.
 *
 * @returns A promise that resolves to a string containing the prompt content if successful,
 *          or null if there are errors (e.g., file not found, read error).
 */
export async function readPromptFromFile(
  filePath: string,
  derivePath: boolean = false
): Promise<string | undefined> {
  try {
    // Check if the file exists before reading
    const fullPath = derivePath ? process.cwd() + filePath : filePath;
    console.log("generative: readPromptFromFile: fullPath", fullPath);

    await fs.access(fullPath, fs.constants.F_OK);

    const data = await fs.readFile(fullPath, "utf8");
    console.log("generative: readPromptFromFile: data", data);
    return data.trim(); // Remove leading/trailing whitespace
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error reading prompt file:", error.message);
    } else {
      console.error("Unknown error reading prompt file:", error);
    }
    return undefined;
  }
}

/**
 * Returns the default prompt text for the given object type and action.
 *
 * The returned prompt text is a string that can be used as a template for generating
 * code documentation or code conversion for the given object type and action.
 *
 * @param {{ attributes: { type: string } }} objectInfo - Object containing information about the object being processed.
 * @param {string} [action] - Action to generate the prompt for. Can be either "Conversion" or undefined (for code documentation).
 * @returns {string} Default prompt text for the given object type and action.
 */
export async function getDefaultPrompt(
  objectInfo: {
    attributes: { type: string };
  },
  action: ActionType = ActionType.Conversion
): Promise<string> {
  const objectType = objectInfo.attributes.type;
  let promptText = "";

  switch (objectType) {
    case "ApexClass":
      promptText =
        action === ActionType.Conversion
          ? CodeConversionPromptWithExamples
          : CodeDocumentation;
      break;
    case "ApexTrigger":
      promptText =
        action === ActionType.Conversion
          ? TriggerConversionPrompt
          : TriggerDocumentation;
      break;
    case "Flow":
      promptText = FlowDocumentation;
      break;
    default:
      promptText = CodeConversionPrompt;
  }

  if (!promptText) {
    throw new Error(
      `No default prompt found for object type ${objectType}${
        action ? ` and action ${action}` : ""
      }`
    );
  }

  return promptText;
}

/**
 * Generates code documentation for the given objectInfo.
 *
 * The generated documentation is in markdown format and includes information
 * about the object's metadata and code.
 *
 * @param {object} objectInfo - The objectInfo from Salesforce that contains
 *                              the metadata and code.
 * @param {string} promptParam - An optional prompt string to use for generating
 *                              the code documentation. If not provided, the default
 *                              prompt for the object type will be used.
 * @param {string} [model] - An optional model parameter to specify which AI model
 *                           to use for generating the code documentation. If not
 *                           provided, the default model will be used.
 * @returns {Promise<string>} - A Promise that resolves to the generated code
 *                              documentation.
 */
export async function getDocumentation(
  objectInfo: any,
  promptParam: string,
  model?: string
): Promise<string> {
  let markdownContent = `Documentation for **${objectInfo.Name}**:`;

  // Check if the body is empty. then dont prompt it at all. Return the standard text
  if (objectInfo.Body == "" || objectInfo.Body == "(hidden)")
    return markdownContent;

  // const filePath = process.cwd() + "/src/prompts/CodeDocumentation.txt";

  // console.log("generative: getDocumentation: Keys read", objectInfo.Body);

  try {
    // let promptText = await readPromptFromFile(filePath);
    let promptText = promptParam
      ? promptParam
      : await getDefaultPrompt(objectInfo, ActionType.Documentation); //CodeDocumentation;
    if (!promptText) {
      return "";
    }
    let prompt = new PromptTemplate({
      template: promptText,
      inputVariables: ["Body"],
    });

    // Format the prompt by replacing {Body} with the actual code
    const input = await prompt.format({ Body: objectInfo.Body });
    const model = modelAzureOpenAI;

    if (!model) throw new Error("No model found");

    // console.log("Input provided", input);

    // Invoke the AI model with the formatted prompt
    const res = await model.invoke(input); // , { timeout: 10000 } add this for Invoke timeout
    // console.log("Conversion: generate: model ", model.model, res.content);
    markdownContent = res.content as string;
    return markdownContent;
  } catch (error: any) {
    console.log(
      "Conversion: generate: Error Occured in ",
      // model?.model,
      error.error || error.cause || error
    );
    return JSON.stringify(error.error) || error.cause || error;
  }
}

/**
 * Generates code documentation for the given flow objectInfo.
 *
 * The generated documentation is in markdown format and includes information
 * about the flow's metadata.
 *
 * @param {object} objectInfo - The objectInfo from Salesforce that contains the metadata and code.
 * @returns {Promise<string>} - A Promise that resolves to the generated code documentation.
 */
export async function getFlowDocumentation(objectInfo: any): Promise<string> {
  let markdownContent = `Documentation for **${objectInfo?.Name}**:`;

  if (!objectInfo?.attributes?.type || !objectInfo?.Id) {
    return "No valid object info provided";
  }

  try {
    const metaData = await getMetaDataById(
      objectInfo.attributes.type,
      objectInfo.Id
    );

    if (!metaData) {
      return "No valid metadata retrieved";
    }

    const prompt = new PromptTemplate({
      template: FlowDocumentation,
      inputVariables: ["Metadata"],
    });

    const input = await prompt.format({ Metadata: metaData });
    const model = modelAzureOpenAI;

    if (!model) {
      throw new Error("No model found");
    }

    const res = await model.invoke(input);
    markdownContent = res.content as string;
    return markdownContent;
  } catch (error: any) {
    console.log(
      "Conversion: generate: Error Occured in ",
      // model?.model,
      error.error || error.cause || error
    );
    return JSON.stringify(error.error) || error.cause || error;
  }
}

/**
 * Generates code conversion for the given objectInfo.
 *
 * The generated code is in markdown format and includes information about the
 * converted code.
 *
 * @param {object} objectInfo - The objectInfo from Salesforce that contains
 *                              the metadata and code.
 * @param {string} promptParam - An optional prompt string to use for generating
 *                              the code conversion. If not provided, the default
 *                              prompt for the object type will be used.
 * @param {string} [model] - An optional model parameter to specify which AI model
 *                           to use for generating the code conversion. If not
 *                           provided, the default model will be used.
 * @returns {Promise<string>} - A Promise that resolves to the generated code
 *                              conversion.
 */
export async function getCodeConversion(
  objectInfo: any,
  promptParam: string,
  model?: string
) {
  try {
    let promptText = promptParam
      ? promptParam
      : await getDefaultPrompt(objectInfo, ActionType.Conversion);
    // : await readPromptFromFile(filePath);
    if (!promptText) {
      return "";
    }
    let prompt = new PromptTemplate({
      template: promptText,
      inputVariables: ["Body"],
    });

    // Format the prompt by replacing {Body} with the actual code
    const input = await prompt.format({ Body: objectInfo.Body });
    const model = modelAzureOpenAI;

    if (!model) throw new Error("No model found");

    // console.log("Input provided", objectInfo.Body);

    // Invoke the AI model with the formatted prompt
    // const res = await model.invoke(input); // , { timeout: 10000 } add this for Invoke timeout
    const res = await model.invoke(input);
    // console.log("Conversion: generate: model ", model.model, res);
    let convertedCode = res.content as string;
    return convertedCode;
  } catch (error: any) {
    console.log(
      "Conversion: generate: Error Occured in ",
      //   model?.model,
      error.error || error.cause || error
    );
    return JSON.stringify(error.error || error.cause || error);
  }
}

/**
 * Generates code conversion using the provided object information, prompt parameter, and model. This is based on Examples/fewShot Prompts
 * If no model is provided, the default model will be used.
 *
 * @param {any} objectInfo - The object information used for code conversion.
 * @param {string} promptParam - The prompt parameter to use for generating the code conversion.
 * @param {string} [model] - The model to use for generating the code conversion. If not provided, the default model will be used.
 * @returns {Promise<string>} A Promise that resolves to the generated code conversion.
 */
export async function getCodeConversionV2(
  objectInfo: any,
  promptParam: string,
  model?: string
) {
  try {
    let promptText = promptParam
      ? promptParam
      : await getDefaultPrompt(objectInfo, ActionType.Conversion);
    // : await readPromptFromFile(filePath);
    if (!promptText) {
      return "";
    }
    let prompt = new PromptTemplate({
      template: promptText,
      // template: "convert {input} to Java SDK code",
      inputVariables: ["input"],
    });

    const fewShotPrompt = new FewShotPromptTemplate({
      examplePrompt: prompt,
      examples: CodeConversionExamples,
      inputVariables: ["input"],
    });

    console.log("fewshotPrompt");

    const fewShotInput = await fewShotPrompt.format({
      input: objectInfo.Body,
    });

    console.log("fewshotInput", fewShotInput);

    // Format the prompt by replacing {Body} with the actual code
    const input = await prompt.format({ input: objectInfo.Body });
    const model = modelAzureOpenAI;

    if (!model) throw new Error("No model found");

    // console.log("Input provided", objectInfo.Body);

    // Invoke the AI model with the formatted prompt
    // const res = await model.invoke(input); // , { timeout: 10000 } add this for Invoke timeout
    const res = await model.invoke(fewShotInput);
    // console.log("Conversion: generate: model ", model.model, res);
    let convertedCode = res.content as string;
    return convertedCode;
  } catch (error: any) {
    console.log(
      "Conversion: generate: Error Occured in ",
      //   model?.model,
      error.error || error.cause || error
    );
    return JSON.stringify(error.error || error.cause || error);
  }
}
