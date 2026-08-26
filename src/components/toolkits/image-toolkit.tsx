"use client";

import { ImageMinus, Crop, Image as ImageIcon, Square, ImagePlus, Info, FileCode, Droplets } from "lucide-react";
import { ToolkitShell } from "./toolkit-shell";
import { ImageCompressor } from "@/components/tools/image/image-compressor";
import { ImageResizer } from "@/components/tools/image/image-resizer";
import { SvgOptimizer } from "@/components/tools/image/svg-optimizer";
import { FaviconGenerator } from "@/components/tools/image/favicon-generator";
import { PlaceholderImage } from "@/components/tools/generators/placeholder-image";
import { ExifReader } from "@/components/tools/image/exif-reader";
import { SvgToCss } from "@/components/tools/image/svg-to-css";
import { ColorEyedropper } from "@/components/tools/image/color-eyedropper";

export function ImageToolkit() {
  return (
    <ToolkitShell
      title="Image"
      description="Compression, resizing, SVG, favicon, and image analysis tools for media workflows."
      tabs={[
        { id: "image-compressor", label: "Image Compressor", icon: <ImageMinus className="h-4 w-4" />, content: <ImageCompressor /> },
        { id: "image-resizer", label: "Image Resizer", icon: <Crop className="h-4 w-4" />, content: <ImageResizer /> },
        { id: "svg-optimizer", label: "SVG Optimizer", icon: <ImageIcon className="h-4 w-4" />, content: <SvgOptimizer /> },
        { id: "favicon-generator", label: "Favicon Generator", icon: <Square className="h-4 w-4" />, content: <FaviconGenerator /> },
        { id: "placeholder-image", label: "Placeholder Image", icon: <ImagePlus className="h-4 w-4" />, content: <PlaceholderImage /> },
        { id: "exif-reader", label: "EXIF Reader", icon: <Info className="h-4 w-4" />, content: <ExifReader /> },
        { id: "svg-to-css", label: "SVG to CSS", icon: <FileCode className="h-4 w-4" />, content: <SvgToCss /> },
        { id: "color-eyedropper", label: "Color Eyedropper", icon: <Droplets className="h-4 w-4" />, content: <ColorEyedropper /> },
      ]}
    />
  );
}
