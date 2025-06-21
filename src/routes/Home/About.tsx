const About: React.FC = () => {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold bebas-neue-regular bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-500 drop-shadow mb-8 text-center">
                About Us
            </h1>
            <div className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-xl border-2 border-yellow-400 p-8 text-xl text-gray-800">
                <p className="mb-6">
                    Welcome to <span className="font-bold text-red-600">TalkSpace</span>! We are dedicated to providing the best video conferencing experience.<br />
                    Our app offers high-quality video and audio, an intuitive interface, and a variety of features to make your meetings more productive and enjoyable.
                </p>
                <p>
                    Our team is constantly working to improve the app and add new features. If you have any feedback or suggestions, please feel free to reach out to us.<br />
                    Thank you for choosing <span className="font-bold text-yellow-500">TalkSpace</span>!
                </p>
            </div>
        </div>
    );
};

export default About;