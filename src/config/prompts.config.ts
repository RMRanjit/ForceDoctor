export enum promptType {
  ApexCodeConversion,
  ApexCodeDocumentation,
  TriggerCodeConversion,
  TriggerCodeDocumentation,
  FlowDocumentation,
  ValidationRuleDocumentation,
}

export type PromptConfigItem = {
  prompt: promptType;
  location: string;
  active: boolean;
};

export const dashboardConfig: PromptConfigItem[] = [
  {
    prompt: promptType.ApexCodeConversion,
    location: "/src/prompts/CodeConversion.txt",
    active: true,
  },
  {
    prompt: promptType.ApexCodeDocumentation,
    location: "/src/prompts/CodeDocumentation.txt",
    active: true,
  },
  {
    prompt: promptType.TriggerCodeConversion,
    location: "/src/prompts/CodeConversion.txt",
    active: true,
  },
  {
    prompt: promptType.TriggerCodeDocumentation,
    location: "/src/prompts/CodeDocumentation.txt",
    active: true,
  },
  {
    prompt: promptType.FlowDocumentation,
    location: "/src/prompts/FlowDocumentation.txt",
    active: true,
  },
  {
    prompt: promptType.ValidationRuleDocumentation,
    location: "/src/prompts/ValidationRuleDocumentation.txt",
    active: true,
  },
];
