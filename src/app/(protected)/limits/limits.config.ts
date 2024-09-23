export interface LimitConfigItem {
  header: string;
  topic: string;
  group?: string;
  body: string;
  displayValue: string;
  loaded: boolean;
}

export const limitsConfig: LimitConfigItem[] = [
  {
    header: "Analytics External DataSize",
    topic: "AnalyticsExternalDataSizeMB",
    group: "Analytics",
    body: "Maximum amount of external data in bytes that can be uploaded daily via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Concurrent Async GetReport Instances",
    topic: "ConcurrentAsyncGetReportInstances",
    group: "Analytics",
    body: "Concurrent REST API requests for results of asynchronous report runs",
    displayValue: "[UsedPercentage]",
    loaded: true,
  },
  {
    header: "Concurrent Einstein DataInsights Story Creation",
    topic: "ConcurrentEinsteinDataInsightsStoryCreation",
    group: "Analytics",
    body: "Concurrent Einstein Discovery data insights story creation via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Concurrent Einstein Discovery StoryCreation",
    topic: "ConcurrentEinsteinDiscoveryStoryCreation",
    group: "Analytics",
    body: "Concurrent Einstein Discovery story creation via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Concurrent Sync Report Runs",
    topic: "ConcurrentSyncReportRuns",
    group: "Analytics",
    body: "Concurrent synchronous report runs via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Async Report Runs",
    topic: "HourlyAsyncReportRuns",
    group: "Analytics",
    body: "Hourly asynchronous report runs via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Sync Report Runs",
    topic: "HourlySyncReportRuns",
    group: "Analytics",
    body: "Hourly synchronous report runs via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Dashboard Refreshes",
    topic: "HourlyDashboardRefreshes",
    group: "Analytics",
    body: "Hourly dashboard refreshes via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Dashboard Results",
    topic: "HourlyDashboardResults",
    group: "Analytics",
    body: "Hourly REST API requests for dashboard results",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Dashboard Statuses",
    topic: "HourlyDashboardStatuses",
    group: "Analytics",
    body: "Hourly dashboard status requests via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Analytics Dataflow JobExecutions",
    topic: "DailyAnalyticsDataflowJobExecutions",
    group: "Analytics",
    body: "Daily analytics dataflow job executions via REST API",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Analytics Uploaded Files Size",
    topic: "DailyAnalyticsUploadedFilesSizeMB",
    group: "Analytics",
    body: "Daily cumulative size of analytics files uploaded, in MB",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Einstein Data Insights Story Creation",
    topic: "DailyEinsteinDataInsightsStoryCreation",
    group: "Analytics",
    body: "Daily Einstein Discovery data insight stores created via REST API",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Einstein Discovery Predict API Calls",
    topic: "DailyEinsteinDiscoveryPredictAPICalls",
    group: "Analytics",
    body: "Daily cumulative number of predicted Einstein Discovery REST API requests",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Einstein Discovery Predictions By CDC",
    topic: "DailyEinsteinDiscoveryPredictionsByCDC",
    group: "Analytics",
    body: "Daily cumulative number of predicted Einstein Discovery change data capture add-ons created",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Einstein Discovery Optimization JobRuns",
    topic: "DailyEinsteinDiscoveryOptimizationJobRuns",
    group: "Analytics",
    body: "Daily cumulative number of Einstein Discovery optimization job runs",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Einstein Discovery Story Creation",
    topic: "DailyEinsteinDiscoveryStoryCreation",
    group: "Analytics",
    body: "Daily cumulative number of Einstein Discovery stories created via REST API",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Monthly Einstein Discovery Story Creation",
    topic: "MonthlyEinsteinDiscoveryStoryCreation",
    group: "Analytics",
    body: "Monthly cumulative number of Einstein Discovery stories created via REST API",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Mass Email",
    topic: "MassEmail",
    group: "Email",
    body: "Daily number of mass emails that are sent to external email addresses via Apex or APIs",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Single Email",
    topic: "SingleEmail",
    group: "Email",
    body: "Daily number of single emails that are sent to external email addresses",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Create Custom Permission sets",
    topic: "PermissionSets",
    group: "Lightning Platform REST and Bulk APIs",
    body: "Maximum number of allowed custom permission sets. This limit is available for API version 41.0 and later.",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Api Requests",
    topic: "DailyApiRequests",
    group: "Lightning Platform REST and Bulk APIs",
    body: "Daily API calls",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Async Apex Executions",
    topic: "DailyAsyncApexExecutions",
    group: "Lightning Platform REST and Bulk APIs",
    body: "Daily number of asynchronous Apex method executions, which includes batch Apex, future methods, Queueable Apex, and scheduled Apex",
    displayValue: "Used",
    loaded: true,
  },
  // {
  //   header: "Daily Async Apex Tests",
  //   topic: "DailyAsyncApexTests",
  //   group: "Lightning Platform REST and Bulk APIs",
  //   body: "Daily number of asynchronous Apex test executions. This limit is available in API version 56.0 and later.",
  //   displayValue: "Used",
  //   loaded: true,
  // },
  {
    header: "Daily Bulk Api Batches",
    topic: "DailyBulkApiBatches",
    group: "Lightning Platform REST and Bulk APIs",
    body: "In Bulk API, batches are used by both ingest and query operations. In Bulk API 2.0, batches are used only by ingest operations.",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  // {
  //   header: "Daily Bulk Api Requests",
  //   topic: "DailyBulkApiRequests",
  //   group: "Lightning Platform REST and Bulk APIs",
  //   body: "In Bulk API, batches are used by both ingest and query operations. In Bulk API 2.0, batches are used only by ingest operations.",
  //   displayValue: "UsedPercentage",
  //   loaded: true,
  // },
  {
    header: "Daily Bulk V2 Query File Storage",
    topic: "DailyBulkV2QueryFileStorageMB",
    group: "Lightning Platform REST and Bulk APIs",
    body: "Daily storage for queries in Bulk API 2.0 (measured in MB). This limit is available in API version 47.0 and later.",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Bulk V2 QueryJobs",
    topic: "DailyBulkV2QueryJobs",
    group: "Lightning Platform REST and Bulk APIs",
    body: "Daily number of query jobs in Bulk API 2.0. This limit is available in API version 47.0 and later.",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Permission Sets",
    topic: "PermissionSets",
    group: "Lightning Platform REST and Bulk APIs",
    body: 'Maximum number of allowed permission sets. Corresponds to the "Permission sets: maximum (created and added as part of an installed managed AppExchange package)" feature allocation. This limit is available in API version 41.0 and later.',
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Published Platform Events",
    topic: "HourlyPublishedPlatformEvents",
    group: "Platform Events",
    body: "High-volume platform event notifications published per hour",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Published Standard Volume Platform ​Events",
    topic: "HourlyPublishedStandardVolumePlatform​Event",
    group: "Platform Events",
    body: "Standard-volume platform event notifications published per hour",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Standard Volume Platform Events",
    topic: "DailyStandardVolumePlatformEvents",
    group: "Platform Events and Change Data Capture",
    body: "Daily standard-volume platform event notifications delivered to CometD clients",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Delivered PlatformEvents",
    topic: "DailyDeliveredPlatformEvents",
    group: "Platform Events and Change Data Capture",
    body: "Org Without Add-On License: Daily Usage and Default Allocation",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  // {
  //   header: "Monthly Platform Events",
  //   topic: "MonthlyPlatformEvents",
  //   group: "Platform Events and Change Data Capture",
  //   body: "Org With Add-On License: Monthly Event Delivery Usage",
  //   displayValue: "UsedPercentage",
  //   loaded: true,
  // },
  {
    header: "Monthly Platform Events Usage Entitlement",
    topic: "MonthlyPlatformEventsUsageEntitlement",
    group: "Platform Events and Change Data Capture",
    body: "Org With Add-On License: Monthly Usage-Based Entitlement",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Private Connect Outbound Callout Hourly Limit",
    topic: "PrivateConnectOutboundCalloutHourlyLimitMB",
    group: "Private Connect",
    body: "Maximum amount of data in bytes that can be transferred per hour via outbound private connections.",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Long Term Id Mapping",
    topic: "HourlyLongTermIdMapping",
    group: "Salesforce Connect",
    body: "Hourly new long-term external record ID mappings",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly OData Callout",
    topic: "HourlyODataCallout",
    group: "Salesforce Connect",
    body: "Hourly OData callouts",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly Short Term Id Mapping",
    topic: "HourlyShortTermIdMapping",
    group: "Salesforce Connect",
    body: "Hourly new short-term external record ID mappings",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  // {
  //   header: "Active ScratchOrgs",
  //   topic: "ActiveScratchOrg",
  //   group: "Salesforce Developer Experience",
  //   body: "The maximum number of scratch orgs you can have at any given time based on the edition type. Allocation becomes available if you delete a scratch org or if a scratch org expires.",
  //   displayValue: "Used",
  //   loaded: true,
  // },
  // {
  //   header: "Daily Scratch Orgs",
  //   topic: "DailyScratchOrgs",
  //   group: "Salesforce Developer Experience",
  //   body: "The maximum number of successful scratch org creations you can initiate in a rolling (sliding) 24-hour window. Allocations are determined based on the number of scratch orgs created in the preceding 24 hours.",
  //   displayValue: "UsedPercentage",
  //   loaded: true,
  // },
  {
    header: "Package2 Version Creates",
    topic: "Package2VersionCreates",
    group: "Salesforce Developer Experience",
    body: "Daily number of package versions that you can create. Applies to unlocked and second-generation managed packages.",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Package2 Version Creates Without Validation",
    topic: "Package2VersionCreatesWithoutValidation",
    group: "Salesforce Developer Experience",
    body: "Daily number of package versions that skip validation that you can create. Applies to unlocked and second-generation managed packages.",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  // {
  //   header: "Daily Functions ApiCall Limit",
  //   topic: "DailyFunctionsApiCallLimit",
  //   group: "Salesforce Functions",
  //   body: "Daily API calls in an org with Functions. Values are visible only if Salesforce Functions is enabled. For more information, see Functions Limits.",
  //   displayValue: "UsedPercentage",
  //   loaded: true,
  // },
  {
    header: "Data Storage",
    topic: "DataStorageMB",
    group: "Storage",
    body: "Data storage (MB)",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "FileStorage",
    topic: "FileStorageMB",
    group: "Storage",
    body: "File storage (MB)",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Daily Durable Generic Streaming ApiEvents",
    topic: "DailyDurableGenericStreamingApiEvents",
    group: "Streaming API—Durable",
    body: "Generic events notifications delivered in the past 24 hours to all CometD clients",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Durable Streaming Api Events",
    topic: "DailyDurableStreamingApiEvents",
    group: "Streaming API—Durable",
    body: "PushTopic event notifications delivered in the past 24 hours to all CometD clients",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Durable StreamingApi Concurrent Clients",
    topic: "DurableStreamingApiConcurrentClients",
    group: "Streaming API—Durable",
    body: "Concurrent CometD clients (subscribers) across all channels and for all event types",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Generic StreamingApi Events",
    topic: "DailyGenericStreamingApiEvents",
    group: "Streaming API (API version 36.0 and earlier)",
    body: "Generic events notifications delivered in the past 24 hours to all CometD clients",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily StreamingApi Events",
    topic: "DailyStreamingApiEvents",
    group: "Streaming API (API version 36.0 and earlier)",
    body: "PushTopic event notifications delivered in the past 24 hours to all CometD clients",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Streaming Api Concurrent Clients",
    topic: "StreamingApiConcurrentClients",
    group: "Streaming API (API version 36.0 and earlier)",
    body: "Concurrent CometD clients (subscribers) across all channels and for all event types",
    displayValue: "Used",
    loaded: true,
  },
  {
    header: "Daily Workflow Emails",
    topic: "DailyWorkflowEmails",
    group: "Workflows",
    body: "Daily workflow emails",
    displayValue: "UsedPercentage",
    loaded: true,
  },
  {
    header: "Hourly TimeBased Workflow",
    topic: "HourlyTimeBasedWorkflow",
    group: "Workflows",
    body: "Hourly workflow time triggers",
    displayValue: "UsedPercentage",
    loaded: true,
  },
];
