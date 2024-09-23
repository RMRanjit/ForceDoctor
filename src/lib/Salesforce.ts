// @ts-nocheck
"use server";
import { authOptions } from "@/config/authOptions";
import jsforce, { IdentityInfo, Connection } from "jsforce";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import temp from "temp";
import type { topic, MetaDataRecord } from "@/types/Common.types";
import { join } from "path";
import { Node, Edge, Position } from "reactflow";
import { getObjectName } from "./utils";
import { execSync } from "child_process";
import {
  MetadataInfo,
  SalesforceEventType,
  metaDataSupportedObjectTypes,
} from "@/types/Salesforce.types";
import { includes, uniq } from "lodash";
import { Code } from "lucide-react";
import { AllQueries } from "@/config/queries.config";
import { VeevaObjectMapping } from "@/config/VeevaObjectMapping.config";

const secret = process.env.NEXTAUTH_SECRET;

const emptyMetaDataObject = {
  createdById: "",
  createdByName: "",
  createdDate: "",
  fileName: "",
  fullName: "",
  id: "",
  lastModifiedById: "",
  lastModifiedByName: "",
  lastModifiedDate: "",
  manageableState: "",
  namespacePrefix: "",
  type: "",
};

/**
 *
 * @param req : The Request Parameter. Used to get the token/connection params from the server. If this is not specified/or is undefined, the connection params are retrieved from session
 * @returns JSForce connection object.
 */
export async function getSalesforceConnection(
  req?: NextRequest
): Promise<Connection> {
  let instanceUrl: string | undefined;
  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  if (req) {
    const jwt = await getToken({ req: req, secret: secret });
    // console.log(" JWT Token is :", JSON.stringify(jwt));
    instanceUrl = jwt?.instanceUrl as string | undefined;
    accessToken = jwt?.accessToken as string | undefined;
    refreshToken = jwt?.refresh_token as string | undefined;
  } else {
    // Try to get it from the Server Session
    // console.log(
    //   "Salesforce.ts: getSalesforceConnection: AuthOptions",
    //   authOptions
    // );
    const serverSession = await getServerSession(authOptions);
    instanceUrl = serverSession.instanceUrl;
    accessToken = serverSession.accessToken;
    refreshToken = serverSession.refresh_token;
  }
  if (instanceUrl && accessToken) {
    try {
      return await new jsforce.Connection({
        // @ts-ignored
        instanceUrl: instanceUrl,
        // @ts-ignored
        accessToken: accessToken,
        refreshToken: refreshToken,
        version: "52.0",
      });
    } catch (err: any) {
      console.error("Error Occured: getSalesforceConnection", err.message);
      if (
        error instanceof jsforce.Error &&
        error.errorCode === "INVALID_SESSION_ID"
      ) {
        try {
          // Attempt to refresh the token
          await conn.oauth2.refreshToken(refreshToken);
          // If successful, the 'refresh' event will be triggered and the token updated
          return conn;
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          throw new Error("Failed to refresh Salesforce token");
        }
      }
    }
  } else {
    console.error("Required parameters not found in JWT Token or Session");
    throw new Error("Invalid JWT Token/Session");
  }
}

/**
 *
 * @param req : The Request Parameter. Used to get the token/connection params from the server. If this is not specified/or is undefined, the connection params are retrieved from session
 * @returns The identity Object
 */
export async function getIdentity(req?: NextRequest) {
  try {
    const connection = await getSalesforceConnection(req);
    if (!connection) throw new Error("No SFDC connection");
    const identity: IdentityInfo = await connection.identity();

    // const normalizedIdentity = {
    //   // id: identity.id,
    //   //user_id: identity.user_id,
    //   //organization_id: identity.organization_id,
    //   //username: identity.username,
    //   //nick_name: identity.nick_name,
    //   //display_name: identity.display_name,
    //   //email: identity.email,
    //   first_name: identity.first_name,
    //   last_name: identity.last_name,
    //   //timezone: identity.timezone,
    //   //picture: identity.photos.picture,
    //   //thumbnail: identity.photos.thumbnail,
    //   //active: identity.active,
    //   //user_type: identity.user_type,
    //   //language: identity.language,
    //   //locale: identity.locale,
    //   //utcOffset: identity.utcOffset,
    // };
    // console.log("Salesforce: getIdentity", normalizedIdentity);

    return req
      ? NextResponse.json({ identity }, { status: 200 })
      : (JSON.stringify(identity) as string);
  } catch (err: any) {
    console.error("Error occured in identity route:", err.message);
    return req
      ? NextResponse.json(
          // { error: err.message, errorStack: err.stack },
          { error: err.message },
          { status: 500 }
        )
      : (JSON.stringify(err) as string);
  }
}
/**
 *
 * @param apiHeader  The Header parameters such as URL, Method [GET, POST, PUT, DELETE]
 * @param req The Request Parameter. Used to get the token/connection params from the server. If this is not specified/or is undefined, the connection params are retrieved from session
 * @returns
 */
export async function processRequest(
  apiHeader: { url: string; method: string },
  req?: NextRequest
) {
  try {
    const connection = await getSalesforceConnection(req);
    return await connection.request(apiHeader, undefined, (error, response) => {
      if (error) throw error;
      return response;
    });
  } catch (error) {
    throw error;
  }
}
/**
 * Gets  query(s) for the topic from queries.config.json file and calls the private method processQueries to process retrieved queries
 *
 *
 * @param topic The topic for which data is required
 * @param req  httpRequest or NextRequest
 * @param string array of the filters that needs to be applied
 * @returns If the topic is found in the queries.config.json, then the type of query [ REST| TOOLING | REQUEST] is executed and the results are returned
 */
export async function getTopic(
  topic?: string,
  filter?: Record<string, string | number>,
  // isQuoted?: boolean,
  req?: NextRequest
) {
  try {
    // let fileContent = await fs.readFile(
    //   process.cwd() + "/src/config/queries.config.json", // TODO: Move it to .env?
    //   "utf-8"
    // );
    // let queries = await JSON.parse(fileContent);

    const queryObjects = topic
      ? AllQueries.filter(
          (query: topic) =>
            query.objectName.toUpperCase() === topic.toUpperCase() &&
            query.isActive === true //Added this to prevent inactive queries from being processed
        )
      : AllQueries.filter(
          (query: topic) => query.isActive === true //Added this to prevent inactive queries from being processed
        );

    let data = await processQueries(req, queryObjects, filter);

    return data;
  } catch (error: any) {
    console.error("Error occurred:", error?.message);
    throw error;
  }
}

/**
 * Executes a paginated query on the Salesforce API and recursively fetches all pages of the result.
 * @param {Object} queryResult - The result of a query.
 * @returns {Object} The complete result of the query.
 */
async function toolingQueryMore(queryResult, connection: Connection) {
  const res = await connection.tooling.queryMore(queryResult.nextRecordsUrl);
  queryResult.records.push(...res.records);
  if (!res.done) {
    await toolingQueryMore(queryResult, connection);
  }
  return queryResult;
}

/**
 * Executes a query on the Salesforce API and fetches all results.
 * @param {string} query - The SOQL query.
 * @returns {Array} The records returned by the query.
 */
async function toolingQueryAll(query: string, connection: Connection) {
  let res = await connection.tooling.query(query);
  if (!res.done) {
    res = await toolingQueryMore(res, connection);
  }
  return res;
}

/**
 * Executes a query on the Salesforce API and fetches all results.
 * @param {string} queryStr - The SOQL query.
 * @returns {Promise<Array>} A promise that resolves with the records returned by the query.
 */
async function queryAll(queryStr: string, connection: any) {
  let records = <any>[];

  return new Promise((resolve, reject) => {
    connection
      .query(queryStr)
      .on("record", (record: any) => {
        records.push(record);
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (err: any) => {
        reject(err);
      })
      .run({ autoFetch: true, maxFetch: 500000, scanAll: true });
  });
}

/**
 * This is a private function that processes all the query objects and retrieves the results
 * We have not used the queryMore functions,as we have maximized with maxFetch attribute as 500000. The thinking is that
 * system objects would not exceed that value.
 * TODO: Post processing code is repeated for each switch statement. need to refactor them
 * TODO : MaxFetch attribute as a configurable value, hardcoded as 500000
 *
 * @param req httpRequest or NextRequest
 * @param queryObjects List of topics that needs to be queried
 * @param string array of the filters that needs to be applied
 * @returns a Data Object with the results of the queries executed. to filter out individual results, use the objectName attribute
 */

//
async function processQueries(
  req: NextRequest | undefined,
  queryObjects: topic[],
  filter?: Record<string, string | number | object>,
  isQuoted?: boolean
) {
  const connection = await getSalesforceConnection(req);

  let data = Promise.all(
    queryObjects.map(async (queryObject: topic) => {
      let result = {};
      let response = {};

      //Set the parameters if there are any

      switch (queryObject.type.toUpperCase()) {
        case "REST":
          try {
            let query = queryObject.query.replace(
              /\{(\w+)\}/g,
              (match, key) => {
                if (key in filter) {
                  return filter[key];
                  // const value = filter[key];
                  // return typeof value === "string"
                  // ? isQuoted == true
                  // ? value
                  // : `'${value}'`
                  // : value.toString();
                }
                return match;
              }
            );
            // console.log("query Retrieved: ", queryObject.query, filter);
            // console.log("query Formed: ", query, filter);

            //Adding the if condition for isQuoted true cases as it can't retrieve response from queryAll
            // if (isQuoted == true) {
            // response = await connection.query(
            // query,
            // (err: any, response: any) => {
            // if (err) throw err;
            // return response;
            // }
            // );
            // result.records = response;
            // result.totalSize = response.length;
            // } else {
            response = await queryAll(query, connection);
            result.records = response;
            result.totalSize = response.length;
            // }
            result.objectName = queryObject.objectName;
            if (
              typeof queryObject.postProcessing === "string" &&
              queryObject.postProcessing != ""
            ) {
              const processingFunction = new Function(
                "data",
                queryObject.postProcessing
              );
              // console.log("function to be processed: ", query.postProcessing);
              await processingFunction(result);
              //console.log(processingFunction, response);
            }
          } catch (err) {
            console.error(
              "Salesforce: ProcessObject: Error :",
              err.message,
              "while processing ",
              queryObject.type,
              "for objectName:",
              queryObject.objectName
            );
            result = {
              totalSize: 0,
              error: err.message,
              objectName: queryObject.objectName,
              records: [],
            };
          }
          return result;
        case "TOOLING":
          try {
            let query = queryObject.query.replace(
              /\{(\w+)\}/g,
              (match, key) => {
                if (key in filter) {
                  return filter[key];
                  // const value = filter[key];
                  // return typeof value === "string"
                  // ? isQuoted == true
                  // ? value
                  // : `'${value}'`
                  // : value;
                }
                return match;
              }
            );
            result = await toolingQueryAll(query, connection);
          } catch (error) {
            console.error(
              "Salesforce: ProcessObject: Error for objectName ",
              queryObject.objectName,
              " error is ",
              error.message
            );

            result = {
              size: 0,
              totalSize: 0,
              done: true,
              queryLocator: null,
              error: error.message,
              objectName: queryObject.objectName,
              records: [],
            };
          }
          if (
            typeof queryObject.postProcessing === "string" &&
            queryObject.postProcessing != ""
          ) {
            const processingFunction = new Function(
              "data",
              queryObject.postProcessing
            );
            // console.log("function to be processed: ", queryObject.postProcessing);
            processingFunction(result);
            //console.log(processingFunction, result);
          }
          return { objectName: queryObject.objectName, ...result };

        case "METADATA":
          try {
            result.objectName = queryObject.objectName;

            const res = await connection.metadata.list(
              [{ type: queryObject.objectName }],
              "60.0"
            );

            // We need to convert it into an Object Array

            result.records = Object.entries(res).map(([key, value]) => {
              const attributes = {
                type: value.type,
                url:
                  "/services/data/v52.0/tooling/sobjects/" +
                  value.type +
                  "/" +
                  value.id,
              };
              // return { Name: key, ...value, attributes };
              return {
                Name: value.fullName,
                Id: value.id,
                ...value,
                attributes,
              };
            });
            result.totalSize = result.records.length;
          } catch (err) {
            console.error(
              "Salesforce: ProcessObject: Error for objectName ",
              queryObject.objectName,
              " error is ",
              err.message
            );
            result = {
              totalSize: 0,
              error: err.message,
              objectName: queryObject.objectName,
              records: [],
            };
          }

          if (
            typeof queryObject.postProcessing === "string" &&
            queryObject.postProcessing != ""
          ) {
            const processingFunction = new Function(
              "data",
              queryObject.postProcessing
            );
            // console.log("function to be processed: ", query.postProcessing);
            await processingFunction(result);
            //console.log(processingFunction, response);
          }

          return result;

        case "REQUEST":
          let query = queryObject.apiHeader.url.replace(
            /\{(\w+)\}/g,
            (match, key) => {
              if (key in filter) {
                return filter[key];
                // const value = filter[key];
                // return typeof value === "string"
                // ? isQuoted == true
                // ? value
                // : `'${value}'`
                // : value.toString();
              }
              return match;
            }
          );

          return await connection.request(
            query || "",
            undefined, // httpAPIOptions expected here. responseType?: string | undefined;transport?: object | undefined; noContentResponse?: object | undefined;
            (err, Object) => {
              if (err) {
                console.error(
                  "Salesforce: ProcessObject: Error for objectName ",
                  queryObject.objectName,
                  " error is ",
                  err.message
                );
                return { error: err };
              }
              if (
                typeof queryObject.postProcessing === "string" &&
                queryObject.postProcessing != ""
              ) {
                const processingFunction = new Function(
                  "data",
                  queryObject.postProcessing
                );
                // console.log("function to be processed: ", queryObject.postProcessing);
                processingFunction(Object);
                // console.log(processingFunction, result);
              }
              return Object;
            }
          );
        default:
          console.error(
            "Salesforce: ProcessObject: Unknown query type: ",
            queryObject.type,
            "for object : ",
            queryObject.objectName,
            " returning empty response"
          );
          return {
            totalSize: 0,
            records: [],
            objectName: queryObject.objectName,
          };
      }
    })
  );
  return data;
}

/**
 * Takes a list of ids or a single id as a string and formats them in a way that can be used in
 * SOQL query filters
 */
function filterableId(metadataId: string) {
  let ids = "";

  //allows for the query to filter by either a single id or multiple ids
  if (Array.isArray(metadataId)) {
    metadataId.forEach((id) => {
      ids += "'" + id + "',";
    });
    //remove the first and last ' (and the last comma) as these are included in the query string
    ids = ids.substring(1, ids.length - 2);
  } else {
    ids = metadataId;
  }

  return ids;
}

/**
 * Retrieves dependency information for a Salesforce metadata component.
 *
 * This function fetches details about the dependencies of a Salesforce metadata component
 * identified by its ID (`id`). It establishes a connection using `getSalesforceConnection`
 * (presumably implemented elsewhere) and executes a SOQL query against the
 * `MetadataComponentDependency` object.
 *
 * The query retrieves the following fields:
 *  - `MetadataComponentId`: ID of the dependent component
 *  - `MetadataComponentName`: Name of the dependent component
 *  - `MetadataComponentType`: Type of the dependent component (e.g., CustomObject, ApexClass)
 *  - `RefMetadataComponentName`: Name of the referenced component
 *  - `RefMetadataComponentType`: Type of the referenced component
 *  - `RefMetadataComponentId`: ID of the referenced component
 *  - `RefMetadataComponentNamespace`: Namespace of the referenced component (if applicable)
 *
 * The query excludes FlexiPages from the results and orders them by the dependent component name
 * and the type of referenced component.
 *
 * @param id The ID of the Salesforce metadata component for which to retrieve dependencies
 * @param req Optional NextRequest object (for connection/authentication purposes)
 * @returns An object containing the retrieved dependency information. In case of errors,
 *          the object will have an `error` property with the error message.
 */
export async function getDependency(id: string, req?: NextRequest | undefined) {
  const nodes = <Node[]>[];
  const edges = <Edge[]>[];
  const result = <MetaDataRecord[]>[];

  try {
    const connection = await getSalesforceConnection(req);

    let query = `SELECT MetadataComponentId, MetadataComponentName,MetadataComponentType ,RefMetadataComponentName, RefMetadataComponentType, RefMetadataComponentId,
        RefMetadataComponentNamespace 
        FROM MetadataComponentDependency 
        WHERE MetadataComponentId ='${id}' AND MetadataComponentType != 'FlexiPage' ORDER BY MetadataComponentName, RefMetadataComponentType`;

    const rootRows = await connection.tooling.query(
      query,
      {
        autoFetch: true,
        maxFetch: 500000,
        // scanAll: true,  // Not applicable, returns an error :)
      },
      (err, result) => {
        if (err) {
          console.error(
            "Salesforce: getDependency: Error for objectName ",
            "MetadataComponentDependency",
            " error is ",
            err.message
          );
          return {
            size: 0,
            totalSize: 0,
            done: true,
            queryLocator: null,
            error: err.message,
            objectName: "MetadataComponentDependency",
            records: [],
          };
        }

        return result;
      }
    );
    // console.log("getDependencies: query", query, rootRows.records);

    if (rootRows && rootRows.records?.length > 0) {
      const rootRecord = <any>rootRows.records[0];
      nodes.push({
        id: rootRecord.MetadataComponentId,
        // name: rootRecord.MetadataComponentName,
        // type: rootRecord.MetadataComponentType,
        data: {
          label: rootRecord.MetadataComponentName,
          id: rootRecord.MetadataComponentId,
          type: rootRecord.MetadataComponentType,
        },
        position: { x: 0, y: 0 },
      });
      result.push(rootRows.records);

      await getChildDependencies(rootRows.records, nodes, result, connection);

      // console.log("Salesforce: getDependency: Get Dependencies:", nodes, result);
    }
  } catch (error: any) {
    console.error("Salesforce: getDependency:", error.message);
    throw error;
  }

  // Loop through the results and create the edges aka connections
  // console.log("Results: ", result);

  result[0]?.map((edge: MetaDataRecord) => {
    // console.log("Salesforce: getDependency:Edge Push", edge, edgeIndex);
    edges.push({
      id: edge.MetadataComponentId + "->" + edge.RefMetadataComponentId,
      source: edge.MetadataComponentId,
      target: edge.RefMetadataComponentId,
    });
  });

  return { result, nodes, edges };
}

/**
 * Recursively retrieves child dependencies for a given set of Salesforce metadata components.
 *
 * This function iterates through an array of `currentRecord` objects, which represent retrieved dependency information.
 * For each record (dependency), it performs the following actions:
 *
 * 1. Checks if the dependent component (`record.RefMetadataComponentId`) has already been processed and exists in the `nodes` array.
 *    - If found, it skips processing to avoid redundant queries.
 * 2. If the component is not found in `nodes`:
 *    - Constructs a SOQL query to retrieve child dependencies for the referenced component (`record.RefMetadataComponentId`).
 *    - Creates a new node object representing the referenced component and adds it to the `nodes` array.
 *    - Executes the SOQL query using `connection.tooling.query` and handles potential errors.
 *    - If child dependencies are found (`childRows.records.length > 0`):
 *        - Adds the child dependency information to the `result` array.
 *        - Recursively calls `getChildDependencies` on the child dependencies to explore deeper levels of the dependency tree.
 *
 * This function facilitates a recursive exploration of the dependency hierarchy, starting from the provided `currentRecord` set.
 *
 * @param {array} currentRecord An array of dependency information objects representing the current level in the dependency tree.
 * @param {array} nodes An array of objects representing processed components (nodes) in the dependency graph.
 * @param {array} result An array that accumulates the dependency information for all levels.
 * @param {object} connection A Salesforce tooling connection object used for querying the dependency data.
 * @returns {Promise<object>} A promise that resolves to an object containing the updated `result` and `nodes` arrays.
 */
async function getChildDependencies(
  currentRecord: MetaDataRecord[],
  nodes: any,
  result: MetaDataRecord[],
  connection: Connection
) {
  currentRecord.map((record, index) => {
    //seek if you have already checked the results for the component in nodes
    const nodeToFind = nodes.filter((node: Node) => {
      node.id === record.MetadataComponentId;
    });
    if (nodeToFind && nodeToFind.Length > 0) return;

    //if not find the children for it..
    let query = `SELECT MetadataComponentId, MetadataComponentName,MetadataComponentType ,RefMetadataComponentName, RefMetadataComponentType, RefMetadataComponentId,
        RefMetadataComponentNamespace 
        FROM MetadataComponentDependency 
        WHERE MetadataComponentId ='${record.RefMetadataComponentId}' AND MetadataComponentType != 'FlexiPage' ORDER BY MetadataComponentName, RefMetadataComponentType`;

    // The node has not been added, so lets find the children for it
    nodes.push({
      id: record.RefMetadataComponentId,
      // name: record.RefMetadataComponentName,
      // type: record.RefMetadataComponentType,
      data: {
        label: record.RefMetadataComponentName,
        id: record.RefMetadataComponentId,
        type: record.RefMetadataComponentType,
      },
      position: { x: index * 100 + 100, y: 0 },
    });

    const childRows = async () =>
      await connection.tooling.query(
        query,
        {
          autoFetch: true,
          maxFetch: 500000,
          // scanAll: true,  // Not applicable, returns an error :)
        },
        (err, result) => {
          if (err) {
            console.error(
              "Salesforce: getDependency: Error for objectName ",
              "MetadataComponentDependency",
              " error is ",
              err.message
            );
            return {
              size: 0,
              totalSize: 0,
              done: true,
              queryLocator: null,
              error: err.message,
              objectName: "MetadataComponentDependency",
              records: [],
            };
          }

          return result;
        }
      );

    // console.log("getChildDependencies: query", query, childRows.records);
    if (childRows.records?.length > 0) {
      result.push(childRows.records);
      getChildDependencies(childRows.records, nodes, result, connection);
    }
  });

  return { result, nodes };
}

/**
 * Retrieves usage information for a Salesforce metadata component.
 *
 * This function fetches details about the components that use a specified Salesforce metadata component identified by its `id`.
 * It accomplishes this by:
 *
 * 1. Establishing a connection using `getSalesforceConnection` (likely implemented elsewhere).
 * 2. Constructing a SOQL query to retrieve usage information from the `MetadataComponentDependency` object.
 *    - The query retrieves specific fields about the dependencies:
 *        - `MetadataComponentId`: ID of the dependent component (using the component)
 *        - `MetadataComponentName`: Name of the dependent component
 *        - `MetadataComponentType`: Type of the dependent component (e.g., CustomObject, ApexClass)
 *        - `RefMetadataComponentName`: Name of the referenced component (used by the component)
 *        - `RefMetadataComponentType`: Type of the referenced component
 *        - `RefMetadataComponentId`: ID of the referenced component
 *        - `RefMetadataComponentNamespace`: Namespace of the referenced component (if applicable)
 *    - The query excludes FlexiPages components and orders results by the dependent component name and the type of referenced component.
 * 3. Executing the SOQL query using `connection.tooling.query` and handling potential errors.
 * 4. If usage information is found (`rootRows.records.length > 0`):
 *    - Extracts the first record from the query results (`rootRecord`).
 *    - Creates a node object representing the root component and adds it to the `nodes` array.
 *    - Adds the usage information to the `result` array.
 *    - Recursively calls `getChildUsage` to explore deeper levels of the usage hierarchy.
 * 5. Processes the results to construct edges (connections) between components:
 *    - Iterates through the first level of usage information (`result[0]`).
 *    - For each usage record, creates an edge object and adds it to the `edges` array.
 *    - The edge object includes `id`, `source`, and `target` properties to represent the connection.
 * 6. Handles potential errors during the process and re-throws them.
 *
 * This function returns an object containing three properties:
 *  - `result`: An array containing usage information objects for each level.
 *  - `nodes`: An array of objects representing the nodes (components) in the usage graph.
 *  - `edges`: An array of objects representing the connections (edges) between components.
 *
 * @param {string} id The ID of the Salesforce metadata component to analyze usage for.
 * @param {NextRequest} req (optional) An optional NextRequest object used for connection and authentication (implementation likely resides elsewhere).
 * @returns {Promise<object>} A promise that resolves to an object containing the processed usage information or rejects with an error message.
 */

export async function getUsage(id: string, req?: NextRequest | undefined) {
  const nodes = <any>[];
  const edges = <any>[];
  const result = <any>[];

  try {
    const connection = await getSalesforceConnection(req);

    let query = `SELECT MetadataComponentId, MetadataComponentName,MetadataComponentType ,RefMetadataComponentName, RefMetadataComponentType, RefMetadataComponentId,
        RefMetadataComponentNamespace 
        FROM MetadataComponentDependency 
        WHERE RefMetadataComponentId ='${id}' AND MetadataComponentType != 'FlexiPage' ORDER BY MetadataComponentName, RefMetadataComponentType`;

    const rootRows = await connection.tooling.query(
      query,
      {
        autoFetch: true,
        maxFetch: 500000,
        // scanAll: true,  // Not applicable, returns an error :)
      },
      (err, result) => {
        if (err) {
          console.error(
            "Salesforce: getUsage: Error for objectName ",
            "MetadataComponentDependency",
            " error is ",
            err.message
          );
          return {
            size: 0,
            totalSize: 0,
            done: true,
            queryLocator: null,
            error: err.message,
            objectName: "MetadataComponentDependency",
            records: [],
          };
        }

        return result;
      }
    );
    // console.log("getDependencies: query", query, rootRows.records);

    if (rootRows && rootRows.records?.length > 0) {
      const rootRecord = <any>rootRows.records[0];
      nodes.push({
        id: rootRecord.RefMetadataComponentId,
        // name: rootRecord.RefMetadataComponentName,
        // type: rootRecord.RefMetadataComponentType,
        data: {
          label: rootRecord.RefMetadataComponentName,
          id: rootRecord.RefMetadataComponentId,
          type: rootRecord.RefMetadataComponentType,
        },
        position: { x: 0, y: 0 },
      });
      result.push(rootRows.records);

      await getChildUsage(rootRows.records, nodes, result, connection);

      // console.log("Salesforce: getDependency: Get Dependencies:", nodes, result);
    }
  } catch (error: any) {
    console.error("Salesforce: getDependency:", error.message);
    throw error;
  }

  // Loop through the results and create the edges aka connections
  // console.log("Results: ", result);

  result[0]?.map((edge, edgeIndex) => {
    // console.log("Salesforce: getDependency:Edge Push", edge, edgeIndex);
    edges.push({
      id: edge.MetadataComponentId + "->" + edge.RefMetadataComponentId,
      source: edge.MetadataComponentId,
      target: edge.RefMetadataComponentId,
    });
  });

  return { result, nodes, edges };
}

/**
 * Recursively retrieves child dependencies for a given set of Salesforce metadata components.
 *
 * This function iterates through an array of `currentRecord` objects, which represent retrieved dependency information.
 * For each record (dependency), it performs the following actions:
 *
 * 1. Checks if the dependent component (`record.RefMetadataComponentId`) has already been processed and exists in the `nodes` array.
 *    - If found, it skips processing to avoid redundant queries.
 * 2. If the component is not found in `nodes`:
 *    - Constructs a SOQL query to retrieve child dependencies for the referenced component (`record.RefMetadataComponentId`).
 *    - Creates a new node object representing the referenced component and adds it to the `nodes` array.
 *    - Executes the SOQL query using `connection.tooling.query` and handles potential errors.
 *    - If child dependencies are found (`childRows.records.length > 0`):
 *        - Adds the child dependency information to the `result` array.
 *        - Recursively calls `getChildDependencies` on the child dependencies to explore deeper levels of the dependency tree.
 *
 * This function facilitates a recursive exploration of the dependency hierarchy, starting from the provided `currentRecord` set.
 *
 * @param {array} currentRecord An array of dependency information objects representing the current level in the dependency tree.
 * @param {array} nodes An array of objects representing processed components (nodes) in the dependency graph.
 * @param {array} result An array that accumulates the dependency information for all levels.
 * @param {object} connection A Salesforce tooling connection object used for querying the dependency data.
 * @returns {Promise<object>} A promise that resolves to an object containing the updated `result` and `nodes` arrays.
 */
async function getChildUsage(
  currentRecord: MetaDataRecord[],
  nodes: Node[],
  result: MetaDataRecord[],
  connection: Connection
) {
  currentRecord.map((record, index) => {
    //seek if you have already checked the results for the component in nodes
    const nodeToFind = nodes.filter((node) => {
      node.id === record.RefMetadataComponentId;
    });
    if (nodeToFind && nodeToFind.Length > 0) return;

    //if not find the children for it..
    let query = `SELECT MetadataComponentId, MetadataComponentName,MetadataComponentType ,RefMetadataComponentName, RefMetadataComponentType, RefMetadataComponentId,
        RefMetadataComponentNamespace 
        FROM MetadataComponentDependency 
        WHERE RefMetadataComponentId ='${record.MetadataComponentId}' AND MetadataComponentType != 'FlexiPage' ORDER BY MetadataComponentName, RefMetadataComponentType`;

    // The node has not been added, so lets find the children for it
    nodes.push({
      id: record.MetadataComponentId,
      // name: record.MetadataComponentName,
      // type: record.MetadataComponentType,
      data: {
        label: record.MetadataComponentName,
        id: record.MetadataComponentId,
        type: record.MetadataComponentType,
      },
      position: { x: index * 100 + 100, y: 0 },
    });

    const childRows = async () =>
      await connection.tooling.query(
        query,
        {
          autoFetch: true,
          maxFetch: 500000,
          // scanAll: true,  // Not applicable, returns an error :)
        },
        (err, result) => {
          if (err) {
            console.error(
              "Salesforce: getDependency: Error for objectName ",
              "MetadataComponentDependency",
              " error is ",
              err.message
            );
            return {
              size: 0,
              totalSize: 0,
              done: true,
              queryLocator: null,
              error: err.message,
              objectName: "MetadataComponentDependency",
              records: [],
            };
          }

          return result;
        }
      );

    // console.log("getChildDependencies: query", query, childRows.records);
    if (childRows.records?.length > 0) {
      result.push(childRows.records);
      getChildDependencies(childRows.records, nodes, result, connection);
    }
  });

  return { result, nodes };
}

/**
 * Retrieves a list of Apex triggers associated with a specific Salesforce object.
 *
 * This asynchronous function performs the following steps:
 * 1. Retrieves metadata for the specified object using its ID and type.
 * 2. Constructs a SOQL query to fetch ApexTrigger records related to the object. - Removed
 * 3. Executes the query using a Salesforce connection.
 * 4. Returns the query results as a JSON string.
 *
 * @param {Object} objectInfo - An object containing information about the Salesforce object.
 * @param {string} objectInfo.Id - The ID of the Salesforce object.
 * @param {Object} objectInfo.attributes - Attributes of the Salesforce object.
 * @param {string} objectInfo.attributes.type - The type of the Salesforce object.
 *
 * @returns {Promise<string>} A promise that resolves to a JSON string containing the list of ApexTriggers.
 * @throws {Error} If there's an error during the Salesforce query execution.
 */
export async function getTriggerList(objectInfo: any) {
  console.log("getTriggerList: params", objectInfo);

  // getting the fullName from metadata
  const tmpMetadata = await getMetaDataById(
    objectInfo.attributes.type,
    objectInfo.Id
  );

  const metadata = JSON.parse(tmpMetadata);

  // console.log("getTriggerList: metadata:", tmpMetadata);

  let query = `SELECT Name,
                      Id,
                      Status,
                      TableEnumOrId,
                      UsageAfterDelete,
                      UsageAfterInsert,
                      UsageAfterUndelete,
                      UsageAfterUpdate,
                      UsageBeforeInsert,
                      UsageBeforeDelete,
                      UsageBeforeUpdate
              FROM ApexTrigger
              WHERE TableEnumOrId ='${metadata.data?.fullName}'
              ORDER BY Name`;

  let response = {};

  try {
    const connection = await getSalesforceConnection();

    response = await connection.tooling.query(query, (err, result) => {
      if (err) throw err;
      return result;
    });
  } catch (error) {
    console.error(
      "Salesforce: getTriggerList: Error",
      error.message,
      "while processing ",
      query.type,
      " query:",
      query.query
    );
    return;
  }

  // const response = getTopic("apexTriggersForObject", {
  //   id: metadata.data?.fullName,
  // });
  console.log("getTriggerList: response", response);
  return JSON.stringify(response);
}

/**
 * Retrieves information about the relationships of a Salesforce object.
 *
 * @async
 * @param {object} objectInfo - An object containing information about the Salesforce object. This object should have an `Id` property.
 * @returns {Promise<{result: any[], nodes: Node[], edges: Edge[]}>} - A Promise that resolves to an object containing:
 *  - `result`: An array of relationship records retrieved from Salesforce.
 *  - `nodes`: An array of nodes representing the objects and fields involved in the relationships.
 *  - `edges`: An array of edges representing the relationships between the nodes.
 *
 * @throws {Error} - Throws an error if there's an issue retrieving the relationship information from Salesforce.
 */
export async function getObjectRelationships(
  objectInfo: any
): Promise<{ result: any[]; nodes: Node[]; edges: Edge[] }> {
  // console.log("getObjectRelationships: params", objectInfo);

  const nodes = <Node[]>[];
  const edges = <Edge[]>[];

  let result;
  try {
    result = await getTopic("objectRelationships", { id: objectInfo.Id });
  } catch (error) {
    console.error("Salesforce: getObjectRelationships: Error", error.message);
    throw error;
  }
  let response = result[0];

  console.log("getObjectRelationships: response", JSON.stringify(response));

  const NODE_HEIGHT = 20;
  const NODE_WIDTH = 250;
  const NODE_PADDING = 5;

  // Extract the nodes and edges from rows
  if (response && response.records) {
    //Add the holding Node
    // The height of the holding node will be related to count of records that it has
    // const parentHeight = (
    nodes.push({
      id: objectInfo.Id,
      data: { label: getObjectName(objectInfo) },
      position: { x: 0, y: 0 },
      connectable: false,
      style: {
        // backgroundColor: "rgba(0, 0, 255, 0.4)",
        height: (response.records.length + 1) * NODE_HEIGHT + NODE_PADDING * 2,
        width: NODE_WIDTH + NODE_PADDING * 2,
        fontWeight: "600",
      },
    });

    response.records.map((item, itemIndex) => {
      // console.log(
      //   "Y Position  ",
      //   (itemIndex + 1) * NODE_HEIGHT + NODE_PADDING,
      //   " for :" + item.DeveloperName
      // );
      nodes.push({
        id: item.DeveloperName + "-Source",
        data: { label: item.DeveloperName, source: true, target: false },
        position: {
          x: NODE_PADDING,
          y: (itemIndex + 1) * NODE_HEIGHT + NODE_PADDING,
        },
        parentId: objectInfo.Id,
        extent: "parent",
        type: "Field",
        style: {
          height: NODE_HEIGHT,
          // width: NODE_WIDTH - NODE_PADDING * 2,
          width: 200,
          fontSize: "50%",
        },
      });
      if (item.RelationshipName && item.ReferenceTo.referenceTo) {
        nodes.push({
          //id: (item.DataType + item.QualifiedApiName) as string, // Get an Id for destination
          id: item.ReferenceTo.referenceTo[0] + "-Target",
          data: {
            label: item.ReferenceTo.referenceTo[0],
            source: false,
            target: true,
          },
          type: "Field",
          // sourcePosition: Position.Right,
          // targetPosition: Position.Left,
          position: { x: 600, y: (itemIndex + 1) * NODE_HEIGHT },
          style: { height: NODE_HEIGHT, width: NODE_WIDTH - NODE_PADDING },
        });

        edges.push({
          id: item.QualifiedApiName,
          source: item.DeveloperName + "-Source",
          target: item.ReferenceTo.referenceTo[0] + "-Target",
          label: item.RelationshipName,
          labelStyle: { fontSize: "50%" },
          labelBgStyle: { opacity: 1 },
          // labelShowBg: false,
          //target: (item.DataType + item.QualifiedApiName) as string, // Get an Id for destination
        });
      }
    });
  }

  return { result: response.records, nodes, edges };
}

/**
 * Scans Apex code for quality and security issues using the Salesforce Scanner.
 *
 * This asynchronous function performs the following steps:
 * 1. Validates the input code body.
 * 2. Creates a temporary directory and file for the Apex code.
 * 3. Writes the code to the temporary file.
 * 4. Executes the Salesforce Scanner CLI command on the temporary file.
 * 5. Reads the scanner output from a JSON file.
 * 6. Cleans up temporary files.
 * 7. Parses and returns the scan results.
 *
 * @param {string} codeBody - The Apex code to be scanned.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - If no code body is provided: { engine: "No Code body found", violations: [] }
 *   - If code is scanned successfully: The parsed JSON result from the Salesforce Scanner
 *
 * @throws {Error} If there's an error during file operations or command execution.
 *
 * @example
 * const result = await scanApexCode("public class MyClass { ... }");
 * console.log(result);
 */
export async function scanApexCode(codeBody: string) {
  if (!codeBody || codeBody == "" || codeBody === "(hidden")
    return { engine: "No Code body found", violations: [] };

  temp.track();
  // create a temp file and run sfdx scanner
  const tempDir = await temp.mkdir("sfdx-scanner");
  const tempFile = join(tempDir, "scanner-target.cls");
  const outFile = join(tempDir, "scanner-output.json");
  await fs.writeFile(tempFile, codeBody);
  execSync(
    `npx sfdx scanner:run --target ${tempFile} --format json --outfile ${outFile}`,
    {
      encoding: "utf-8",
    }
  );

  const fileContent = await fs.readFile(outFile, "utf-8");
  await temp.cleanup();
  const result = JSON.parse(fileContent);
  console.log("Salesforce: scanApexCode", JSON.stringify(result));
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Retrieves metadata for a Salesforce custom object.
 *
 * This function fetches the metadata definition for a custom object specified by its name (`objectName`).
 * It establishes a connection using `getSalesforceConnection` (presumably implemented elsewhere) and uses
 * the `connection.metadata.list` method to read the metadata for the specified object type ("CustomObject, ApexClass, ApexTrigger")
 * and object name.
 *
 * @param objectType The Type of the Salesforce object for which to retrieve metadata
 * @param objectName The name of the Salesforce custom object for which to retrieve metadata
 * @param req Optional NextRequest object (for connection/authentication purposes)
 * @returns An object containing the retrieved metadata for the  object, or throws an error if unsuccessful.
 */
export async function getMetaDataByNameDepracated(
  objectType: string,
  objectName: string,
  req?: NextRequest
) {
  try {
    const connection = await getSalesforceConnection(req);
    const data = await connection.metadata.list(
      { type: objectType }
      // objectName
    );

    const extendedData = await connection.metadata.read(
      objectType,
      data[0].fullName
    );

    // console.log("Salesforce: Extended Data", extendedData);

    const result = data
      ? data.filter((item) => item.fullName === objectName)
      : {};
    // console.log("Salesforce: GetMetadata: result", result);
    return JSON.stringify(result);

    // const data = await connection.metadata.read("ApexClass", objectName);
    // const data = await connection.metadata.describe("60.0");
  } catch (error: any) {
    console.error("Salesforce: getMetaDatabyName:", objectName, error.message);
    throw error;
  }
}

/**
 * Retrieves metadata for a Salesforce custom object.
 *
 * This function fetches the metadata definition for a custom object specified by its Id (`Id`).
 * It establishes a connection using `getSalesforceConnection`  and uses
 * the `connection.metadata.read` method to read the metadata for the specified object type ("CustomObject, ApexClass etc")
 * and objectId.
 *
 * @param objectType The Type of the Salesforce object for which to retrieve metadata
 * @param objectId The name of the Salesforce custom object for which to retrieve metadata
 * @param req Optional NextRequest object (for connection/authentication purposes)
 * @returns An object containing the retrieved metadata for the  object, or throws an error if unsuccessful.
 */
export async function getMetaDataById(
  objectType: string,
  objectId: string,
  req?: NextRequest
) {
  if (metaDataSupportedObjectTypes.includes(objectType)) {
    try {
      const connection = await getSalesforceConnection(req);

      const resMetadata = await connection.metadata.list(
        { type: objectType }
        // objectName
      );

      // console.log("Salesforce: getMetaDataById: params", objectType, objectId);
      // console.log("Salesforce: getMetaDataById: resMetadata", resMetadata);

      const filteredResult = resMetadata
        ? resMetadata.filter((item) => item.id === objectId)
        : [{}];
      let data;
      // console.log(
      //   "Salesforce: getMetaDataById: filteredResult",
      //   filteredResult
      // );

      let extendedData = {};
      if (filteredResult.length > 0) {
        data = filteredResult[0];
        if (filteredResult[0].fullName) {
          try {
            // console.log("Salesforce: Extended Data", objectType, data[0].fullName);
            extendedData = await connection.metadata.read(
              objectType,
              filteredResult[0].fullName
            );
            // console.log("Salesforce: Extended Data", JSON.stringify(extendedData));
          } catch (err) {
            console.error(
              "Salesforce: ExtendedData",
              objectType,
              resMetadata[0].fullName
            );
          }
        }
        data = { data, ...extendedData };
      } else {
        data = [{ ...extendedData }];
      }

      return JSON.stringify(data);
    } catch (error: any) {
      console.error("Salesforce: getMetaDataById:", objectId, error.message);
      throw error;
    }
  }

  if (objectType === "Report") {
    // const data = await getMetaDataforReports(objectId, req);
    try {
      const data = await getTopic("ReportMetaData", { id: objectId }, req);
      return await JSON.stringify(data);
    } catch (err: any) {
      // return JSON.stringify({ error: err.message });
      console.error("Salesforce: getMetaDataById:", objectId, err.message);
      throw err;
    }
  } else {
    return JSON.stringify({ error: "Unsupported MetadataType :" + objectType });
  }
}

/**
 * Retrieves metadata for a Salesforce report.
 *
 * This function fetches the metadata description for a report specified by its Id.
 * It establishes a connection using `getSalesforceConnection` and uses
 * the `connection.analytics.report(objectId).describe()` method to retrieve
 * the metadata for the specified report.
 *
 * THIS FUNCTION RETURNS A PERMISSION ISSUE. TODO: NEEDS INVESTIGATION
 *
 * @param objectId The Id of the Salesforce report for which to retrieve metadata
 * @param req Optional NextRequest object (for connection/authentication purposes)
 * @returns A JSON string containing the retrieved metadata for the report,
 *          or throws an error if unsuccessful
 * @throws Will throw an error if the Salesforce connection fails or if the report
 *         metadata cannot be retrieved
 */
export async function getMetaDataforReportsDeprecated(
  objectId: string,
  req?: NextRequest
) {
  try {
    const connection = await getSalesforceConnection(req);
    // const data = await (await connection.analytics.report(objectId)).describe();
    const apiHeader =
      "/services/data/v61.0/analytics/reports/" + objectId + "/describe";
    // console.log("Salesforce: getMetaDataforReports: requestURL", apiHeader);
    const data = await connection.request(
      apiHeader,
      undefined,
      (error, response) => {
        if (error) {
          console.log(
            "getMetaDataforReports error message",
            JSON.stringify(error)
          );
          return { error };
          // throw error;
        }
        return response;
      }
    );

    // connection.request(apiHeader, undefined, (error, response) => {
    //   if (error) throw error;
    //   return response;
    // });

    // console.log(
    //   "Salesforce: getMetaDataforReports: params",
    //   "Report",
    //   objectId
    // );
    // console.log("Salesforce: getMetaDataforReports: data", data);

    // console.log("Salesforce: getMetaDataById: Result", data);

    // return JSON.stringify(data);
    return data;
  } catch (error: any) {
    console.error(
      "Salesforce: getMetaDataforReports:",
      objectId,
      error.message
    );
    throw error;
  }
}

/**
 * Retrieves Salesforce event logs, optionally filtered by event type.
 *
 * This function fetches event logs from Salesforce, with the ability to filter by a specific event type.
 * It uses the Salesforce connection to query the EventLogFile object and retrieve log details.
 * For each log entry, it also fetches the associated log file content.
 *
 * @param eventType Optional parameter to filter logs by a specific Salesforce event type
 * @param req Optional NextRequest object (for connection/authentication purposes)
 * @returns An object containing an array of log records, the total size, and the object name
 * @throws Will throw an error if the Salesforce connection fails or if log retrieval encounters issues
 */
export async function getEventLogs(
  eventType?: SalesforceEventType | null,
  req?: NextRequest
) {
  try {
    const connection = await getSalesforceConnection(req);
    // If there is an eventType specified, add a where Clause to the Query
    let condition =
      eventType && eventType != null && eventType != ""
        ? ` WHERE EventType = '${eventType}'`
        : ``;

    let query = `SELECT EventType, 
                          Interval,
                          LogDate,
                          LogFile,
                          LogFileContentType,
                          LogFileFieldNames,
                          LogFileFieldTypes,
                          LogFileLength,
                          Sequence
                    FROM EventLogFile ${condition} ORDER BY LogDate, Sequence DESC LIMIT 25`;

    let result = { records: [], totalSize: 0, objectName: "EventLogFile" };
    let response = await queryAll(query, connection);
    result.records = [];

    //loop through the results and get the log's

    for (const log of response) {
      const logFile = await connection.request(
        log.LogFile,
        undefined,
        (error, response) => {
          if (error) throw error;
          return response;
        }
      );
      // const logFile = await processRequest(log.LogFile);
      result.records.push(...logFile);
    }
    result.totalSize = result.records.length;
    return result;
  } catch (error) {
    console.error("Salesforce: getEventLogs:", eventType, error.message);
    throw error;
  }
}

/**
 * Retrieves a list of all objects available in the Salesforce organization.
 *
 * @async
 * @param {NextRequest?} req - An optional Next.js request object. If provided, it will be used to obtain the Salesforce connection.
 * @returns {Promise<any>} - A Promise that resolves to an array of object descriptions.
 *
 * @throws {Error} - Throws an error if there's an issue connecting to Salesforce or retrieving the object descriptions.
 */
export async function getAllsObjects(req?: NextRequest) {
  try {
    const connection = await getSalesforceConnection(req);
    return await connection.describeGlobal();
  } catch (error) {
    console.error("Salesforce: getAllsObjects:", error.message);
    throw error;
  }
}

//This will help us to get the count of row of the selected standard object
export async function getFieldUsageRowCount(
  selectedObject: String,
  req?: NextRequest
) {
  let query = "SELECT count() FROM " + selectedObject;

  let response = {};

  try {
    const connection = await getSalesforceConnection(req);

    response = await connection.query(query, (err: any, result: any) => {
      if (err) throw err;
      return result;
    });
  } catch (error: any) {
    console.error(
      "Salesforce: getFieldUsageRowCount: Error",
      error.message,
      "while processing ",
      " query:",
      query
    );
    return;
  }
  return response;
}

//@deprecated This will help us to get the details of the selected Custom Fields from where we can retrieve data like - is it a unique field, required field or read-only field etc.
export async function getFieldUsageForCustomFields(
  selectedObject: string,
  req?: NextRequest
): Promise<MetadataInfo> {
  try {
    const connection = await getSalesforceConnection(req);
    const apiHeader =
      "/services/data/v52.0/tooling/sobjects/CustomField/" + selectedObject;
    const data = await connection.request(
      apiHeader,
      undefined,
      (error, response) => {
        if (error) {
          console.log(
            "Salesforce: getFieldUsageForCustomFields error message",
            JSON.stringify(error)
          );
          return { error };
          // throw error;
        }
        return response;
      }
    );
    return data;
  } catch (error: any) {
    console.error(
      "Salesforce: getCustomFieldDetails:",
      objectId,
      error.message
    );
    throw error;
  }
}

/**
 * Retrieves detailed information about the specified object's fields in the Salesforce organization.
 *
 * @async
 * @param {string} selectedObject - The API name of the Salesforce object to retrieve field details for.
 * @param {NextRequest?} req - An optional Next.js request object. If provided, it will be used to obtain the Salesforce connection.
 * @returns {Promise<MetadataInfo>} - A Promise that resolves to an object containing the field details.
 *
 * @throws {Error} - Throws an error if there's an issue connecting to Salesforce or retrieving the field details.
 */
export async function getObjectFieldDetails(
  selectedObject: string,
  req?: NextRequest
): Promise<MetadataInfo> {
  try {
    const connection = await getSalesforceConnection(req);
    const apiHeader =
      "/services/data/v52.0/sobjects/" + selectedObject + "/describe";
    const data = await connection.request(
      apiHeader,
      undefined,
      (error, response) => {
        if (error) {
          console.log(
            "Salesforce: getMetaDataforReports error message",
            JSON.stringify(error)
          );
          return { error };
          // throw error;
        }
        return response;
      }
    );
    return data;
  } catch (error: any) {
    console.error("Salesforce: getObjectFieldDetails:", error.message);
    throw error;
  }
}

/**
 * Retrieves the description of a Salesforce object or metadata component.
 *
 * @async
 * @param {string} objectType - The type of object to retrieve the description for. Can be either "sobject" or "metadata".
 * @param {string?} objectId - The ID of the object or metadata component to retrieve the description for. Required if objectType is "sobject".
 * @param {NextRequest?} req - An optional Next.js request object. If provided, it will be used to obtain the Salesforce connection.
 * @returns {Promise<any>} - A Promise that resolves to the object or metadata component description.
 *
 * @throws {Error} - Throws an error if there's an issue connecting to Salesforce or retrieving the description.
 */
export async function getObjectDescription(
  objectType: string = "sobject",
  objectId?: string,
  req?: NextRequest
) {
  // console.log("Salesforce: getObjectDescription:", objectType, objectId);

  try {
    const connection = await getSalesforceConnection(req);
    return objectType === "sobject"
      ? await connection.describe(objectId)
      : // : await connection.sobject(objectId).describe();
        await getMetaDataById(objectId);

    // return await connection.describe(objectId ? objectId : "");
  } catch (error) {
    console.error("Salesforce: getObjectDescription:", error.message);
    throw error;
  }
}

/**
 * Retrieves information about all Apex classes, triggers, Aura bundles, Visualforce pages, and Lightning components in the Salesforce organization.
 *
 * @async
 * @returns {Promise<any[]>} - A Promise that resolves to an array of objects containing details about each metadata component.
 *
 * @throws {Error} - Throws an error if there's an issue retrieving the metadata information.
 */
export async function getAllObjects() {
  try {
    const topics = [
      "ApexClass",
      "apexTriggers",
      "auraBundles",
      "visualForcePages",
      "lightningComponents",
    ];

    // const topics = ["ApexClass"];

    const data = [];

    const result = Promise.all(
      topics.map(async (item) => await getTopic(item))
    );

    (await result).forEach((processResult) => {
      processResult.forEach((item) => {
        // console.log(item.records.length);
        item.records.map((element) => {
          console.log("Element", element);
          const info = {
            Id: element.Id,
            Name: element.Name || element.DeveloperName,
            attributes: element.attributes,
            type: item.objectName,
            complexity: element.complexity,
            codeSize: element.LengthWithoutComments,
          };
          console.log("Info", info);
          data.push(info);
        });
      });
    });
    // console.log("getAllObjects", data);
    return data;
  } catch (error) {
    console.error("Salesforce: getObjectsbyPackage:", error.message);
    throw error;
  }
}

export async function getDomainMapping() {
  // get the object mapping information

  try {
    // let fileContent = await fs.readFile(
    //   process.cwd() + "/src/config/VeevaObjectMapping.config.json", // TODO: Move it to .env?
    //   "utf-8"
    // );
    // let objectMapping = await JSON.parse(fileContent);

    // console.log("ObjectMapping", objectMapping.ModuleObjects);

    const data = await getAllObjects();
    const result = [];

    // construct the mapping objects

    // const moduleNames = objectMapping.ModuleObjects.map(
    //   (item) => item["Module"]
    // );

    const moduleNames = VeevaObjectMapping.map((item) => item.Module);

    const uniqueModuleNames = Array.from(new Set(moduleNames)).filter(
      (name) => name !== ""
    );

    // const UnMapped = { module: "Unmapped", Objects: [] };

    // now for each module, iterate through the objects and construct the object list, with the structure of ID, Name, Type
    uniqueModuleNames.forEach((moduleName) => {
      const Module = { Module: moduleName, Objects: [] };
      // objectMapping.ModuleObjects.filter(
      VeevaObjectMapping.filter((item) => item["Module"] === moduleName)[0][
        "Objects"
      ].forEach((object) => {
        // Find if the Object is there in the data, and if present add it to the list
        const objects = data.filter((item) => item.Name === moduleName);
        if (objects && objects.length > 0) {
          Module.Objects.push({
            Id: objects[0].Id,
            Name: object[0].Name,
            attributes: objects[0].attributes,
            type: objects[0].attributes.type,
            complexity: objects[0].complexity,
            CodeSize: objects[0].CodeSize,
          });
        } else {
          Module.Objects.push({
            Id: moduleName + "-" + object,
            Name: object,
            attributes: {},
            type: "UNDETERMINED",
            complexity: "UNDETERMINED",
            codeSize: 0,
          });
        }
      });
      result.push(Module);
    });

    // if Items are not in the mapped list, then add it in the unmapped list
    // We are pretty sure that there will be an item in the result, as there will be an entry in the config for this
    const UnMapped = result.filter((item) => item.Module === "unmapped")[0];
    UnMapped.isStatic = true;

    data.forEach((item) => {
      // console.log(
      //   "Item",
      //   item,
      //   objectMapping.ModuleObjects.find((item) =>
      //     item["Objects"].includes(item.Name)
      //   )
      // );
      if (
        // !objectMapping.ModuleObjects.find((item) =>
        !VeevaObjectMapping.find((item) => item["Objects"].includes(item.Name))
      ) {
        // console.log("Pushing Item to Unmapped", item);
        UnMapped.Objects.push({
          Id: item.Id,
          Name: item.Name,
          attributes: item.attributes,
          type: item.attributes.type,
          complexity: item.complexity,
          codeSize: item.codeSize,
        });
      }
    });

    // result.push(UnMapped);

    return { headers: uniqueModuleNames, details: result };
  } catch (error) {
    console.error("Salesforce: getDomainMapping:", error.message);
    throw error;
  }
}

/**
 * Calculates the complexity for each object in an array based on LengthWithoutcomments property.
 *
 * @param {object[]} objectArray - An array of objects containing Id and LengthWithoutcomments properties.
 * @returns {object[]} - A new array with the original objects and an added "complexity" property.
 */
function calculateComplexity(objectArray) {
  return objectArray.map((item) => {
    const length = item.LengthWithoutcomments;
    const complexity =
      length > 0 && length < 200
        ? "Simple"
        : length > 500
        ? "Complex"
        : "Medium";
    return { ...item, complexity }; // Spread operator to create a new object
  });
}
