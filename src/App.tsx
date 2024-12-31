import { useEffect } from "react";
import "./App.css";


import cliensocket from "socket.io-client";
import { BrowserRouter, Routes, Route,Link } from "react-router";
import About from "./About";
import Hero from "./Hero";
function App() {
  const listitems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Our Motive", path: "/motive" },
  ];
  useEffect(() => {
    const socket = cliensocket("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("message", (data) => {
      console.log(data);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
    return () => {
      socket.close();
    };
  }, []);
  return (
    <>
       <BrowserRouter>
      <div className="fixed top-0 left-0 right-0 h-12 w-screen bg-black">
        <ul className="flex gap-2 h-full justify-center items-center w-full">
          {listitems.map((item) => {
            return (
              <Link
                to={{pathname:item.path}}
                key={item.name}
                className="hover:bg-white hover:text-black 0 rounded-full cursor-pointer transition-all p-2"
              >
                {item.name}
              </Link>
            );
          })}
        </ul>
      </div>
   

       <div className="h-full w-full">
       <Routes>
        <Route path="/" element={<Hero />}>
          <Route path="/About" element={<About />} />
          <Route path="*" element={<div>doesn't exists 404</div>} />
        </Route>

        </Routes>
       </div>

      </BrowserRouter>
    </>
  );
}

export default App;
