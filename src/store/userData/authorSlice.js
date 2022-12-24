import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  id: "",
  username: null,
  posts: 0,
  category: 0,
  created_at: "",
  email: "",
  full_name: "",
  avatar_url: "",
  href: "",
  title: "",
  description: "",
  logoimg: "",
  faviconimg: "",
  onboard: false,
  aurl: "",
  cus_domain: null,
  cus_domain_d: [
    { name: "API Hit", status: false },
    { name: "DNS", status: false },
    { name: "Resolving", status: false },
    { name: "SSL", status: false },
  ],
  prev_name: null,
  metatitle: "",
};

export const authorSlice = createSlice({
  name: "userData/author",
  initialState,
  reducers: {
    setAuthorData: (_, action) => action.payload,
    updateAuthorData: (state, action) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.username = action.payload.username;
      state.logoimg = action.payload.logoimg;
      state.faviconimg = action.payload.faviconimg;
      state.aurl = action.payload.aurl;
      state.metatitle = action.payload.metatitle;
    },
    updateAuthorPosts: (state, action) => {
      state.posts = action.payload;
    },
    updateAuthorCategory: (state, action) => {
      state.category = action.payload;
    },
    updateOnboard: (state, action) => {
      state.onboard = action.payload;
    },
    updateCusDomain: (state, action) => {
      state.username = action.payload.username;
      state.cus_domain = action.payload.cus_domain;
      state.prev_name = action.payload.prev_name;
    },
    updateCusDomainD: (state, action) => {
      state.cus_domain_d = action.payload.cus_domain_d;
    },
    setEmptyA: () => initialState,
  },
});

export const {
  setAuthorData,
  updateAuthorData,
  updateAuthorPosts,
  updateAuthorCategory,
  updateOnboard,
  updateCusDomain,
  updateCusDomainD,
  setEmptyA,
} = authorSlice.actions;

export default authorSlice.reducer;
