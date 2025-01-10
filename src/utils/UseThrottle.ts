import { useRef } from "react";

export function useThrottle(cb: (e:MouseEvent | null ) => void, limit: number) {
    const lastRun = useRef(Date.now());
  
    return function (e:MouseEvent | null) {
      if (Date.now() - lastRun.current >= limit) {
        cb(e); // Execute the callback
        lastRun.current = Date.now(); // Update last execution time
      }
    };
  }