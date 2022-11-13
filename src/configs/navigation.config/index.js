import { 
    NAV_ITEM_TYPE_TITLE, 
    NAV_ITEM_TYPE_COLLAPSE, 
    NAV_ITEM_TYPE_ITEM 
} from 'constants/navigation.constant'

const navigationConfig = [
    {
        key: 'home',
		path: '/home',
		title: 'Home',
		translateKey: 'nav.home',
		icon: 'home',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [],
        subMenu: []
    },
    /** Example purpose only */
	{
        key: 'analytics',
		path: '/analytics',
		title: 'Analytics',
		translateKey: 'nav.analytics',
		icon: 'analytics',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [],
        subMenu: []
    },
    {
        key: 'posts',
		path: '/posts',
		title: 'Posts',
		translateKey: 'nav.posts',
		icon: 'posts',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [],
        subMenu: []
    },
    {
        key: 'category',
		path: '/category',
		title: 'Category',
		translateKey: 'nav.category',
		icon: 'category',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [],
        subMenu: []
    },
    {
        key: 'navigation',
		path: '/navigation',
		title: 'Navigation',
		translateKey: 'nav.navigation',
		icon: 'navigation',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [],
        subMenu: []
    },
    {
        key: 'newsletter',
		path: '/newsletter',
		title: 'Newsletter',
		translateKey: 'nav.newsletter',
		icon: 'newsletter',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [],
        subMenu: []
    },
]

export default navigationConfig