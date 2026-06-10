import { useMemo } from 'react';
import type { useGpsData } from './useGpsData';
import type { useMockData } from './useMockData';

type GpsData = ReturnType<typeof useGpsData>;
type MockData = ReturnType<typeof useMockData>;

interface FormattedData {
  speedDisplay: number;
  rpmDisplay: number;
  engineTempDisplay: string;
  airTempDisplay: string;
  alternatorDisplay: string;
  frontPsiDisplay: string;
  rearPsiDisplay: string;
  mileageDisplay: number;
  engineTempRaw: number;
  alternatorRaw: number;
}

export function useFormattedData(gps: GpsData, mock: MockData): FormattedData {
  return useMemo(
    () => ({
      speedDisplay: Math.round(gps.speed),
      rpmDisplay: Math.round(mock.rpm),
      engineTempDisplay: mock.engine_temp.toFixed(1),
      airTempDisplay: mock.air_temp.toFixed(1),
      alternatorDisplay: mock.alternator_status.toFixed(1),
      frontPsiDisplay: mock.tpms_front_psi.toFixed(1),
      rearPsiDisplay: mock.tpms_rear_psi.toFixed(1),
      mileageDisplay: mock.mileage,
      engineTempRaw: mock.engine_temp,
      alternatorRaw: mock.alternator_status,
    }),
    [
      gps.speed,
      mock.rpm,
      mock.engine_temp,
      mock.air_temp,
      mock.alternator_status,
      mock.tpms_front_psi,
      mock.tpms_rear_psi,
      mock.mileage,
    ],
  );
}
