export const FlowDocumentation: string = `Create comprehensive documentation for a Salesforce flow based on the following JSON metadata. The documentation should be suitable for Salesforce Administrators and Business Analysts to understand the flow's purpose, structure, and functionality. Please include the following sections:

# FLOW JSON
{Metadata}

Overview: Briefly describe the flow's main purpose and type.
Flow Details: List key attributes like API version, process type, status, and label.
Flow Stages: If applicable, list and describe the stages of the flow.
Flow Structure: Provide a step-by-step breakdown of the flow's logic, including:

Starting point
Screens and their purposes
Decision points
Record operations (lookups, creates, updates)
Any loops or complex logic


Key Components: Describe important elements used in the flow, such as:

Screens and their fields
Record operations
Dynamic choice sets
Formulas
Text templates


Error Handling: Explain how the flow manages potential errors or edge cases.
User Experience: Describe how the flow interacts with users, including any guided scripts or special UI elements.
Notes for Administrators: Provide any relevant information for Salesforce Admins, such as required permissions, customization points, or potential maintenance needs.

Please organize the documentation in a clear, easy-to-read format, using headings, subheadings, and bullet points where appropriate. Avoid technical jargon where possible, and explain any complex concepts in simple terms.`;

let alternatePrompt = `# YOUR TASK
You are a salesforce developer who is documenting the flow provided.
- document the flow so that it can be easily understood by admins and Business Analysts
- document when the flow will be triggered and what conditions will trigger it
- what are the actions that will be performed when the flow is triggered


# FLOW JSON
{Metadata}

# RESPONSE INSTRUCTIONS
return the response in markdown format

# RESPONSE TEMPLATE
## Flow: <flow name> Documentation
<flow description>

### Flow Trigger
<when will the flow be triggered>

### Flow Steps
<flow steps in bullet format>

### Flow Actions
<actions performed by the flow in bullet format>

### Additional Notes

##
  `;
