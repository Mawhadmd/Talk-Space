import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./routes/Home/About";
import Hero from "./routes/Home/Hero";
import { createContext, useState } from "react";
import LiveMouse from "./utils/LiveMouse";
import WaitingRoom from "./routes/Calling room/WaitingRoom";
import { AnimatePresence, motion } from "motion/react";

interface AppContextType {
  Generatenewroomid: () => void;
  Setnewroomid: () => void;
  roomid: string;
  setRoomid: (id: string) => void;
}
export const AppContext = createContext<AppContextType>({} as AppContextType);

function App() {
  const [newAlerts, setAlerts] = useState<Map<string, string>>(new Map());

  const showAlert = (message: string) => {
    let randkey = message + Math.random() * 2000;
    setAlerts((prev) => {
      let map = new Map(prev);
      map.set(randkey, message);
      return map;
    });
    setTimeout(() => {
      setAlerts((prev) => {
        let map = new Map(prev);
        map.delete(randkey);
        return map;
      });
    }, 3000);
  };

  return (
    <>
      <AnimatePresence>
        {Array.from(newAlerts.entries()).map(([key, value],i) => (
          <motion.div
            key={key}
            initial={{ y: -100  }}
            animate={{ y: 0 + (55*i)}}
            exit={{ y: -100 }}
            className="flex z-50 items-center text-white font-extrabold justify-center w-[400px] h-[50px] fixed top-[50px] left-0 right-0 text-center mx-auto min-w-fit bg-black border-yellow-500 border-2 border-solid rounded-md "
          >
            {value}
          </motion.div>
        ))}
      </AnimatePresence>

      <LiveMouse />

      <BrowserRouter>
        <div className="h-full w-full">
          <Routes>
            <Route path="/" element={<Hero showAlert={showAlert} />}>
              <Route path="/About" element={<About />} />
              <Route path="/motive" element={"Coming Soon"} />
              <Route path="*" element={<div>doesn't exists 404</div>} />
            </Route>
            <Route
              path="/GettingReady/:id"
              element={<WaitingRoom showAlert={showAlert} />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
