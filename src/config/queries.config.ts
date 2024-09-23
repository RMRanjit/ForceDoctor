import { topic } from "@/types/Common.types";

export const AllQueries: topic[] = [
  {
    type: "REST",
    query: `SELECT Id, 
              Name, 
              LengthWithoutComments, 
              Body, 
              Status,  
              isValid, 
              NamespacePrefix   
        FROM  ApexClass 
        WHERE Status !='Deleted' 
        ORDER BY Name ASC`,
    backup:
      "SELECT Id, Name,ApiVersion, Status,  isValid FROM ApexClass WHERE Status !='Deleted' ORDER BY Name ASC -- TOOLING",
    objectName: "ApexClass",
    isActive: true,
    postProcessing:
      "data.records = data.records.map(item => ({ ...item, complexity: item.LengthWithoutComments > 0 && item.LengthWithoutComments < 200 ? 'Simple' : item.LengthWithoutComments > 500 ? 'Complex' : 'Medium' }))",
  },
  {
    type: "TOOLING",
    query: `SELECT ApexClassorTriggerId,
              NumLinesCovered,
              NumLinesUncovered, 
              Coverage 
        FROM  ApexCodeCoverageAggregate`,
    objectName: "apexCodeCoverage",
    isActive: true,
    postProcessing:
      "{data.NumLinesCovered = data.records.reduce((accumulator, codeCoverage) => {return accumulator + codeCoverage.NumLinesCovered;},0); data.NumLinesUncovered = data.records.reduce((accumulator, codeCoverage) => {return accumulator + codeCoverage.NumLinesUncovered;},0);  data.CoveragePercent =parseFloat(data.NumLinesCovered /(data.NumLinesUncovered + data.NumLinesCovered)).toFixed(2) + '%'; return data }",
  },
  {
    type: "REST",
    query: `SELECT   Id, 
                Name, 
                TableEnumOrId, 
                NamespacePrefix, 
                ApiVersion, 
                Status, 
                IsValid, 
                LengthWithoutComments, 
                UsageAfterDelete, 
                UsageAfterInsert, 
                UsageAfterUndelete, 
                UsageAfterUpdate, 
                UsageBeforeDelete, 
                UsageBeforeInsert, 
                UsageBeforeUpdate, 
                Body 
        FROM    ApexTrigger 
        WHERE   Status = 'Active' 
        ORDER BY Name`,
    backup:
      "SELECT TableEnumOrId, Name, IsValid from ApexTrigger WHERE Status = 'Active'",
    objectName: "apexTriggers",
    isActive: true,
    postProcessing:
      "data.records = data.records.map(item => ({ ...item, complexity: item.LengthWithoutComments > 0 && item.LengthWithoutComments < 200 ? 'Simple' : item.LengthWithoutComments > 500 ? 'Complex' : 'Medium' }))",
  },
  {
    type: "TOOLING",
    query: `SELECT  Name, 
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
              FROM  ApexTrigger 
              WHERE TableEnumOrId='{id}'
              ORDER BY Name`,
    objectName: "apexTriggersForObject",
    isActive: true,
    notes: "get the id from metadata",
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Application, 
                    DurationMilliseconds, 
                    Location, 
                    Operation, 
                    Request, 
                    Status 
            FROM    ApexLog 
            ORDER BY Application`,
    objectName: "apexLogs",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT   JobType, 
                    MethodName, 
                    NumberOfErrors,
                    Status
            FROM    AsyncApexJob 
            ORDER by MethodName`,
    objectName: "apexBatchJobs",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id, 
                  DeveloperName, 
                  ExternalName,
                  NamespacePrefix,
                  Description
            FROM  CustomObject 
            ORDER BY DeveloperName ASC`,
    objectName: "customObjects",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                  DeveloperName, 
                  Description, 
                  MasterLabel, 
                  NamespacePrefix 
            FROM  AuraDefinitionBundle 
            ORDER BY DeveloperName ASC`,
    objectName: "auraBundles",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                  DefType, 
                  Format,
                  Source 
            FROM  AuraDefinition 
            WHERE AuraDefinitionBundleId = '{id}'`,
    objectName: "auraDefinition",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT count() FROM {selectedObject}`,
    objectName: "rowCountForSObjects",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Name, 
                  SymbolTable 
            FROM ApexClass 
            WHERE Id = '{id}'`,
    objectName: "symbolTable",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Id, 
                    Name, 
                    SymbolTable 
            FROM ApexClass`,
    objectName: "allSymbolTables",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT BusinessOwnerId, 
                   BusinessStatus, 
                   QualifiedApiName, 
                   DurableId, 
                   EntityDefinitionId, 
                   DataType, 
                   ExtraTypeInfo, 
                   DeveloperName, 
                   MasterLabel, 
                   Label, 
                   NamespacePrefix, 
                   RelationshipName, 
                   ReferenceTargetField, 
                   referenceTo, 
                   SecurityClassification,
                   IsCompound,
                   IsFlsEnabled,
                   IsNillable
                FROM FieldDefinition 
                WHERE EntityDefinitionId='{id}'`,
    objectName: "objectRelationships",
    isActive: true,
    notes: ` AND RelationshipName <> '' // Commented as we need all the field names
  ComplianceGroup,  was throwing error`,
    postProcessing: "",
  },

  {
    type: "TOOLING",
    query: `SELECT Id, 
                  DeveloperName , 
                  NamespacePrefix ,
                  TableEnumOrId 
            FROM  CustomField 
            ORDER BY DeveloperName ASC`,
    objectName: "customFields",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id, 
                  FieldId 
            FROM IndexField 
            WHERE ManageableState !='deleted'`,
    objectName: "customFieldindex",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT  Id, 
                    Description, 
                    DeveloperName, 
                    DurableId, 
                    Label, 
                    MasterLabel, 
                    NamespacePrefix, 
                    LogoUrl 
            FROM    AppDefinition 
            ORDER BY DeveloperName`,
    objectName: "appDefinitions",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Id, 
                    MasterLabel, 
                    Description,
                    ManageableState 
            FROM    Flow 
            WHERE   ProcessType != 'Workflow' 
            AND     Status = 'Active' 
            ORDER BY MasterLabel`,
    objectName: "workFlows",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Metadata 
            FROM    Flow 
            WHERE   Id = '{Id}'`,
    objectName: "workFlowMetaData",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Id, 
                    Name,
                    TableEnumOrId  
            FROM    WorkflowRule 
            ORDER BY Name`,
    objectName: "workFlowRules",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Id, 
                    ActiveVersionId, 
                    ActiveVersion.MasterLabel, 
                    DeveloperName,NamespacePrefix 
            FROM   FlowDefinition 
            WHERE  ActiveVersionId != null 
            ORDER BY DeveloperName`,
    objectName: "flowDefinitions",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  ApexTestClassId, 
                    FlowVersionId, 
                    NumElementsCovered, 
                    NumElementsNotCovered, 
                    TestMethodName 
            FROM FlowTestCoverage 
            ORDER BY TestMethodName`,
    objectName: "flowTestCoverage",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Name, 
                    Description , 
                    DeveloperName,
                    EntityDefinitionId ,
                    NamespacePrefix, 
                    SobjectType, 
                    isActive 
            FROM RecordType 
            ORDER BY Name `,
    objectName: "recordTypes",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Name, 
                    Description , 
                    DeveloperName,
                    EntityDefinitionId ,
                    NamespacePrefix, 
                    SobjectType, 
                    isActive 
            FROM RecordType 
            WHERE SobjectType = '{object}'
            ORDER BY Name `,
    objectName: "recordTypesForObject",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  {fieldName}, 
            FROM {object}
            WHERE RecordType.DeveloperName = '{recordType}.DeveloperName'
            AND CreatedDate = LAST_N_MONTHS:6
            ORDER BY CreatedDate
            LIMIT 1000 `,
    objectName: "fieldRecordsForRecordType",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  {fieldName}, 
            FROM {object}
            WHERE CreatedDate = LAST_N_MONTHS:6
            ORDER BY CreatedDate
            LIMIT 1000 `,
    objectName: "fieldRecordsForObject",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  count(Id), 
            FROM {object}
            WHERE {fieldName} != null
            AND RecordType.DeveloperName = '{recordType}.DeveloperName'`,
    objectName: "recordCountswithValueForRecordType",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  count(Id), 
            FROM {object}
            WHERE {fieldName} != null`,
    objectName: "recordCountswithValueForObject",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT  Id, 
                    CreatedDate,
                    CreatedById,
                    {fieldName},
                    CreatedBy.Name
            FROM {object}
            WHERE {fieldName} != null
            ORDER By CreatedDate DESC
            LIMIT 1`,
    objectName: "lastUpdatedForField",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT  Name, 
                    Description , 
                    DeveloperName ,
                    NamespacePrefix, 
                    SobjectType, 
                    isActive 
            FROM RecordType 
            ORDER BY Name`,
    objectName: "recordTypes",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id, 
                  EntityDefinitionId, 
                  EntityDefinition.MasterLabel, 
                  Active, 
                  ErrorDisplayField, 
                  ErrorMessage, 
                  Description, 
                  ValidationName, 
                  NamespacePrefix 
            FROM ValidationRule`,
    objectName: "validationRules",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                  Name, 
                  Body, 
                  ApiVersion, 
                  HtmlValue, 
                  DeveloperName 
              FROM EmailTemplate 
              ORDER BY Name`,
    objectName: "emailTemplates",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id, 
                  Name, 
                  StartUrl 
            FROM ConnectedApplication 
            ORDER BY Name`,
    objectName: "connectedApplications",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT  Id, 
                    Endpoint, 
                    MasterLabel,
                    DeveloperName, 
                    Protocol, 
                    Type 
            FROM   ExternalDataSource 
            ORDER BY DeveloperName`,
    objectName: "externalDataSource",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id,  
                  DeveloperName 
            FROM ExternalServiceRegistration 
            WHERE Status!='complete' 
            ORDER BY DeveloperName`,
    objectName: "externalService",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                  AccountId, 
                  ProfileId, 
                  Username, 
                  Name, 
                  FirstName, 
                  LastName, 
                  FullPhotoUrl, 
                  LastLoginDate 
              FROM User 
              WHERE IsActive = true 
              ORDER BY UserName`,
    objectName: "activeUsers",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT LoginHistory.SourceIp, 
                  LoginHistory.LoginTime, 
                  LoginHistory.UserId, 
                  LoginHistory.Browser, 
                  LoginHistory.Application, 
                  LoginHistory.LoginType, 
                  LoginHistory.Status ,
                  LoginGeo.City, 
                  LoginGeo.Country 
              FROM LoginHistory 
              ORDER BY LoginHistory.LoginTime DESC`,
    objectName: "loginHistory",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query:
      "SELECT LoginHistory.SourceIp, LoginHistory.LoginTime, LoginHistory.UserId, LoginHistory.Browser, LoginHistory.Application, LoginHistory.LoginType, LoginHistory.Status ,LoginGeo.City, LoginGeo.Country FROM LoginHistory WHERE LoginHistory.UserId = '{UserId}' ORDER BY LoginHistory.LoginTime DESC",
    objectName: "loginHistoryForUser",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id,
                  Name, 
                  DeveloperName, 
                  NamespacePrefix, 
                  FolderName, 
                  Description, 
                  Format, 
                  LastReferencedDate, 
                  LastRunDate, 
                  LastViewedDate, 
                  OwnerId, 
                  Owner.Name 
              FROM Report 
              WHERE isDeleted = false 
              ORDER BY Name`,
    objectName: "reports",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT AssigneeId 
            FROM PermissionSetAssignment 
            WHERE PermissionSet.PermissionsDelegatedTwoFactor = True`,
    objectName: "RecordMFA",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Name, 
                  ContentType, 
                  IsPrivate, 
                  ParentId,
                  Parent.Type, 
                  Parent.Name, 
                  OwnerId, 
                  Owner.Name, 
                  Description, 
                  BodyLength 
            FROM Attachment 
            ORDER BY Name`,
    objectName: "attachments",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id,
                  ApiVersion, 
                  ControllerKey,ControllerType, 
                  Description, 
                  Markup, 
                  Name, 
                  MasterLabel, 
                  NameSpacePrefix 
            FROM ApexPage 
            ORDER BY Name`,
    objectName: "visualForcePages",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id, 
                  Name, 
                  MasterLabel, 
                  DurableId, 
                  Description, 
                  ApexPageId, 
                  NameSpacePrefix 
              FROM ApexPageInfo 
              ORDER BY Name`,
    objectName: "visualForcePages-BAK",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id, 
                  Name, 
                  MasterLabel, 
                  Description,
                  NamespacePrefix, 
                  ControllerKey,ControllerType 
              FROM ApexComponent 
              WHERE ManageableState != 'deleted' 
              ORDER BY Name`,
    objectName: "lightningComponents",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT EventType, 
                  LogDate, 
                  LogFile, 
                  LogFileFieldNames 
            FROM EventLogFile 
            WHERE LogDate > Yesterday`,
    objectName: "errorLogFiles",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "TOOLING",
    query: `SELECT Id,
                  SubscriberPackage.NamespacePrefix,
                  SubscriberPackage.Name, 
                  SubscriberPackage.Description,
                  SubscriberPackageVersion.Name, 
                  SubscriberPackageVersion.MajorVersion,
                  SubscriberPackageVersion.MinorVersion,
                  SubscriberPackageId, 
                  SubscriberPackageVersion.Id,
                  SubscriberPackageVersion.PatchVersion,
                  SubscriberPackageVersion.BuildNumber,
                  SubscriberPackageVersion.IsManaged
            FROM InstalledSubscriberPackage
            ORDER BY SubscriberPackage.NamespacePrefix`,
    objectName: "installedApps",
    isActive: true,
    postProcessing:
      "data.records = data.records.map(item =>  ({...item, Name: item.SubscriberPackage.Name, Description: item.SubscriberPackage.Description}))",
  },

  {
    type: "TOOLING",
    query: `SELECT MetadataComponentId, 
                   MetadataComponentName,
                   MetadataComponentType,
                   RefMetadataComponentName, 
                   RefMetadataComponentType, 
                   RefMetadataComponentId,
                   RefMetadataComponentNamespace 
        FROM MetadataComponentDependency 
        WHERE MetadataComponentId ='{id}'
        AND MetadataComponentType != 'FlexiPage' 
        ORDER BY MetadataComponentName, 
                 RefMetadataComponentType`,
    objectName: "MetadataComponentDependency",
    isActive: true,
    postProcessing:
      "data.records = data.records.map(item =>  ({...item, Name: item.SubscriberPackage.Name, Description: item.SubscriberPackage.Description}))",
  },
  {
    type: "REST",
    query: `SELECT AllowedLicenses, 
                  ExpirationDate, 
                  IsProvisioned, 
                  NamespacePrefix, 
                  Status, 
                  UsedLicenses 
              FROM PackageLicense 
              ORDER BY NamespacePrefix`,
    objectName: "installedApps-Bak",
    isActive: false,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                  UserId, 
                  LoginTime, 
                  LoginType, 
                  SourceIp, 
                  LoginUrl, 
                  NetworkId, 
                  AuthenticationServiceId, 
                  LoginGeoId, 
                  TlsProtocol, 
                  CipherSuite, 
                  OptionsIsGet, 
                  OptionsIsPost, 
                  Browser, 
                  Platform, 
                  Status, 
                  Application, 
                  ClientVersion, 
                  ApiType, 
                  ApiVersion, 
                  CountryIso, 
                  AuthMethodReference, 
                  LoginSubType, 
                  ForwardedForIp 
              FROM LoginHistory`,
    objectName: "LoginHistory",
    isActive: false,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                    LicenseDefinitionKey, 
                    Status, 
                    MasterLabel, 
                    TotalLicenses, 
                    UsedLicenses, 
                    UsedLicensesLastUpdated, 
                    Name, 
                    MonthlyLoginsUsed, 
                    MonthlyLoginsEntitlement, 
                    CreatedDate, 
                    LastModifiedDate, 
                    SystemModstamp 
              FROM UserLicense 
              WHERE Status = 'Active' 
              ORDER BY MasterLabel`,
    objectName: "UserLicenses",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT Id, 
                  DeveloperName, 
                  TotalLicenses, 
                  UsedLicenses, 
                  CreatedDate, 
                  CreatedById,
                  LastModifiedDate, 
                  LastModifiedById, 
                  SystemModstamp, 
                  MasterLabel, 
                  Status, 
                  IsDeleted, 
                  Language, 
                  PermissionSetLicenseKey, 
                  ExpirationDate,   
                  LicenseExpirationPolicy 
            FROM PermissionSetLicense 
            ORDER BY MasterLabel`,
    objectName: "permissionSetLicenses",
    isActive: true,
    postProcessing: "",
  },

  {
    type: "REST",
    query: `SELECT Id, 
              MetricsDate, 
              FeatureType, 
              SystemModstamp, 
              AssignedUserCount, 
              ActiveUserCount, 
              TotalLicenseCount 
        FROM ActiveFeatureLicenseMetric 
        ORDER BY FeatureType`,
    objectName: "featureLicenses",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    notes: "has errors when using the ORDER BY ON MASTERLABEL",
    query: `SELECT Id, 
                  IsDeleted, 
                  MasterLabel, 
                  ResourceGroupKey, 
                  Setting, 
                  StartDate, 
                  EndDate, 
                  CurrentAmountAllowed, 
                  Frequency, 
                  HasRollover, 
                  OverageGrace, 
                  AmountUsed, 
                  UsageDate, 
                  CreatedDate, 
                  CreatedById, 
                  LastModifiedDate, 
                  LastModifiedById, 
                  SystemModstamp, 
                  IsPersistentResource 
              FROM TenantUsageEntitlement`,
    objectName: "usageEntitlements",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    notes:
      "Has errors with sObject type 'ActiveScratchOrg' is not supported. Check for permissions",
    query: `SELECT Id, 
                  Name, 
                  Description, 
                  Edition,
                  ExpirationDate, 
                  HasSampleData, 
                  LastLoginDate, 
                  LastReferencedDate,
                  SignupUsername 
              FROM ActiveScratchOrg 
              ORDER BY Name`,
    objectName: "ActiveScratchOrgs",
    isActive: false,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT ContentDocumentId, 
                    ContentLocation, 
                    ContentModifiedDate, 
                    ContentSize, 
                    Title, 
                    Description, 
                    FileExtension 
            FROM ContentVersion 
            WHERE ContentLocation = 'S' 
            ORDER BY ContentSize DESC`,
    objectName: "contentList",
    isActive: true,
    postProcessing:
      "{data.totalContentSize = data.records.reduce((accumulator, record) => {return accumulator + record.ContentSize;}, 0); return data;}",
  },

  {
    type: "REST",
    query: `SELECT Id, 
              ParentId, 
              CreatedDate, 
              CreatedById,
              CreatedBy.Name, 
              Field, 
              FieldHistoryType, 
              OldValue, 
              NewValue, 
              ArchiveParentType, 
              ArchiveFieldName, 
              ArchiveTimeStamp, 
              ArchiveParentName, 
              HistoryId 
        FROM FieldHistoryArchive 
        WHERE FieldHistoryType = '{objectName}'
        ORDER BY  FieldHistoryType ASC, 
                  ParentId ASC, 
                  CreatedDate DESC`,
    objectName: "CustomObjectHistory",
    isActive: true,
    notes: "ADDING LIMIT BY TIME --- AND CreatedDate = LAST_N_MONTHS:6",
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT  Id, 
                    IsDeleted, 
                    AccountId, 
                    CreatedById, 
                    CreatedBy.Name,
                    CreatedDate, 
                    Field, 
                    DataType, 
                    OldValue, 
                    NewValue 
            FROM {objectName}History
            ORDER BY CreatedDate DESC`,
    objectName: "StandardObjectHistory",
    isActive: true,
    notes: "ADDING LIMIT BY TIME --- AND CreatedDate = LAST_N_MONTHS:6",
    postProcessing: "",
  },

  {
    type: "REST",
    query: `SELECT Id, 
              ParentId, 
              CreatedDate, 
              CreatedById,
              CreatedBy.Name, 
              Field, 
              FieldHistoryType, 
              OldValue, 
              NewValue, 
              ArchiveParentType, 
              ArchiveFieldName, 
              ArchiveTimeStamp, 
              ArchiveParentName, 
              HistoryId 
        FROM FieldHistoryArchive 
        WHERE FieldHistoryType = '{objectName}'`,
    objectName: "fieldHistoryDataForCustomObjects",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT  Id, 
                    IsDeleted, 
                    AccountId, 
                    CreatedById, 
                    CreatedBy.Name,
                    CreatedDate, 
                    Field, 
                    DataType, 
                    OldValue, 
                    NewValue 
            FROM {objectName}History`,
    objectName: "fieldHistoryDataForStandardObjects",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REST",
    query: `SELECT  Id, 
                    ParentId, 
                    CreatedDate, 
                    CreatedById, 
                    Field, 
                    FieldHistoryType, 
                    OldValue, 
                    NewValue, 
                    ArchiveParentType, 
                    ArchiveFieldName, 
                    ArchiveTimeStamp, 
                    ArchiveParentName, 
                    HistoryId 
              FROM FieldHistoryArchive`,
    objectName: "fieldHistoryDataForCustomFields",
    isActive: false,
    postProcessing: "",
  },
  {
    type: "REQUEST",
    apiHeader: {
      url: "/services/data/v51.0/limits/recordCount",
      method: "GET",
    },
    objectName: "sObjectsRecordCount",
    isActive: true,
    postProcessing:
      "{data.totalRecords = data.sObjects.reduce((accumulator, currentVal) => {return accumulator + currentVal.count;},0); data.totalSize = data.sObjects.length; return data;}",
  },
  {
    type: "REQUEST",
    apiHeader: {
      url: "/services/data/v52.0/sobjects",
      method: "GET",
    },
    objectName: "sobjects",
    isActive: true,
    postProcessing:
      "{data.totalRecords = data.sobjects.length; data.totalSize = data.sobjects.length; data.records = data.sobjects; data.records.map(record =>  {record.attributes={}; record.attributes.type ='sobject'; record.attributes.url = record.urls.sobject; record.ID = record.name}); return data;}",
  },
  {
    type: "REQUEST",
    apiHeader: {
      url: "/services/data/v51.0/limits",
      method: "GET",
    },
    objectName: "limits",
    isActive: true,
    postProcessing:
      " Object.keys(data).map((attribute, index) => {data[attribute].Used = data[attribute].Max - data[attribute].Remaining; data[attribute].UsedPercentage = (data[attribute].Max > 0 ?(parseFloat(data[attribute].Used / data[attribute].Max).toFixed(2))*100:0).toFixed(2) + '%';});",
  },
  {
    type: "REQUEST",
    apiHeader: {
      url: "/services/data/v52.0/tooling/sobjects/CustomField/{id}",
      method: "GET",
    },
    objectName: "getFieldUsageForCustomFields",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REQUEST",
    apiHeader: {
      url: "/services/data/v61.0/analytics/reports/{id}/describe",
      method: "GET",
    },
    objectName: "ReportMetaData",
    isActive: true,
    postProcessing: "",
  },
  {
    type: "REQUEST",
    apiHeader: {
      url: "/services/data/v52.0/tooling/sobjects/CustomObject/{id}",
      method: "GET",
    },
    objectName: "CustomObjectFields",
    isActive: true,
    postProcessing:
      "{data.totalRecords = data.sObjects.reduce((accumulator, currentVal) => {return accumulator + currentVal.count;},0); data.totalSize = data.sObjects.length; return data;}",
  },
  {
    type: "METADATA",
    objectName: "CustomField",
    isActive: true,
    postProcessing:
      "data.records = data.records.sort((a,b) =>a.fullName.localeCompare(b.fullName))",
  },
];
