export interface PinRow {
  id: string;
  ipfs_pin_hash: string;
  size: number;
  user_id: string;
  date_pinned: string;
  date_unpinned: string | undefined;
  metadata: Object;
}

export interface PinListResponse {
  count: number;
  rows: PinRow[];
}

export interface PinObjectResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinObjectResponseWithUri extends PinObjectResponse {
  uri: string;
}

export interface PinMetadataKeyvalues {
  [key: string]: string | number;
}

export interface PinMetadata {
  name?: string;
  keyvalues?: PinMetadataKeyvalues;
}

export interface PinOptions {
  metadata?: PinMetadata;
}
