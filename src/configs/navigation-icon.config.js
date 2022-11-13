import React from 'react'
import {
    HiOutlineColorSwatch, 
	HiOutlineDesktopComputer,
    HiOutlineTemplate,
    HiOutlineViewGridAdd,
    HiOutlineHome
} from 'react-icons/hi'

import { BiCategory, BiNavigation, BiUserPin } from "react-icons/bi"

import { GrHome,  GrDocumentImage, GrAnalytics } from "react-icons/gr";

const navigationIcon = {
    home: <GrHome className='opacity-60' />,
    analytics: <GrAnalytics className='opacity-60' />,
    posts: <GrDocumentImage className='opacity-60' />,
    category: <BiCategory />,
    navigation: <BiNavigation />,
    newsletter: <BiUserPin className='opacity-80' />,
}

export default navigationIcon