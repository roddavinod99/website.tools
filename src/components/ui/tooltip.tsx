"use client";

import React, { useState, useRef, useEffect, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/ui/portal";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delay?: number;
  className?: string;
}

interface TooltipProviderProps {
  children: ReactNode;
}

interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export function Tooltip({ children, content, side = "top", align = "center", delay = 200, className }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="inline-block"
    >
      {children}
      {isOpen && triggerRef.current && (
        <Portal>
          <TooltipContentPrimitive
            content={content}
            side={side}
            align={align}
            triggerRef={triggerRef}
            className={className}
          />
        </Portal>
      )}
    </div>
  );
}

export function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  if (asChild && React.isValidElement(children as React.ReactElement)) {
    return children;
  }
  return <div className="inline-block">{children}</div>;
}

export function TooltipContent({ children, side = "top", align = "center", className }: TooltipContentProps) {
  return <TooltipContentPrimitive content={children} side={side} align={align} triggerRef={{ current: null }} className={className} />;
}

function TooltipContentPrimitive({
  content,
  side = "top",
  align = "center",
  triggerRef,
  className,
}: {
  content: ReactNode;
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
  triggerRef: RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current!;
      const rect = trigger.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 60;

      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = rect.top - tooltipHeight - 8;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 8;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 8;
          break;
      }

      if (align === "start") {
        if (side === "top" || side === "bottom") left = rect.left;
        else top = rect.top;
      } else if (align === "end") {
        if (side === "top" || side === "bottom") left = rect.right - tooltipWidth;
        else top = rect.bottom - tooltipHeight;
      }

      left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [triggerRef, side, align]);

  return (
    <div
      style={{ position: "fixed", top: position.top, left: position.left, zIndex: 50 }}
      className={cn(
        "max-w-xs rounded-lg bg-surface-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-dark-text",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        className
      )}
      role="tooltip"
    >
      {content}
    </div>
  );
}