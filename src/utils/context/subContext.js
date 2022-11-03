import { createContext, useContext } from "react";

export const SubContext = createContext({
  setLoading: () => {},
  fetchSub: () => {},
});

export const useGlobalContext = () => useContext(SubContext);