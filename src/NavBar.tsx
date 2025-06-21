import { Link } from "react-router-dom";

const NavBar = () => {
  const listitems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Our Motive", path: "/motive" },
  ];

  return (
    <>
      <div className="fixed left-8 top-4 text-5xl bebas-neue-regular font-bold bg-clip-text bg-gradient-to-r text-transparent from-yellow-400 via-red-500 to-yellow-500 z-50 drop-shadow-lg select-none transition-transform hover:scale-105">
        TalkSpace
      </div>
      <div className="fixed top-0 w-full max-w-2xl h-16 left-0 right-0 mx-auto bg-black/95 backdrop-blur-md border-b-2 border-yellow-400 rounded-b-3xl shadow-2xl z-40 flex items-center justify-center px-2">
        <ul className="flex gap-4 h-full justify-center items-center w-full">
          {listitems.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={item.name}
                className={`hover:bg-yellow-400 hover:text-black text-yellow-200 rounded-full text-2xl cursor-pointer transition-all px-4 py-2 font-semibold bebas-neue-regular ${
                  isActive ? "bg-yellow-400 !text-black shadow" : ""
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default NavBar;
