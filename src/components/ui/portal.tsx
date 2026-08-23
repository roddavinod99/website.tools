"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
  const portalRootRef = useRef<HTMLDivElement>(null);
  const targetContainer = container || (typeof document !== "undefined" ? document.body : null);

  useEffect(() => {
    if (!targetContainer) return;

    const element = document.createElement("div");
    portalRootRef.current = element;
    targetContainer.appendChild(element);

    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [targetContainer]);

  if (!targetContainer || !portalRootRef.current) return null;

  return createPortal(children, portalRootRef.current);
}