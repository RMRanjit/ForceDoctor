export type PerformanceItem = {
  key: string;
  header: string;
  description: string;
  metrics: Array<metric> | Array<string>;
  active?: boolean;
};

export type metric = {
  name: string;
  formula: string;
};

export const PerformanceItems: PerformanceItem[] = [
  {
    key: "RUN_TIME",
    header: "Run Time",
    description:
      "The amount of time that the request took in milliseconds. Requests with a value over five seconds are considered long-running requests for the purposes of the Concurrent Long-Running Apex Limit.",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "RUN_TIME",
    header: "Run Time",
    description:
      "The amount of time that the request took in milliseconds. Requests with a value over five seconds are considered long-running requests for the purposes of the Concurrent Long-Running Apex Limit.",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "CPU_TIME",
    header: "CPU Time",
    description:
      "The CPU time in milliseconds used to complete the request. This field indicates the amount of activity taking place in the app server layer.",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "DB_TOTAL_TIME",
    header: "Database Time",
    description:
      "Time (in milliseconds) spent waiting for database processing in aggregate for all operations in the request. Compare this field to CPU_TIME to determine whether performance issues are occurring in the database layer or in your own code.",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "ROW_COUNT",
    header: "Row Count",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "NUMBER_EXCEPTION_FILTERS",
    header: "Exception Filters",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "NUMBER_COLUMNS",
    header: "Columns",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "AVERAGE_ROW_SIZE",
    header: "Row Size",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "DB_BLOCKS",
    header: "DB Blocks",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "DB_CPU_TIME",
    header: "Database CPU",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "NUMBER_BUCKETS",
    header: "Buckets",
    description: "Description to be updated",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "EXEC_TIME",
    header: "Execution",
    description: "The end-to-end execution time (in milliseconds).",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "CALLOUT_TIME",
    header: "Callout",
    description: "Time spent waiting on webservice callouts, in milliseconds.",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "NUMBER_SOQL_QUERIES",
    header: "SOQL ",
    description:
      "The number of SOQL queries that were executed during the event. This value is the aggregate across all namespaces, and can exceed the per-namespace limits. For test executions, the aggregate total value across all test methods executed in the request is used.",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "FLOW_LOAD_TIME",
    header: "LOAD TIME ",
    description: "To be determined",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "TOTAL_EXECUTION_TIME",
    header: "Execution Time ",
    description: "To be determined",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "NUMBER_OF_INTERVIEWS",
    header: "Interviews",
    description: "To be determined",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "NUMBER_OF_ERRORS",
    header: "Errors",
    description: "To be determined",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "DURATION",
    header: "Duration",
    description: "To be determined",
    metrics: ["Max", "Min", "Avg"],
    active: true,
  },
  {
    key: "IS_LONG_RUNNING_REQUEST",
    header: "Long Running",
    description:
      "Indicates whether the request is counted against your org’s concurrent long-running Apex request limit ",
    metrics: [
      { name: "Count", formula: "item.IS_LONG_RUNNING_REQUEST == true" },
    ],
    active: true,
  },
  {
    key: "COUNTS_AGAINST_API_LIMIT",
    header: "API Limit impact",
    description: "Whether the request counted against the API limit",
    metrics: [
      { name: "Count", formula: "item.COUNTS_AGAINST_API_LIMIT == true" },
    ],
    active: true,
  },
];
