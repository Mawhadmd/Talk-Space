import React from 'react';

const WaitingRoom: React.FC = () => {
    return (
        <div className="cursor-auto flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold mb-4">Waiting Room</h1>
                <p className="text-gray-700 mb-4">Please wait, the meeting will start shortly.</p>
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin mx-auto"></div>
            </div>
        </div>
    );
};

export default WaitingRoom;