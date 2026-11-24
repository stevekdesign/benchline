// The only data source: the fictional sample files in src/data/.
import specimensFile from '../data/specimens.json';
import nursesFile from '../data/nurses.json';
import type { Nurse, Specimen, Station } from './types';

export const demoClock: string = specimensFile.demoClock;
export const stations = specimensFile.stations as unknown as Station[];
export const baseSpecimens = specimensFile.specimens as unknown as Specimen[];
export const nurses = nursesFile.nurses as Nurse[];

export function getStation(id: string | null | undefined): Station | undefined {
  return stations.find((s) => s.id === id);
}
