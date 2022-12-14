import React from 'react'
import authRoute from './authRoute'
import pagesRoute from './pagesRoute'
import { APP_PREFIX_PATH } from 'constants/route.constant'

export const publicRoutes = [
    ...authRoute
]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: React.lazy(() => import('views/Home')),
        authority: [],
    },
    /** Example purpose only */
    {
        key: 'analytics',
        path: '/analytics',
        component: React.lazy(() => import('views/demo/Analytics')),
        authority: [],
    },
    {
        key: 'posts',
        path: '/posts',
        component: React.lazy(() => import('views/demo/Posts')),
        authority: [],
    },
    {
        key: 'category',
        path: '/category',
        component: React.lazy(() => import('views/demo/Category')),
        authority: [],
    },
    {
        key: 'navigation',
        path: '/navigation',
        component: React.lazy(() => import('views/demo/Navigation')),
        authority: [],
    },
    {
        key: 'newsletter',
        path: '/newsletter',
        component: React.lazy(() => import('views/demo/Newsletter')),
        authority: [],
    },
    {
        key: 'collapseMenu.item1',
        path: '/collapse-menu-item-view-1',
        component: React.lazy(() => import('views/demo/CollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'collapseMenu.item2',
        path: '/collapse-menu-item-view-2',
        component: React.lazy(() => import('views/demo/CollapseMenuItemView2')),
        authority: [],
    },
    {
        key: 'groupMenu.single',
        path: '/group-single-menu-item-view',
        component: React.lazy(() => import('views/demo/GroupSingleMenuItemView')),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: React.lazy(() => import('views/demo/GroupCollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: React.lazy(() => import('views/demo/GroupCollapseMenuItemView2')),
        authority: [],
    },
    {
        key: 'appsAccount.settings',
        path: `${APP_PREFIX_PATH}/account/settings/profile`,
        component: React.lazy(() => import('views/demo/Profile')),
        authority: [],
    },
    {
        key: 'apps.createpost',
        path: `${APP_PREFIX_PATH}/create-post`,
        component: React.lazy(() => import('views/demo/CreatePost')),
        authority: [],
    },
    ...pagesRoute,
]