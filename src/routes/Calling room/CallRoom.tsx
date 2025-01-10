import { useEffect, useState } from "react";
import { useParams } from "react-router";

const CallRoom = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState("");
  const { id: roomid } = useParams();
  const requestMediaPermissions = async () => {
    let stream;
    try {
      console.log(navigator.geolocation);
      // Request video and audio permissions
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoElement = document.querySelector("video");
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play(); 
      }
      setPermissionGranted(true);
      setError(""); 
    } catch (err) {
      setPermissionGranted(false);
      setError(
        "Permission denied. Please allow access to your camera and microphone."
      );
    }
  };

  useEffect(() => {
    if(permissionGranted)
    return () => {
      // Cleanup: Stop video and audio tracks when the component unmounts
      const videoElement = document.querySelector("video");
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [permissionGranted]);

  return (
    <div className="h-screen cursor-auto flex flex-col justify-between py-5 items-center">
      <p>Share This ID with friends: {roomid}</p>
      <button
        className="bg-black rounded-full p-4 mt-1 text-white"
        onClick={requestMediaPermissions}
      >
        Turn on Mic and Camera
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <video controls className="absolute -z-10  w-full h-full" />
    </div>
  );
};

export default CallRoom;
