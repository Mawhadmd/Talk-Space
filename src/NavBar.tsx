
import {Link } from 'react-router';

const NavBar = () => {
    const listitems = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Our Motive", path: "/motive" },
      ];
    
    return (
        <div className="fixed top-0 left-0 right-0 h-12 w-screen bg-black">
        <ul className="flex gap-2 h-full justify-center items-center w-full">
          {listitems.map((item) => {
            return (
              <Link
                to={{ pathname: item.path }}
                key={item.name}
                className="hover:bg-white hover:text-black  text-white 0 rounded-full cursor-pointer transition-all p-2"
              >
                {item.name}
              </Link>
            );
          })}
        </ul>
      </div>
    );
}

export default NavBar;
