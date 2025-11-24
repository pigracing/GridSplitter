export interface SlicedImage {
  id: number;
  url: string;
  blob: Blob;
  row: number;
  col: number;
  fileName: string;
}

export interface GridConfig {
  columns: number;
  rows: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}