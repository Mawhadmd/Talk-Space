import { useContext, useEffect, useRef, useState } from "react";

import { AppContext, MediapreferenceContext } from "../../App";
import VideoDisplayCallRoom from "./VideosComponents/VideoDisplayCallRoom";
import { useNavigate, useParams } from "react-router-dom";
import Peer, { MediaConnection } from "peerjs";
import { EntryRequestNotification } from "./EntryRequestNotification";
import { ChatBox } from "./ChatBox";

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
      setlocalStream(new MediaStream());
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
          const existingPeerIndex = prev.findIndex(
            (p) => p.peer === call.peer || call.metadata.name == p.name
          );
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
    if (!peerid || !localStream) return;

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
        console.log("calling with an empty Stream");
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
    if (!peerid || !id) return;

    const debounceEmit = setTimeout(() => {
      console.log("sending signal");
      MainSocket.emit("peersignal", peerid, id);
    }, 1000); // Adjust the debounce delay as needed
    return () => clearTimeout(debounceEmit);
  }, [toggleroomchange, peerid, id]);

  useEffect(() => {
    MainSocket.emit(
      "Howmanypeopleintheroom",
      id,
      (people_in_this_room: string[]) => {
        let people: any[] = [];
        people_in_this_room.forEach((name) => {
          people.push({ stream: new MediaStream(), name: name });
        });
        setarrayofstreams(people);
      }
    );
    return () => {};
  }, [MainSocket]);

  useEffect(() => {
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
    MainSocket.emit("Authorized", id, (Response: string) => {
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
      <EntryRequestNotification
        handleaccept={handleaccept}
        entryRequest={entryRequest}
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-white via-yellow-50 to-red-100 flex flex-col lg:flex-row items-start justify-center p-4 relative">
        <div className="flex flex-wrap w-full lg:w-[80%] gap-4 justify-center items-start">
          {arrayofstreams.map((stream, index) => {
            const peername = stream.name;
            const videoTrack = stream.stream.getVideoTracks()[0];
            const audioTrack = stream.stream.getAudioTracks()[0];
            const videoEnabled = videoTrack && videoTrack.readyState === "live";
            const audioEnabled = audioTrack && audioTrack.readyState === "live";

            return (
              <div
                key={index}
                className="relative border border-yellow-300 rounded-lg w-[280px] h-[220px] bg-white/80 shadow-sm overflow-hidden flex items-center justify-center"
              >
                {!videoEnabled && !audioEnabled ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-yellow-700 text-base font-semibold">
                    <span className="mb-1">{peername}</span>
                    <span>is not sharing media</span>
                  </div>
                ) : videoEnabled ? (
                  <video
                    className="w-full h-full object-cover rounded-lg border-none"
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video) {
                        video.srcObject = stream.stream;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-yellow-700 text-base font-semibold">
                    <span className="mb-1">{peername}</span>
                    <span>
                      {audioEnabled
                        ? `Mic is on`
                        : "This user does not share media"}
                    </span>
                  </div>
                )}
                {videoEnabled && !audioEnabled && (
                  <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold shadow-sm">
                    Mic is off
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 right-0 m-6 flex flex-col gap-4 items-end z-20">
          <div className="border-yellow-200 border bg-white/90 rounded-lg shadow p-3 flex flex-col items-center w-full max-w-xs">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showAlert("Link copied to clipboard");
              }}
              className="mb-3 text-base bg-gradient-to-r from-green-500 to-yellow-300 rounded w-full p-2 hover:from-green-400 hover:to-yellow-400 text-white font-bold shadow-sm transition-all"
            >
              Invite People
            </button>
            {id && <ChatBox MainSocket={MainSocket} roomid={id} />}
          </div>
          {localStream && <VideoDisplayCallRoom localStream={localStream} />}
        </div>
      </div>
    </>
  );
};

export default CallRoom;
