import { useEffect, useRef, useState } from 'react';

interface MockData {
  rpm: number;
  engine_temp: number;
  air_temp: number;
  mileage: number;
  alternator_status: number;
  tpms_front_psi: number;
  tpms_rear_psi: number;
}

export function useMockData(): MockData {
  const tickRef = useRef(0);

  const [data, setData] = useState<MockData>({
    rpm: 0,
    engine_temp: 20,
    air_temp: 18,
    mileage: 12345,
    alternator_status: 13.8,
    tpms_front_psi: 36,
    tpms_rear_psi: 42,
  });

  useEffect(() => {
    const id = setInterval(() => {
      const tick = ++tickRef.current;
      setData(prev => {
        const rpm = Math.min(10000, Math.max(0, prev.rpm + (Math.random() * 500 - 250)));
        const engine_temp = Math.min(110, prev.engine_temp + Math.random() * 0.5);
        const air_temp = 18 + 3 * Math.sin(tick);
        const alternator_status = Math.min(
          15.0,
          Math.max(11.0, prev.alternator_status + (Math.random() * 0.4 - 0.2)),
        );
        const tpms_front_psi = prev.tpms_front_psi + (Math.random() * 0.2 - 0.1);
        const tpms_rear_psi = prev.tpms_rear_psi + (Math.random() * 0.2 - 0.1);

        return {
          rpm,
          engine_temp,
          air_temp,
          mileage: 12345,
          alternator_status,
          tpms_front_psi,
          tpms_rear_psi,
        };
      });
    }, 500);

    return () => clearInterval(id);
  }, []);

  return data;
}
