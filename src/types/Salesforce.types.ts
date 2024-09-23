export interface Identity {
  id: string;
  asserted_user: boolean;
  user_id: string;
  organization_id: string;
  username: string;
  nick_name: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  timezone: string;
  photos: Photos;
  addr_street: any;
  addr_city: any;
  addr_state: any;
  addr_country: any;
  addr_zip: any;
  mobile_phone: any;
  mobile_phone_verified: boolean;
  is_lightning_login_user: boolean;
  status: Status;
  urls: Urls;
  active: boolean;
  user_type: string;
  language: string;
  locale: string;
  utcOffset: number;
  last_modified_date: string;
  is_app_installed: boolean;
}

export interface Photos {
  picture: string;
  thumbnail: string;
}

export interface Status {
  created_date: any;
  body: any;
}

export interface Urls {
  enterprise: string;
  metadata: string;
  partner: string;
  rest: string;
  sobjects: string;
  search: string;
  query: string;
  recent: string;
  tooling_soap: string;
  tooling_rest: string;
  profile: string;
  feeds: string;
  groups: string;
  users: string;
  feed_items: string;
  feed_elements: string;
  custom_domain: string;
}

// Painfully extracted from https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_eventlogfile_supportedeventtypes.htm
export enum SalesforceEventType {
  API = "API",
  ApiTotalUsage = "ApiTotalUsage",
  ApexExecution = "ApexExecution",
  ApexCallout = "ApexCallout",
  ApexSoap = "ApexSoap",
  ApexTrigger = "ApexTrigger",
  AuraRequest = "AuraRequest",
  ApexUnexpectedException = "ApexUnexpectedException",
  AsyncReportRun = "AsyncReportRun",
  BulkApi = "BulkApi",
  BulkApi2 = "BulkApi2",
  ConcurrentLongRunningApexLimit = "ConcurrentLongRunningApexLimit",
  Console = "Console",
  ContentDistribution = "ContentDistribution",
  ContentDocumentLink = "ContentDocumentLink",
  ContinuationCalloutSummary = "ContinuationCalloutSummary",
  CorsViolation = "CorsViolation",
  ContentTransfer = "ContentTransfer",
  Dashboard = "Dashboard",
  DocumentAttachmentDownloads = "DocumentAttachmentDownloads",
  ExternalCrossOrgCallout = "ExternalCrossOrgCallout",
  ExternalCustomApexCallout = "ExternalCustomApexCallout",
  ExternalDataSourceCallout = "ExternalDataSourceCallout",
  ExternalODataCallout = "ExternalODataCallout",
  FlowExecution = "FlowExecution",
  GroupMembership = "GroupMembership",
  HostnameRedirects = "HostnameRedirects",
  InsecureExternalAssets = "InsecureExternalAssets",
  InsufficientAccess = "InsufficientAccess",
  KnowledgeArticleView = "KnowledgeArticleView",
  LightningError = "LightningError",
  LightningInteraction = "LightningInteraction",
  LightningLogger = "LightningLogger",
  LightningPageView = "LightningPageView",
  LightningPerformance = "LightningPerformance",
  Login = "Login",
  LoginAs = "LoginAs",
  LoginEvent = "LoginEvent",
  Logout = "Logout",
  MetadataApiOperation = "MetadataApiOperation",
  MultiblockReport = "MultiblockReport",
  NamedCredential = "NamedCredential",
  OneCommerceUsage = "OneCommerceUsage",
  PackageInstall = "PackageInstall",
  PlatformEncryption = "PlatformEncryption",
  QueuedExecution = "QueuedExecution",
  Report = "Report",
  ReportExport = "ReportExport",
  RestApi = "RestApi",
  Sandbox = "Sandbox",
  Search = "Search",
  SearchClick = "SearchClick",
  Sites = "Sites",
  TimeBasedWorkflow = "TimeBasedWorkflow",
  TransactionSecurity = "TransactionSecurity",
  UiTelemetryNavigationTiming = "UiTelemetryNavigationTiming",
  UITelemetryResourceTiming = "UITelemetryResourceTiming",
  URI = "URI",
  VisualforceRequest = "VisualforceRequest",
  WaveChange = "WaveChange",
  WaveDownload = "WaveDownload",
  WaveInteraction = "WaveInteraction",
  WavePerformance = "WavePerformance",
}

export const metaDataSupportedObjectTypes = [
  "ApexClass",
  "ApexTrigger",
  "ApexPage",
  "CustomObject",
  "CustomField",
  "Flow",
  "FlowDefinition",
  "ValidationRule",
];

export type MetadataInfo = {
  Metadata: Array<{
    required: any;
    unique: any;
    readOnlyProxy: any;
  }>;
  actionOverrides: Array<{
    formFactor: string;
    isAvailableInTouch: boolean;
    name: string;
    pageId: string;
    url: any;
  }>;
  activateable: boolean;
  associateEntityType: any;
  associateParentEntity: any;
  childRelationships: Array<{
    cascadeDelete: boolean;
    childSObject: string;
    deprecatedAndHidden: boolean;
    field: string;
    junctionIdListNames: Array<any>;
    junctionReferenceTo: Array<any>;
    relationshipName?: string;
    restrictedDelete: boolean;
  }>;
  compactLayoutable: boolean;
  createable: boolean;
  custom: boolean;
  customSetting: boolean;
  deepCloneable: boolean;
  defaultImplementation: any;
  deletable: boolean;
  deprecatedAndHidden: boolean;
  extendedBy: any;
  extendsInterfaces: any;
  feedEnabled: boolean;
  fields: Array<{
    aggregatable: boolean;
    aiPredictionField: boolean;
    autoNumber: boolean;
    byteLength: number;
    calculated: boolean;
    calculatedFormula: any;
    cascadeDelete: boolean;
    caseSensitive: boolean;
    compoundFieldName?: string;
    controllerName: any;
    createable: boolean;
    custom: boolean;
    defaultValue: any;
    defaultValueFormula: any;
    defaultedOnCreate: boolean;
    dependentPicklist: boolean;
    deprecatedAndHidden: boolean;
    digits: number;
    displayLocationInDecimal: boolean;
    encrypted: boolean;
    externalId: boolean;
    extraTypeInfo?: string;
    filterable: boolean;
    filteredLookupInfo: any;
    formulaTreatNullNumberAsZero: boolean;
    groupable: boolean;
    highScaleNumber: boolean;
    htmlFormatted: boolean;
    idLookup: boolean;
    inlineHelpText: any;
    label: string;
    length: number;
    mask: any;
    maskType: any;
    name: string;
    nameField: boolean;
    namePointing: boolean;
    nillable: boolean;
    permissionable: boolean;
    picklistValues: Array<{
      active: boolean;
      defaultValue: boolean;
      label: string;
      validFor: any;
      value: string;
    }>;
    polymorphicForeignKey: boolean;
    precision: number;
    queryByDistance: boolean;
    referenceTargetField: any;
    referenceTo: Array<string>;
    relationshipName?: string;
    relationshipOrder: any;
    restrictedDelete: boolean;
    restrictedPicklist: boolean;
    scale: number;
    searchPrefilterable: boolean;
    soapType: string;
    sortable: boolean;
    type: string;
    unique: boolean;
    updateable: boolean;
    writeRequiresMasterRead: boolean;
  }>;
  hasSubtypes: boolean;
  implementedBy: any;
  implementsInterfaces: any;
  isInterface: boolean;
  isSubtype: boolean;
  keyPrefix: string;
  label: string;
  labelPlural: string;
  layoutable: boolean;
  listviewable: any;
  lookupLayoutable: any;
  mergeable: boolean;
  mruEnabled: boolean;
  name: string;
  namedLayoutInfos: Array<any>;
  networkScopeFieldName: any;
  queryable: boolean;
  recordTypeInfos: Array<{
    active: boolean;
    available: boolean;
    defaultRecordTypeMapping: boolean;
    developerName: string;
    master: boolean;
    name: string;
    recordTypeId: string;
    urls: {
      layout: string;
    };
  }>;
  replicateable: boolean;
  retrieveable: boolean;
  searchLayoutable: boolean;
  searchable: boolean;
  sobjectDescribeOption: string;
  supportedScopes: Array<{
    label: string;
    name: string;
  }>;
  triggerable: boolean;
  undeletable: boolean;
  updateable: boolean;
  urls: {
    compactLayouts: string;
    rowTemplate: string;
    approvalLayouts: string;
    uiDetailTemplate: string;
    uiEditTemplate: string;
    listviews: string;
    describe: string;
    uiNewRecord: string;
    quickActions: string;
    layouts: string;
    sobject: string;
  };
};
