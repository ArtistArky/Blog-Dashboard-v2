import { createContext, useContext } from "react";

export const PostContext = createContext({
  posts: 'Hello World', // set a default value
  setPosts: () => {},
});

export const useGlobalContext = () => useContext(PostContext);