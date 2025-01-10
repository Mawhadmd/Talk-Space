import { useEffect, useState } from "react";
import { useThrottle } from "./UseThrottle";
import cliensocket, { Socket } from "socket.io-client";

const LiveMouse = () => {
  const [pos, setpos] = useState({ x: 0, y: 0, hide: false });
  const [usermousearray, setusermousearray] = useState([]);
  const [socket, setSocket] = useState<Socket>();

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
      console.log(data11);
      setusermousearray(data11);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    throttlesendingtoserver(null);
  }, [pos, socket]);

  useEffect(() => {
    const newSocket = cliensocket("http://localhost:3000");
    setSocket(newSocket);

    return () => {
      newSocket.close(); // Cleanup on component unmount
    };
  }, []);

  return (
    <>
      <div
        className=" bg-red-800 w-10 h-2 rotate-45  fixed pointer-events-none"
        style={{
          display: `${pos.hide ? "none" : ""}`,
          top: `calc(${pos.y}px + 10px)`,
          left: `calc(${pos.x}px - 10px)`,
        }}
      ></div>

      {usermousearray &&
        usermousearray.map((pos: any) => {
          if (socket && pos.id != socket.id)
            return (
              <div
                key={pos.id}
                className=" bg-red-800 w-10 h-2 rotate-45  fixed pointer-events-none"
                style={{
                  transition: "30ms all ease",
                  display: `${pos.hide ? "none" : ""}`,
                  top: `calc(${pos.y}px + 10px)`,
                  left: `calc(${pos.x}px - 10px)`,
                }}
              ></div>
            );
        })}
    </>
  );
};

export default LiveMouse;
