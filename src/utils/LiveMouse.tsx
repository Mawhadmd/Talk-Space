import { useContext, useEffect, useState } from "react";
import { useThrottle } from "./UseThrottle";
import { AppContext } from "../App";

const LiveMouse = () => {
  const [pos, setpos] = useState({ x: 0, y: 0, hide: false });
  const [usermousearray, setusermousearray] = useState([]);
  const { MainSocket: socket } = useContext(AppContext);
  const throttlesendingtoserver = useThrottle(() => {
    if (!socket) return;
    socket.emit("livemouse", pos);
  }, 5);

  const throttledmovements = useThrottle((e: MouseEvent | null) => {
    if (!e) return;
    // console.log(e.clientX, e.clientY, e.eventPhase);
    let cursorType;
    if (e.target) {
      cursorType = window.getComputedStyle(e.target as Element).cursor;
    }
    // console.log(cursorType);
    setpos({ x: e.clientX, y: e.clientY, hide: cursorType != "none" });
  }, 5);

  useEffect(() => {
    document.addEventListener("mousemove", throttledmovements);
    return () => {
      document.removeEventListener("mousemove", throttledmovements);
    };
  }, [throttledmovements]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("livemouse", (data11) => {
      setusermousearray(data11);
      console.log("Live mouse data received:", data11);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    throttlesendingtoserver(null);
  }, [pos, socket]);

  return (
    <>
      <div>
        <img
        src="/cursor.png"
        alt="cursor"
        className="w-6 h-6 animate-ping fixed pointer-events-none z-50 border-1 border-black"
        style={{
          display: pos.hide ? "none" : "",
          top: `calc(${pos.y}px + 10px)`,
          left: `calc(${pos.x}px - 10px)`,
          position: "fixed",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />
       <img
        src="/cursor.png"
        alt="cursor"
        className="w-6 h-6  fixed pointer-events-none z-50"
        style={{
          display: pos.hide ? "none" : "",
          top: `calc(${pos.y}px + 10px)`,
          left: `calc(${pos.x}px - 10px)`,
          position: "fixed",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />
      </div>

      {usermousearray &&
        usermousearray.map((userPos: any) => {
          if (socket && userPos.id !== socket.id)
            return (
              <img
                key={userPos.id}
                src="/cursor.png"
                alt="cursor"
                className="w-6 h-6 fixed pointer-events-none"
                style={{
                  transition: "30ms all ease",
                  display: userPos.hide ? "none" : "",
                  top: `calc(${userPos.y}px + 10px)`,
                  left: `calc(${userPos.x}px - 10px)`,
                  position: "fixed",
                  pointerEvents: "none",
                  zIndex: 50,
                }}
              />
            );
        })}
    </>
  );
};

export default LiveMouse;
