export const CodeConversionPrompt = `You are converting Salesforce APEX Code to Veeva Vault SDK Code in Java.
- if there are SOQL queries, utilize the QueryService. Use QueryResponse object to get the results
- Remove any Apex specific annotations such as @AuraEnabled
- Do not add any language tags or comments in the beginning
- Convert the code completely
- Ensure that documentation for each method is provided above the method
- Convert the apex class into a Java SDK clas that handles similar record events
- Transform the apex class into a Java class with equivalent annotations and methods
- Map the Apex Class events to corresponding Java SDK annotations and events
- Use Java SDK annotations only
- In the context of Java SDK, convert the apex class code and ensure that the record event handling is correctly mapped
- Generate a Java class that mimics the behavior of the apex class, including the appropriate event annotations and method overrides
- Convert the apex class to Java, maintaining a similar naming convention for the class and methods, with names and parameters adjusted for Java SDK standards
- Translate the apex class into Java SDK code, ensuring the context handling in Java is equivalent
- Convert Map, List and Set creation with Vault Collections in corresponding Java SDK code
- Map Initialization should be done, by new Map<> and do not use new HashMap<>
- For Map, Id should be converted to Integer

# APEX CLASS
{Body}

# RESPONSE INSTRUCTIONS
Convert Apex code to convert it into User-Defined Class, do not add aditional functionality, retain the functionality and do the conversion. 
Donot add any langauge tags or comments in the beginning
Convert the code completely, Donot create partial conversions
Donot hallucinate. 
Produce compilable code only`;

export const CodeConversionPromptWithExamples = `You are converting Salesforce APEX Code to Veeva Vault SDK Code in Java.
- if there are SOQL queries, utilize the QueryService. Use QueryResponse object to get the results
- Do not add any language tags or comments in the beginning
- Convert the code completely
- Convert the apex class into a Java SDK clas that handles similar record events
- Transform the apex class into a Java class with equivalent annotations and methods
- Map the Apex Class events to corresponding Java SDK annotations and events
- Use Java SDK annotations only
- In the context of Java SDK, convert the apex class code and ensure that the record event handling is correctly mapped
- Generate a Java class that mimics the behavior of the apex class, including the appropriate event annotations and method overrides
- Convert the apex class to Java, maintaining a similar naming convention for the class and methods, with names and parameters adjusted for Java SDK standards
- Translate the apex class into Java SDK code, ensuring the context handling in Java is equivalent
- Convert Map, List and Set creation with Vault Collections in corresponding Java SDK code
- Map Initialization should be done, by new Map<> and do not use new HashMap<>
- For Map, Id should be converted to Integer

# APEX CLASS
{input}

# RESPONSE INSTRUCTIONS
Convert Apex code to convert it into User-Defined Class, do not add aditional functionality, retain the functionality and do the conversion. 
Donot add any langauge tags or comments in the beginning
Convert the code completely, Donot create partial conversions
Donot hallucinate. 
Produce compilable code only`;

export const TriggerConversionPrompt = `You are converting Salesforce Trigger to Veeva Vault SDK Code in Java.
- if there are SOQL queries, utilize the QueryService. Use QueryResponse object to get the results
- Do not add any language tags or comments in the beginning
- Convert the code completely
- Ensure that documentation for each method is provided above the method
- Convert the apex trigger into a Java SDK class that handles similar record events
- Transform the apex trigger into a Java class with equivalent annotations and methods
- Map the Apex Trigger events to corresponding Java SDK annotations and events
- Use Java SDK annotations only
- QueryResponse use streamResults to fetch the query result to have in the  objects
- use VaultCollections in Map, List and Set creation  and do not use new with VaultCollections
- convert  Map, List and Set creation with VaultCollections in corresponding Java SDK code
- In the context of Java SDK, convert the apex trigger code and ensure that the record event handling is correctly mapped
- Generate a Java class that mimics the behavior of the apex trigger, including the appropriate event annotations and method overrides
- Convert the apex trigger to Java, maintaining a similar naming convention for the class and methods, with names and parameters adjusted for Java SDK standards
- Translate the apex trigger into Java SDK code, ensuring the context handling in Java is equivalent
- For Map, Id should be converted to Integer
 
# APEX TRIGGER
{Body}
 
# RESPONSE INSTRUCTIONS
Donot hallucinate. 
Produce compilable code only`;
