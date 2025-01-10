import { useState } from "react";
import "./App.css";


import { BrowserRouter, Routes, Route } from "react-router";
import About from "./routes/Home/About";
import Hero from "./routes/Home/Hero";
import { createContext } from "react";

import CallRoom from "./routes/Calling room/CallRoom";
import LiveMouse from "./utils/LiveMouse";
import NavBar from "./NavBar";

interface AppContextType {
  Generatenewroomid: () => void;
  Setnewroomid: () => void;
  roomid: string;
  setRoomid: (id: string) => void;
}
export const AppContext = createContext<AppContextType>({} as AppContextType);

function App() {
  const [roomid, setRoomid] = useState("");


  const Generatenewroomid = () => {
    let roomId = Math.random().toString(36).substring(7);
    while (roomId.length < 6) {
      roomId = Math.random().toString(36).substring(7);
    }
    setRoomid(roomId);
  };

  const Setnewroomid = async () => {
    if (roomid.length < 6) {
      alert("Room id is not valid");
      return;
    }

    let idjson = await fetch(`http://localhost:3000/CheckAndEnterRoom/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomid: roomid }),
    });
    let status = idjson.status;
    let response = await idjson.text();

    console.log(status, response);
    alert(status + " " + response);
  };



  return (
    <>

    <LiveMouse/>
    <AppContext.Provider
      value={{ Generatenewroomid, Setnewroomid, roomid, setRoomid }}
    >
      <>
        <BrowserRouter>
        <NavBar/>
          <div className="h-full w-full">
            <Routes>
              <Route path="/" element={<Hero />}>
                <Route path="/About" element={<About />} />
                <Route path="/motive" element={"Coming Soon"} />
                <Route path="*" element={<div>doesn't exists 404</div>} />
              </Route>
              <Route path="/GettingReady/:id" element={<CallRoom />} />
            </Routes>
          </div>
        </BrowserRouter>
      </>
    </AppContext.Provider></>
  );
}

export default App;
