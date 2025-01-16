import { useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "../../App";
import VideoDisplayCallRoom from "./VideosComponents/VideoDisplayCallRoom";
import { useNavigate, useParams } from "react-router-dom";
import Peer from "peerjs";
import { AnimatePresence, motion } from "motion/react";

const CallRoom = () => {
  const { MainSocket } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [peerId, setPeerId] = useState("");
 
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerInstance = useRef<any>(null);
  const [entryRequest, setEntryRequest] = useState<
    Set<{ id: string; name: string }>
  >(new Set());

  function call(remotePeerId: string) {
    // Use modern getUserMedia
    const getUserMedia = navigator.mediaDevices.getUserMedia;
    // navigator.webkitGetUserMedia ||
    // navigator.mozGetUserMedia;

    if (!getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      return;
    }
    getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      const call = peerInstance.current.call(remotePeerId, mediaStream);

      call.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });
    });
  }
useEffect(() => { // make the call
  if(!peerId) return
  MainSocket?.on('peersignal', (peerId)=>{
    call(peerId)
  })
  MainSocket?.emit('peersignal',peerId, id)
  return () => {
    
  };
}, [peerId]);
  useEffect(() => { // setting the peer and it's listeners
    const peer = new Peer();
    peer.on("open", (id) => {
      setPeerId(id);
    });
    peer.on("call", (call) => {
      // Use modern getUserMedia
      const getUserMedia = navigator.mediaDevices.getUserMedia;
      // navigator.webkitGetUserMedia ||
      // navigator.mozGetUserMedia;

      if (!getUserMedia) {
        console.error("getUserMedia is not supported in this browser.");
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
 

          call.answer(mediaStream);

          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    });
    peerInstance.current = peer;
    return () => {};
  }, []);

  useEffect(() => {
    if (!MainSocket) return;

    MainSocket?.emit("Authorized", id, (Response: string) => {
      if (Response == "No") {
        navigate(`/GettingReady/${id}`);
      }
    });
    MainSocket.on(id + "req", (res: { id: string; name: string }) => {
      setEntryRequest((prev) => new Set(prev).add(res));
      setTimeout(() => {
        removeentryrequest(res.id )
      }, 10000);
    });
  }, [MainSocket]);

  function handleaccept(candidateid: string) {
    console.log(candidateid);
    removeentryrequest(candidateid)
    MainSocket?.emit(`letThisGuyin`, candidateid, id);
  }
  function  removeentryrequest(candidateid:string){
    setEntryRequest((prev) => {
      let set = new Set(prev);
      set.forEach((e) => {
        if (e.id === candidateid) {
          set.delete(e);
        }
      });
      return set;
    });
  }
  return (
    <>
      <div>{id + " " + peerId + " "}</div>

      <div className=" h-full p-2 flex flex-wrap  ">
        <div>
          <video ref={remoteVideoRef} controls></video>
        </div>
        <AnimatePresence>
  {entryRequest &&
    Array.from(entryRequest.values()).map(
      (e: { id: string; name: string }, i) => (
        <motion.div
          initial={{ y: 100 * i, x: 300, opacity: 0 }}
          animate={{ x: 0 , opacity: 1}}
          exit={{ x: 300, opacity: 0}}
          key={e.id} // Key prop should be on the motion.div
          className="w-[300px] h-20 flex top-0 right-0 m-1 justify-center text-white items-center p-4 bg-black rounded-full fixed"
        >
          <p>{e.name} wants to connect (Ignore to refuse)</p>
          <button
            onClick={() => handleaccept(e.id)}
            className="bg-white text-black font-semibold whitespace-nowrap p-1 rounded-md"
          >
            Let in
          </button>
        </motion.div>
      )
    )}
</AnimatePresence>

      </div>
      <VideoDisplayCallRoom />
    </>
  );
};

export default CallRoom;
