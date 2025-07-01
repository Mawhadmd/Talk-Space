# TalkSpace
I was inspired to undertake this project by my previous chat application, Chatty. Surprisingly, this project didn’t take much time (But it took much brain power), and I found it quite enjoyable since it was based on the earlier one. I utilized React for the front end, along with TypeScript, Tailwind CSS, Peer.js, and Express.js (Socket.io) for the back end.

## How to use:

1. Generate Code and Create a Room
2. Invite people
3. People will start joining, and you'll have to select how to get in
4. You can chat using the chat on the side of the screen
5. You can disable/enable video or audio.
6. You can only invite 10 people, or else the server (your machine) will start smoking.

Regarding the 6th step, Everyone will have a peer-to-peer connection with everyone else in the room, which could cause performance issues. Therefore, a new approach called SFU (Selective Forwarding Unit) could be used. 

## How to run

1. Clone it
```
git clone https://github.com/Mawhadmd/Talk-Space
cd Talk-Space
```
2. Install dependencies
```
npm install

cd server
npm install

cd ..
```

3. Run it

    1. For client
    ```
    npm run dev
    
    ```

    2. For server (in a new terminal)
    ```
    cd server
    npm run start
    ```

