export interface SlicedImage {
  id: number;
  url: string;
  blob: Blob;
  row: number;
  col: number;
  fileName: string;
}

export interface GridOption {
  cols: number;
  rows: number;
  label: string;
  description: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
