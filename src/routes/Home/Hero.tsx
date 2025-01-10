
import { useContext } from "react";
import image from "./assets/Backgroundforzoomapp.png";
import { Outlet, useOutlet } from "react-router";
import { AppContext } from "../../App";
import { Link } from "react-router";
const Hero = () => {
  const {Generatenewroomid, Setnewroomid, roomid, setRoomid} = useContext(AppContext);
  let thereoutlet = useOutlet();

  return (
    <div
      id="Hero"
      className="w-screen max-h-screen  text-black   h-full flex justify-around items-center "
    >
      {!thereoutlet ? (
        <>
          <div className="ml-10 content-center">
            <div className=" text-5xl font-bold">
              Tired of Niggers? <br></br>Call 911
            </div>
            <div>
              Generate a new code or write existing one to{" "}
              <span className="font-bold bg-red-100 text-black p-1 rounded-full">
                join a video/audio room
              </span>
              <br />
              <div>
                What are you waiting for
                <br />
                <br />
                <input
                value={roomid}
                onChange={(e)=>setRoomid(e.target.value)}
                  type="text"
                  placeholder="Room id"
                  className="placeholder:text-center placeholder:font-bold rounded-xl w-72 h-10 p-1 text-white"
                />
                <br />
                <div className="flex justify-center">
                  <Link to={roomid ? `/GettingReady/${roomid}`:'/'}>
                  <button onClick={Setnewroomid} className="mt-1 h-10 bg-black hover:bg-red-800  transition-all ml-1 border-none text-white p-1">
                    Enter Room
                  </button>
                  </Link>
                  <button onClick={Generatenewroomid} className="mt-1 h-10 bg-black hover:bg-red-800  transition-all ml-1 border-none text-white p-1">
                    Generate a new code and Enter
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="sm:block hidden content-center">
            <img src={image} className="max-h-[500px]" alt="" />
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Hero;
