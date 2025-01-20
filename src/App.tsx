import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./routes/Home/About";
import Hero from "./routes/Home/Hero";
import { createContext, useEffect, useState } from "react";
import WaitingRoom from "./routes/Calling room/WaitingRoom";
import { AnimatePresence, motion } from "motion/react";
import CallRoom from "./routes/Calling room/CallRoom";
import cliensocket, { Socket } from "socket.io-client";

interface AppContext {
  MainSocket: Socket;
  showAlert: (message: string) => void;
  name: string;
}

export const AppContext = createContext<AppContext>({} as AppContext);
export const MediapreferenceContext = createContext<any>({});

function App() {
  const [newAlerts, setAlerts] = useState<Map<string, string>>(new Map());
  const [MainSocket, setMainSocket] = useState<Socket>();
  const [Video_Toggle, SetVideoToggle] = useState<boolean>(false);
  const [name, setname] = useState("");
  const [Audio_Toggle, SetAudioToggle] = useState<boolean>(false);
  useEffect(() => {
    var MainSocket: Socket;

    // Check if a socket ID exists in sessionStorage
    const storedSocketId = sessionStorage.getItem("socketid");
    
    if (storedSocketId) {
        // Connect with the stored socket ID
        MainSocket = cliensocket("http://192.168.8.53:3000", {
            query: { userId: storedSocketId },
        });
    } else {
        // Create a new connection without a stored ID
        MainSocket = cliensocket("http://192.168.8.53:3000");
    
        // Wait for the connection to establish
        MainSocket.on("connect", () => {
            // Store the newly generated socket ID
            sessionStorage.setItem("socketid", String(MainSocket.id));
            console.log(`New socket ID stored: ${MainSocket.id}`);
        });
    }
    
    // Handle errors or disconnection
    MainSocket.on("connect_error", (err) => {
        console.error("Connection error:", err);
    });
    
    MainSocket.on("disconnect", () => {
        console.log("Socket disconnected.");
    });
    

    setMainSocket(MainSocket);
    MainSocket.emit("getname", (name: string) => {
      setname(name);
    });

    return () => {
      MainSocket.disconnect();
    };
  }, []);

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
    MainSocket && (
      <>
        <MediapreferenceContext.Provider
          value={{ Video_Toggle, SetVideoToggle, Audio_Toggle, SetAudioToggle }}
        >
          <AppContext.Provider value={{ MainSocket, showAlert, name }}>
            <AnimatePresence>
              {Array.from(newAlerts.entries()).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ y: -100 }}
                  animate={{ y: 0 + 55 * i }}
                  exit={{ y: -100 }}
                  className="flex z-50 items-center text-white font-extrabold justify-center w-[400px] h-[50px] fixed top-[50px] left-0 right-0 text-center mx-auto min-w-fit bg-black border-yellow-500 border-2 border-solid rounded-md "
                >
                  {value}
                </motion.div>
              ))}
            </AnimatePresence>

            <BrowserRouter>
              <div>
                <Routes>
                  <Route path="/" element={<Hero showAlert={showAlert} />}>
                    <Route path="/About" element={<About />} />
                    <Route path="/motive" element={"Coming Soon"} />
                    <Route path="*" element={<div>doesn't exists 404</div>} />
                  </Route>
                  <Route path="/GettingReady/:id" element={<WaitingRoom />} />
                  <Route path="/InCall/:id" element={<CallRoom />} />
                </Routes>
              </div>
            </BrowserRouter>
          </AppContext.Provider>
        </MediapreferenceContext.Provider>
      </>
    )
  );
}

export default App;
