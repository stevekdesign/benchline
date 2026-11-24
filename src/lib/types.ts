// Shapes of the demo data in src/data/*.json.

export type Priority = 'STAT' | 'Routine';
export type LocationType = 'receiving' | 'bench' | 'analyzer' | 'fridge';
export type SpecimenStatus =
  | 'critical-callback-due'
  | 'callback-logged'
  | 'waiting'
  | 'held'
  | 'testing'
  | 'received'
  | 'prepping'
  | 'resulted';

export interface Station {
  id: string;
  name: string;
  type: LocationType;
  detail: string;
  status?: 'running' | 'down';
  downSince?: string;
}

export interface TimelineEvent {
  type: string;
  at: string;
  where: string;
  by?: string;
  critical?: boolean;
  note?: string;
}

export interface CriticalResult {
  analyte: string;
  value: number;
  unit: string;
  criticalLimit: string;
}

export interface Callback {
  nurseId: string;
  nurseName: string;
  at: string;
  readBack: boolean;
}

export interface Specimen {
  orderId: string;
  test: string;
  priority: Priority;
  stationId: string;
  locationType: LocationType;
  position: string | null;
  orderingUnit: string;
  receivedAt: string;
  status: SpecimenStatus;
  overTurnaround: boolean;
  heldFromStationId: string | null;
  criticalResult: CriticalResult | null;
  callback: Callback | null;
  timeline: TimelineEvent[];
}

export interface Nurse {
  id: string;
  name: string;
  initials: string;
  unit: string;
  credential: string;
}
