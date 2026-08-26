"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

export function Portal({ children, container }: PortalProps) {
  const portalRootRef = useRef<HTMLDivElement>(null);
  const targetContainer = container || (typeof document !== "undefined" ? document.body : null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!targetContainer) return;

    const element = document.createElement("div");
    portalRootRef.current = element;
    targetContainer.appendChild(element);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);

    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      setIsReady(false);
    };
  }, [targetContainer]);

  // eslint-disable-next-line react-hooks/refs
  if (!targetContainer || !isReady || !portalRootRef.current) return null;

  // eslint-disable-next-line react-hooks/refs
  return createPortal(children, portalRootRef.current);
}