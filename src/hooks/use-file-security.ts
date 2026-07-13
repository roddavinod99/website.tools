"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  validateFileUpload,
  validateFileUploads,
  validateFileSize,
  type FileSecurityResult,
} from "@/lib/file-security";
import {
  trackObjectURL,
  revokeObjectURL,
} from "@/lib/file-cleanup";

export interface UseFileSecurityOptions {
  maxFileSize?: number;
  maxTotalSize?: number;
  maxCount?: number;
}

export function useFileSecurity(options: UseFileSecurityOptions = {}) {
  const urlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      for (const url of urls) {
        revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  const createTrackedURL = useCallback((blob: Blob, type?: string): string => {
    const url = URL.createObjectURL(type ? new Blob([blob], { type }) : blob);
    const tracked = trackObjectURL(url);
    urlsRef.current.add(tracked);
    return tracked;
  }, []);

  const revokeURL = useCallback((url: string) => {
    revokeObjectURL(url);
    urlsRef.current.delete(url);
  }, []);

  const revokeAllURLs = useCallback(() => {
    for (const url of urlsRef.current) {
      revokeObjectURL(url);
    }
    urlsRef.current.clear();
  }, []);

  const validateSingle = useCallback(
    async (file: File): Promise<FileSecurityResult> => {
      return validateFileUpload(file);
    },
    []
  );

  const validateMultiple = useCallback(
    async (files: File[]): Promise<FileSecurityResult> => {
      return validateFileUploads(files, options);
    },
    [options]
  );

  const validateSize = useCallback(
    (file: File): FileSecurityResult => {
      return validateFileSize(file, options.maxFileSize);
    },
    [options.maxFileSize]
  );

  return {
    validateSingle,
    validateMultiple,
    validateSize,
    createTrackedURL,
    revokeURL,
    revokeAllURLs,
  };
}
