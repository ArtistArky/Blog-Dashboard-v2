import React from "react";

import {
  BiCategory,
  BiNavigation,
  BiUserPin,
  BiHome,
  BiBarChartAlt2,
  BiDetail,
} from "react-icons/bi";

const navigationIcon = {
  home: <BiHome />,
  analytics: <BiBarChartAlt2 />,
  posts: <BiDetail />,
  category: <BiCategory />,
  navigation: <BiNavigation />,
  newsletter: <BiUserPin className="opacity-80" />,
};

export default navigationIcon;
