import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EMPTY_COLOR } from '@/slotting/colors';
import type { SlotRow } from '@/slotting/types';

const SELECTED_COLOR = '#ffffff';

// Vanilla three OrbitControls wrapped in a small R3F component — avoids pulling
// in the whole drei helper library just for one control.
function CameraControls({ tx, ty, tz }: { tx: number; ty: number; tz: number }) {
  const { camera, gl } = useThree();
  const controls = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const c = new ThreeOrbitControls(camera, gl.domElement);
    controls.current = c;
    return () => c.dispose();
  }, [camera, gl]);

  useEffect(() => {
    controls.current?.target.set(tx, ty, tz);
    controls.current?.update();
  }, [tx, ty, tz]);

  useFrame(() => controls.current?.update());
  return null;
}

export function WarehouseScene({
  slots,
  colorById,
  selectedSlotId,
  onSelectSlot,
}: {
  slots: SlotRow[];
  colorById: Map<string, string>;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
}) {
  return (
    <Canvas camera={{ position: [20, 18, 24], fov: 50 }}>
      <color attach="background" args={['#eef2f4']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[12, 22, 10]} intensity={0.6} />
      <CameraControls tx={8} ty={1.5} tz={7} />

      {/* dock marker at the origin */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>

      {slots.map((slot) => {
        const color =
          selectedSlotId === slot.id
            ? SELECTED_COLOR
            : (colorById.get(slot.id) ?? EMPTY_COLOR);
        return (
          <mesh
            key={slot.id}
            position={[slot.x, slot.level, slot.y]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSlot(slot.id);
            }}
          >
            <boxGeometry args={[1.4, 0.9, 1.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </Canvas>
  );
}
