import { createContext, useContext } from "react";

export const NavContext = createContext({
  nav: 'Hello World', // set a default value
  setNav: () => {},
});

export const useGlobalContext = () => useContext(NavContext);