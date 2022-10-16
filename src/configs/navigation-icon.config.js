import React from 'react'
import {
    HiOutlineColorSwatch, 
	HiOutlineDesktopComputer,
    HiOutlineTemplate,
    HiOutlineViewGridAdd,
    HiOutlineHome
} from 'react-icons/hi'

import { BiCategory } from "react-icons/bi"

import { GrHome,  GrDocumentImage } from "react-icons/gr";

const navigationIcon = {
    home: <GrHome className='opacity-60' />,
    posts: <GrDocumentImage className='opacity-60' />,
    category: <BiCategory />,
    collapseMenu: <HiOutlineTemplate />,
    groupSingleMenu: <HiOutlineDesktopComputer />,
    groupCollapseMenu: <HiOutlineColorSwatch />
}

export default navigationIcon