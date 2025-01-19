import { useContext, useEffect, useRef, useState } from "react";

import { AppContext, MediapreferenceContext } from "../../App";
import VideoDisplayCallRoom from "./VideosComponents/VideoDisplayCallRoom";
import { useNavigate, useParams } from "react-router-dom";
import Peer, { MediaConnection } from "peerjs";
import { AnimatePresence, motion } from "motion/react";

const CallRoom = () => {
  const { MainSocket, showAlert, name } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { Audio_Toggle, Video_Toggle } = useContext(MediapreferenceContext);
  const [entryRequest, setEntryRequest] = useState<
    Set<{ id: string; name: string }>
  >(new Set());
  const [peerid, setpeerid] = useState<string | undefined>(undefined);
  const peerinstance = useRef<Peer>();
  const [toggleroomchange, settoggleroomchange] = useState(false);
  const [arrayofstreams, setarrayofstreams] = useState<any[]>([]);
  const [localStream, setlocalStream] = useState<MediaStream>(
    new MediaStream()
  );
  if (localStream.getTracks()) {
    localStream.getTracks().forEach((track) => {
      if (track.readyState == "ended") track.stop();
    });
    console.log(localStream.getTracks());
  }

  useEffect(() => {
    //if video or audio is off then return
    if (!Audio_Toggle && !Video_Toggle) {
      setlocalStream(new MediaStream())
      return;
    }
    var stream: MediaStream;
    const getstream = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: Video_Toggle,
        audio: Audio_Toggle,
      });
      setlocalStream((prev) => {
        prev.getTracks().forEach((track) => track.stop());
        return stream;
      });
    };
    getstream();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [Video_Toggle, Audio_Toggle]);
  //create the peer and receive the call
  useEffect(() => {
    var localstream: null | MediaStream;
    const peer = new Peer();
    peer.on("open", () => {
      setpeerid(peer.id);
    });
    peerinstance.current = peer;
    peer.on("call", (call) => {
      console.log("Incoming call from peer:", call.peer);

      call.answer(); // Answer the call with an A/V stream.
      call.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
        console.log("stream received", arrayofstreams);
        setarrayofstreams((prev) => {
          const existingPeerIndex = prev.findIndex((p) => p.peer === call.peer || call.metadata.name == p.name);
          if (existingPeerIndex !== -1) {
            const updatedStreams = [...prev];
            updatedStreams[existingPeerIndex] = {
              stream: remoteStream,
              peer: call.peer,
              name: call.metadata.name,
            };
            return updatedStreams;
          } else {
            return [
              ...prev,
              {
                stream: remoteStream,
                peer: call.peer,
                name: call.metadata.name,
              },
            ];
          }
        });
      });
    });
    return () => {
      localstream?.getTracks().forEach((track) => {
        track.stop();
      });
      console.log(localstream);
      peer.destroy();
    };
  }, []);

  //Make a call
  useEffect(() => {
    if (!peerid || !MainSocket || !localStream) return;

    var call: MediaConnection;
    const handlePeerSignal = async (remotePeerId: string) => {
      if (Audio_Toggle || Video_Toggle) {
        try {
          if (!peerinstance.current) {
            console.error("Peer instance not initialized");
            return;
          }

          call = peerinstance.current.call(remotePeerId, localStream, {
            metadata: { name: name },
          });

          call.on("error", (err) => {
            console.error("Peer connection error:", err);
            // Handle error (e.g., update UI, try reconnecting)
          });
        } catch (err) {
          console.error("Failed to get local stream", err);
          // Handle error (e.g., show error message to user)
        }
      } else {
        if (!peerinstance.current) {
          console.error("Peer instance not initialized");
          return;
        }
        console.log('calling with an empty Stream')
        call = peerinstance.current.call(remotePeerId, new MediaStream(), {
          metadata: { name: name },
        });
      }
    };

    MainSocket.on("peersignal", handlePeerSignal);

    return () => {
      MainSocket.off("peersignal", handlePeerSignal);
      if (call) call.close();
    };
  }, [peerid, MainSocket, id, localStream]);

  useEffect(() => {
    if (!MainSocket) return;
    MainSocket.on("ToggledMedia", (peerid) => {
      settoggleroomchange((prev) => !prev);
      console.log("someone toggled their media");
      setarrayofstreams((prev) => {
        return prev.map((p) => {
          if (peerid === p.peer) {
        return { ...p, stream: new MediaStream() };
          }
          return p;
        });
      });
    });
    return () => {
      MainSocket.off("ToggledMedia", () => {
        settoggleroomchange((prev) => !prev);
      });
    };
  }, [MainSocket]); //check if others have toggled their audio/media

  useEffect(() => {
    if (!peerid || !id) return;
    MainSocket?.emit("ToggledMedia", id, peerid);
  }, [localStream, id, peerid]); //tells the others if video or audio toggles here

  useEffect(() => {
    if (!MainSocket || !peerid || !id) return;

    const debounceEmit = setTimeout(() => {
      showAlert("sending signal");
      MainSocket.emit("peersignal", peerid, id);
    }, 1000); // Adjust the debounce delay as needed

    return () => clearTimeout(debounceEmit);
  }, [MainSocket, toggleroomchange, peerid, id]);
  useEffect(() => {
    if(!MainSocket) return
    MainSocket.emit('Howmanypeopleintheroom',id,(people_in_this_room:string[])=>{
      let people:any[] = []
      people_in_this_room.forEach((name)=>{
        people.push({stream: new MediaStream(), name: name})
      })
      setarrayofstreams(people)

    })
    return () => {
      
    };
  }, [MainSocket]);
  useEffect(() => {
    if (!MainSocket) return;
    MainSocket?.on("user_gotin", (username: string) => {
      showAlert(username + " has entered");
      settoggleroomchange((prev) => !prev);
    setarrayofstreams((prev) => [
      ...prev,
      {
        stream: new MediaStream(),
        name: username,
      },
    ]);
    });
    MainSocket?.on("user_left", (username) => {
      showAlert(username + " has left");
      setarrayofstreams((prev) => prev.filter((p) => p.name !== username));
      settoggleroomchange((prev) => !prev);
    });
    return () => {
      MainSocket?.off("user_left");
      MainSocket?.off("user_gotin");
    };
  }, [MainSocket]);

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
        removeentryrequest(res.id);
      }, 10000);
    });
    return () => {
      MainSocket?.off(id + "req");
    };
  }, [MainSocket, id, settoggleroomchange, showAlert]); //Authorization and entry requests

  function handleaccept(candidateid: string) {
    try {
      removeentryrequest(candidateid);
      MainSocket?.emit(`letThisGuyin`, candidateid, id);
    } catch {
      alert("error");
    }
  } //Accept a user wanting to get in

  function removeentryrequest(candidateid: string) {
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
      <div>{id + " " + peerid + " "}</div>

      <div className=" h-full p-2 flex flex-wrap  ">
        <div className="flex flex-wrap">
          {arrayofstreams.map((stream, index) => {
            const peername = stream.name;
            const videoTrack = stream.stream.getVideoTracks()[0];
            const audioTrack = stream.stream.getAudioTracks()[0];
            const videoEnabled = videoTrack && videoTrack.readyState === "live";
            const audioEnabled = audioTrack && audioTrack.readyState === "live";

            return (
              <div
                key={index}
                className="relative border-2 w-[300px] h-[300px]"
              >
                {!videoEnabled && !audioEnabled ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    {peername} is not sharing media
                  </div>
                ) : videoEnabled ? (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video) {
                        video.srcObject = stream.stream;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    {audioEnabled
                      ? `${peername} Mic is on`
                      : "This user does not share media"}
                  </div>
                )}
                {videoEnabled && !audioEnabled && (
                  <div className="absolute bottom-0 left-0 bg-black text-white p-1">
                    Mic is off
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {entryRequest &&
            Array.from(entryRequest.values()).map(
              (e: { id: string; name: string }, i) => (
                <motion.div
                  initial={{ y: 100 * i, x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
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
      {localStream && <VideoDisplayCallRoom localStream={localStream} />}
    </>
  );
};

export default CallRoom;
