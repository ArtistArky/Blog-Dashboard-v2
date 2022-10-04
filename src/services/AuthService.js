import ApiService from './ApiService'
import supabaseClient from 'utils/supabaseClient';

export async function apiSignIn (data) {
    return ApiService.fetchData({
        url: '/sign-in',
        method: 'post',
        data
    })
}

export async function sbGoogleSignin () {
    const { user, session, error } = await supabaseClient.auth.signIn({
        provider: 'google'
    },
    {
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
    })
    return {
        user, session, error
    }
}

export async function apiSignUp (data) {
    return ApiService.fetchData({
        url: '/sign-up',
        method: 'post',
        data
    })
}

export async function apiSignOut (data) {
    return ApiService.fetchData({
        url: '/sign-out',
        method: 'post',
        data
    })
}

export async function apiForgotPassword (data) {
    return ApiService.fetchData({
        url: '/forgot-password',
        method: 'post',
        data
    })
}

export async function apiResetPassword (data) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data
    })
}
