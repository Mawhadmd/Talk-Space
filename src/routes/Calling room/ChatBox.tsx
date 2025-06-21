import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export const ChatBox = ({
  MainSocket,
  roomid,
}: {
  MainSocket: Socket;
  roomid: string;
}) => {
  const [InputValue, SetInputValue] = useState<string>("");
  const [Messages, setMessages] = useState<{ message: string; sid: string }[]>(
    []
  );
  const handlekeypress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handlesend(InputValue);
    }
  };

  useEffect(() => {
    MainSocket.on("MessageIncoming", (MessagesUpdate) => {
      setMessages(MessagesUpdate);
    });
    MainSocket.emit("GetMessages", roomid, (MessagesUpdate: any) => {
      setMessages(MessagesUpdate);
    });
    return () => {
      MainSocket.off("MessageIncoming");
    };
  }, [MainSocket]);

  const handlesend = (InputValue: string) => {
    MainSocket.emit("SendingMessage", InputValue, roomid);
    SetInputValue("");
  };
  return (
    <>
      <div className="m-1 h-full flex flex-col w-full">
        <p className="font-bold text-lg text-yellow-700 mb-1">Chat</p>
        <hr className="border-yellow-400 mb-2" />
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 !w-full">
          {Messages.map(({ sid, message }, idx) => {
            if (sid === MainSocket.id) {
              return (
                <div
                  key={idx}
                  className="self-start content-start bg-gradient-to-r from-yellow-400 to-red-400 text-white px-3 py-2 rounded-2xl shadow-sm max-w-[80%] break-words"
                >
                  {message}
                </div>
              );
            } else {
              return (
                <div
                  key={idx}
                  className="self-end bg-gray-200 text-black px-3 py-2 rounded-2xl shadow-sm max-w-[80%] break-words"
                >
                  {message}
                </div>
              );
            }
          })}
        </div>
      </div>
      <div className="m-1 flex relative mt-2">
        <input
          value={InputValue}
          onChange={(e) => {
            SetInputValue(e.target.value);
          }}
          onKeyDown={handlekeypress}
          type="text"
          className="border-2 border-yellow-400 rounded-l-2xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black bg-white"
          placeholder="Type a message..."
        />
        <button
          onClick={() => handlesend(InputValue)}
          className="right-0 absolute p-2 h-full bg-gradient-to-r from-yellow-400 to-red-400 text-white rounded-r-2xl font-bold hover:from-yellow-500 hover:to-red-500 transition-all"
        >
          Send
        </button>
      </div>
    </>
  );
};
