import { createContext, useContext } from "react";

export const CatContext = createContext({
  category: 'Hello World', // set a default value
  setCategory: () => {},
});

export const useGlobalContext = () => useContext(CatContext);