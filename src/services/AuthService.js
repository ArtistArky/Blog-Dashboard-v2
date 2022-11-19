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
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            scopes: 'https://www.googleapis.com/auth/drive.readonly'
        }
    })
    return {
        data, error
    }
}

export async function sbGoogleSignOut () {
    const signout = await supabaseClient.auth.signOut();
    return signout;
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
