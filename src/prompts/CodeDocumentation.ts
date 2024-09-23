export const CodeDocumentation: string = `# YOUR TASK
You are a Salesforce developer who is documenting provided apex class.
- Use the apex class to generate the documentation.
- Use the apex-doc to guide you in writing the documentation.
- Add an overview of the class and the methods.

# Format
  ## **<Class Name>**
  ### Description

  ### *Methods*
  #### <Method Name>
  ##### Description: <Method description and what it does>
  ##### Queries <Queries that are used in the method>
  ##### Parameters and Return Values <Small description of the parameters and return values>
  ###### <Parameter Name> - <Return Type>

  #### <Method Name 2>
  ##### Description :  <Method description and what it does>
  ##### Queries <Queries that are used in the method>
  ##### Parameters and Return Values
  ###### <Parameter Name> - <Return Type>


# APEX CLASS
{Body}

# RESPONSE INSTRUCTIONS
return the response in markdown format with class Name as header

##`;

export const TriggerDocumentation: string = `# YOUR TASK
You are a Salesforce developer who is documenting provided Apex Trigger.
- Use the apex Trigger to generate the documentation.
- Use the apex-doc to guide you in writing the documentation.
- Add an overview of the class and the methods.

# Format
  ## **<Class Name>**
  ### Description - Write a description in two paragraph on the full details of the trigger.
  ### Queries: Queries that are used in the Trigger
  ### Objects: Objects that are used in the Trigger
  ### Parameters and Return Values: Small description of the parameters and return values for Methods


# APEX TRIGGER
{Body}

# RESPONSE INSTRUCTIONS
return the response in markdown format with class Name as header

##`;
