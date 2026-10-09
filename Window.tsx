"use client";

import { useRef, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import Icon, { type IconName } from "./Icons";

export type WinState = {
  id: string;
  x: number;
  y: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
};

type Props = {
  win: WinState;
  title: string;
  icon: IconName;
  width: number;
  height: number;
  menu?: string[];
  status?: ReactNode;
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  children: ReactNode;
};

export default function Window({
  win,
  title,
  icon,
  width,
  height,
  menu = ["File", "Edit", "View", "Help"],
  status,
  focused,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  children,
}: Props) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button") || win.maximized) return;
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 90;
    const nx = Math.min(maxX, Math.max(-width + 120, e.clientX - drag.current.dx));
    const ny = Math.min(maxY, Math.max(0, e.clientY - drag.current.dy));
    onMove(nx, ny);
  };
  const up = () => {
    drag.current = null;
  };

  return (
    <section
      className={`win ${focused ? "is-focused" : ""} ${win.maximized ? "is-max" : ""}`}
      style={{
        left: win.x,
        top: win.y,
        width,
        height,
        zIndex: win.z,
        display: win.minimized ? "none" : undefined,
      }}
      onPointerDown={onFocus}
      role="dialog"
      aria-label={title}
    >
      <div
        className="win-title"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={onMaximize}
      >
        <Icon name={icon} size={20} />
        <span className="win-title-text">{title}</span>
        <div className="win-btns">
          <button aria-label="Minimize" onClick={onMinimize} className="wb wb-min">
            <span />
          </button>
          <button aria-label="Maximize" onClick={onMaximize} className="wb wb-max">
            <span />
          </button>
          <button aria-label="Close" onClick={onClose} className="wb wb-close">
            ✕
          </button>
        </div>
      </div>
      {menu.length > 0 && (
        <div className="win-menu" aria-hidden="true">
          {menu.map((m) => (
            <span key={m}>
              <u>{m[0]}</u>
              {m.slice(1)}
            </span>
          ))}
        </div>
      )}
      <div className="win-body">{children}</div>
      {status && <div className="win-status">{status}</div>}
    </section>
  );
}
