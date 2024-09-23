export type topic = {
  type: string;
  query?: string;
  backup?: string;
  notes?: string;
  objectName: string;
  apiHeader?: apiHeader;
  isActive: boolean;
  postProcessing: string;
};

export type apiHeader = {
  method: string;
  url: string;
  responseType?: string;
  transport?: object;
  noContentResponse?: object;
};

export type MetaDataRecord = {
  MetadataComponentId: string;
  MetadataComponentName: string;
  MetadataComponentType: string;
  RefMetadataComponentName: string;
  RefMetadataComponentType: string;
  RefMetadataComponentId: string;
  RefMetadataComponentNamespace: string;
};

export type ToggleItem = {
  key: string;
  value: string;
};

export enum ActionType {
  Conversion = "Conversion",
  Documentation = "Documentation",
}
