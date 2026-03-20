"use client";

import { useState, useEffect } from "react";

export function GhostMascot({ className = "" }: { className?: string }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  return (
    <div className={`ghost-mascot ${isMobile ? "ghost-static" : ""} ${className}`}>
      <div className="ghost-body">
        <div className="ghost-red">
          <div className="ghost-pupil" />
          <div className="ghost-pupil1" />
          <div className="ghost-eye" />
          <div className="ghost-eye1" />
          <div className="ghost-top0" />
          <div className="ghost-top1" />
          <div className="ghost-top2" />
          <div className="ghost-top3" />
          <div className="ghost-top4" />
          <div className="ghost-st0" />
          <div className="ghost-st1" />
          <div className="ghost-st2" />
          <div className="ghost-st3" />
          <div className="ghost-st4" />
          <div className="ghost-st5" />
          <div className="ghost-an1" />
          <div className="ghost-an2" />
          <div className="ghost-an3" />
          <div className="ghost-an4" />
          <div className="ghost-an5" />
          <div className="ghost-an6" />
          <div className="ghost-an7" />
          <div className="ghost-an8" />
          <div className="ghost-an9" />
          <div className="ghost-an10" />
          <div className="ghost-an11" />
          <div className="ghost-an12" />
          <div className="ghost-an13" />
          <div className="ghost-an14" />
          <div className="ghost-an15" />
          <div className="ghost-an16" />
          <div className="ghost-an17" />
          <div className="ghost-an18" />
        </div>
        <div className="ghost-shadow" />
      </div>
    </div>
  );
}
