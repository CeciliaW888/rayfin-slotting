import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls as ThreePointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import { EMPTY_COLOR } from '@/slotting/colors';
import type { SlotRow } from '@/slotting/types';

export type CameraMode = 'orbit' | 'walk';

const SELECTED_COLOR = '#ffffff';
const STEEL = '#8aa0ad';
const BEAM = '#d58b42';
const FLOOR = '#dbe8ea';
const WALL = '#cdbf9e';

const EYE_HEIGHT = 1.7;
const WALK_SPEED = 7; // units/second
// Keep the walker inside the building footprint.
const BOUNDS = { minX: -0.5, maxX: 21, minZ: 1.5, maxZ: 14.5 };

// Vanilla three OrbitControls wrapped in a small R3F component — avoids pulling
// in the whole drei helper library just for one control.
function CameraControls({ tx, ty, tz }: { tx: number; ty: number; tz: number }) {
  const { camera, gl } = useThree();
  const controls = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const c = new ThreeOrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.maxPolarAngle = Math.PI / 2.05;
    c.minDistance = 12;
    c.maxDistance = 46;
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

// First-person aisle walkthrough: click to lock the pointer, WASD/arrows to
// move at eye height, mouse to look, ESC to exit. Uses vanilla three's
// PointerLockControls so we don't pull in drei.
function WalkControls() {
  const { camera, gl } = useThree();
  const controls = useRef<ThreePointerLockControls | null>(null);
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    camera.position.set(BOUNDS.minX + 1.5, EYE_HEIGHT, 4.5);
    camera.lookAt(12, EYE_HEIGHT, 4.5);

    const c = new ThreePointerLockControls(camera, gl.domElement);
    controls.current = c;

    const onClick = () => c.lock();
    gl.domElement.addEventListener('click', onClick);

    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);

    return () => {
      gl.domElement.removeEventListener('click', onClick);
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
      c.unlock();
      c.dispose();
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c?.isLocked) return;
    const step = WALK_SPEED * Math.min(delta, 0.05);
    const k = keys.current;
    const fwd = (k['KeyW'] || k['ArrowUp'] ? 1 : 0) - (k['KeyS'] || k['ArrowDown'] ? 1 : 0);
    const strafe = (k['KeyD'] || k['ArrowRight'] ? 1 : 0) - (k['KeyA'] || k['ArrowLeft'] ? 1 : 0);
    if (fwd) c.moveForward(step * fwd);
    if (strafe) c.moveRight(step * strafe);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, BOUNDS.minX, BOUNDS.maxX);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, BOUNDS.minZ, BOUNDS.maxZ);
    camera.position.y = EYE_HEIGHT;
  });

  return null;
}

function LabelSprite({
  text,
  position,
  scale = [2.2, 0.7, 1],
  color = '#1f2937',
  bg = 'rgba(255,255,255,0.82)',
}: {
  text: string;
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  bg?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    roundRect(ctx, 18, 22, 476, 116, 22);
    ctx.fill();
    ctx.font = '700 44px Inter, system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 82, 452);
    const map = new THREE.CanvasTexture(canvas);
    map.needsUpdate = true;
    return map;
  }, [bg, color, text]);

  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function DockDoors() {
  return (
    <group>
      {[4, 8, 12, 16].map((x, idx) => (
        <group key={x}>
          <mesh position={[x, 1.6, -0.45]}>
            <boxGeometry args={[2.2, 2.8, 0.18]} />
            <meshStandardMaterial color={idx === 1 ? '#334155' : '#475569'} />
          </mesh>
          <mesh position={[x, 0.06, 1.0]}>
            <boxGeometry args={[2.4, 0.1, 2.4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <LabelSprite text={`DOCK ${idx + 1}`} position={[x, 3.35, -0.7]} scale={[1.55, 0.45, 1]} />
        </group>
      ))}
      <mesh position={[10, 0.04, 2.2]}>
        <boxGeometry args={[17.2, 0.08, 1.1]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <LabelSprite text="RECEIVE / SHIP STAGING" position={[10, 0.65, 2.25]} scale={[5.0, 0.7, 1]} color="#78350f" bg="rgba(255,247,237,0.9)" />
    </group>
  );
}

function TravelNetwork() {
  return (
    <group>
      {/* main cross-aisle and pick path guides */}
      <mesh position={[10, 0.035, 3.7]}>
        <boxGeometry args={[18.5, 0.05, 0.22]} />
        <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.18} />
      </mesh>
      {[3, 6, 9, 12].map((z) => (
        <mesh key={z} position={[0.95, 0.04, z]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.05, 1.6]} />
          <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.18} />
        </mesh>
      ))}
      {[5.5, 10.5, 15.5].map((x) => (
        <mesh key={x} position={[x, 0.055, 8.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.08, 10.5]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}
      {[5.2, 9.8, 14.4].map((x, i) => (
        <LabelSprite key={x} text={`PICK AISLE ${i + 1}`} position={[x, 0.6, 13.8]} scale={[2.2, 0.55, 1]} />
      ))}
    </group>
  );
}

function BuildingShell({ showWalls }: { showWalls: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0, 8]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color={FLOOR} roughness={0.9} />
      </mesh>
      <gridHelper args={[24, 24, '#9fb6bf', '#cad7dc']} position={[10, 0.012, 8]} />

      {/* Perimeter walls box the camera in, so they're optional — off by default
          to keep the aisles visible when orbiting or walking through. */}
      {showWalls && (
        <group>
          <mesh position={[10, 3.1, -1.0]}>
            <boxGeometry args={[23, 6.2, 0.25]} />
            <meshStandardMaterial color={WALL} roughness={0.8} />
          </mesh>
          <mesh position={[-2, 3.1, 8]}>
            <boxGeometry args={[0.25, 6.2, 20]} />
            <meshStandardMaterial color={WALL} roughness={0.8} />
          </mesh>
          <mesh position={[22, 3.1, 8]}>
            <boxGeometry args={[0.25, 6.2, 20]} />
            <meshStandardMaterial color={WALL} roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* blue structural columns, visible along the warehouse aisle */}
      {[3.2, 8.8, 14.4, 20].map((x) =>
        [4.8, 13.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 2.2, z]}>
            <boxGeometry args={[0.35, 4.4, 0.35]} />
            <meshStandardMaterial color="#3792ad" />
          </mesh>
        ))
      )}
    </group>
  );
}

function ZoneBands({ slots }: { slots: SlotRow[] }) {
  const aisles = Array.from(new Set(slots.map((s) => s.aisle))).sort((a, b) => a - b);
  return (
    <group>
      {aisles.map((aisle) => {
        const slot = slots.find((s) => s.aisle === aisle);
        const color = slot?.zone === 'dangerous-goods' ? '#fed7aa' : slot?.zone === 'bulk' ? '#e2e8f0' : '#dcfce7';
        const label = slot?.zone === 'dangerous-goods' ? 'DANGEROUS GOODS' : slot?.zone === 'bulk' ? 'BULK STORE' : 'GENERAL PICK';
        const z = aisle * 3;
        return (
          <group key={aisle}>
            <mesh position={[10, 0.025, z]}>
              <boxGeometry args={[19.5, 0.04, 2.35]} />
              <meshStandardMaterial color={color} transparent opacity={0.32} />
            </mesh>
            <LabelSprite text={label} position={[20.2, 0.7, z]} scale={[2.4, 0.55, 1]} />
          </group>
        );
      })}
    </group>
  );
}

function RackSlot({
  slot,
  color,
  selected,
  onSelectSlot,
}: {
  slot: SlotRow;
  color: string;
  selected: boolean;
  onSelectSlot: (slotId: string) => void;
}) {
  const panelColor = selected ? SELECTED_COLOR : color;
  const zOffset = slot.aisle % 2 === 0 ? 0.48 : -0.48;

  return (
    <group position={[slot.x, slot.level * 1.05, slot.y + zOffset]}>
      {/* coloured SKU/location face */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectSlot(slot.id);
        }}
      >
        <boxGeometry args={[1.52, 0.82, 0.2]} />
        <meshStandardMaterial color={panelColor} roughness={0.55} />
      </mesh>

      {/* white location label strip, like rendered rack faces */}
      <mesh position={[0, 0.31, 0.115]}>
        <boxGeometry args={[1.42, 0.18, 0.045]} />
        <meshStandardMaterial color="#eef6f8" />
      </mesh>

      {/* pallet/tote depth behind the face */}
      <mesh position={[0, -0.03, -0.22]}>
        <boxGeometry args={[1.46, 0.72, 0.46]} />
        <meshStandardMaterial color={panelColor === EMPTY_COLOR ? '#f3eadf' : panelColor} transparent opacity={0.78} />
      </mesh>

      {/* selected outline */}
      {selected && (
        <mesh position={[0, 0, 0.13]}>
          <boxGeometry args={[1.7, 0.98, 0.06]} />
          <meshStandardMaterial color="#111827" wireframe />
        </mesh>
      )}
    </group>
  );
}

function RackStructure({ slots }: { slots: SlotRow[] }) {
  const rackRuns = useMemo(() => {
    const byAisle = new Map<number, SlotRow[]>();
    slots.forEach((slot) => byAisle.set(slot.aisle, [...(byAisle.get(slot.aisle) ?? []), slot]));
    return Array.from(byAisle.entries()).map(([aisle, rowSlots]) => {
      const xs = rowSlots.map((s) => s.x);
      const z = aisle * 3;
      return { aisle, minX: Math.min(...xs), maxX: Math.max(...xs), z };
    });
  }, [slots]);

  return (
    <group>
      {rackRuns.map((run) => {
        const width = run.maxX - run.minX + 2.1;
        const centerX = (run.minX + run.maxX) / 2;
        return (
          <group key={run.aisle}>
            {[1.0, 2.05, 3.1].map((y) => (
              <mesh key={y} position={[centerX, y, run.z]}>
                <boxGeometry args={[width, 0.08, 0.12]} />
                <meshStandardMaterial color={BEAM} />
              </mesh>
            ))}
            {Array.from({ length: Math.round(width / 2) + 1 }, (_, i) => run.minX - 1 + i * 2).map((x) => (
              <mesh key={x} position={[x, 1.85, run.z]}>
                <boxGeometry args={[0.08, 2.55, 0.16]} />
                <meshStandardMaterial color={STEEL} />
              </mesh>
            ))}
            <LabelSprite text={`AISLE ${run.aisle}`} position={[run.minX - 1.4, 3.75, run.z]} scale={[1.6, 0.48, 1]} />
          </group>
        );
      })}
    </group>
  );
}

function MiniOverheadHeatmap({ slots, colorById }: { slots: SlotRow[]; colorById: Map<string, string> }) {
  return (
    <group position={[0, 4.8, 0]}>
      <LabelSprite text="OVERHEAD HEATMAP" position={[10, 1.4, 15.8]} scale={[3.8, 0.62, 1]} color="#111827" />
      {slots.map((slot) => (
        <mesh key={`map-${slot.id}`} position={[slot.x, 0.05, slot.y + 5.5]}>
          <boxGeometry args={[1.35, 0.08, 0.75]} />
          <meshStandardMaterial color={colorById.get(slot.id) ?? EMPTY_COLOR} transparent opacity={0.82} />
        </mesh>
      ))}
    </group>
  );
}

export function WarehouseScene({
  slots,
  colorById,
  selectedSlotId,
  onSelectSlot,
  cameraMode = 'orbit',
  showWalls = false,
}: {
  slots: SlotRow[];
  colorById: Map<string, string>;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  cameraMode?: CameraMode;
  showWalls?: boolean;
}) {
  const walking = cameraMode === 'walk';
  return (
    <Canvas
      camera={walking ? { position: [0, EYE_HEIGHT, 4.5], fov: 72 } : { position: [19, 10, 22], fov: 45 }}
      shadows
      dpr={[1, 1.8]}
    >
      <color attach="background" args={['#eef2f4']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 18, 8]} intensity={0.85} castShadow />
      <pointLight position={[10, 7, 4]} intensity={0.45} />
      {walking ? <WalkControls /> : <CameraControls tx={10} ty={1.7} tz={8} />}

      <BuildingShell showWalls={showWalls} />
      <ZoneBands slots={slots} />
      <DockDoors />
      <TravelNetwork />
      <RackStructure slots={slots} />

      {slots.map((slot) => (
        <RackSlot
          key={slot.id}
          slot={slot}
          color={colorById.get(slot.id) ?? EMPTY_COLOR}
          selected={selectedSlotId === slot.id}
          onSelectSlot={onSelectSlot}
        />
      ))}

      {!walking && <MiniOverheadHeatmap slots={slots} colorById={colorById} />}
    </Canvas>
  );
}
