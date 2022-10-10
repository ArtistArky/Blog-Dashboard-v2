import BaseService from './BaseService'
import supabaseClient from 'utils/supabaseClient';

const ApiService = {
    fetchData(param) {
        return new Promise((resolve, reject) => {
            BaseService(param).then(response => {
                resolve(response)
            }).catch(errors => {
                reject(errors)
            })
        })
    }
}

export async function sbAuthor(authId) {
    const { data, error } = await supabaseClient
      .from('authors')
      .select(`*`)
      .eq('id', authId)
      
    return { error, data };
}

export async function sbUpload(bucket, imagepath, image) {
    const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(imagepath, image, {
        upsert: true,
    });

    if(error) {
        return error
    }
    if(data) {
        const { publicURL, error } = await supabaseClient.storage
          .from(bucket)
          .getPublicUrl(imagepath);

        return { error, publicURL };
    }
}

export async function sbProfileUpdate(authId, updateData) {
    const { data, error } = await supabaseClient.from('authors').update(updateData).eq('id', authId);
      
    return { error, data };
}

export async function checkDetails(user, type, query, table) {
    const { data, error } = await supabaseClient
        .from(table)
        .select(query)
        .eq(type, user)
        .single();
      
    if(error) return error;
    else return data;
}

export async function postInsert(insertData) {
    const { data, error } = await supabaseClient.from('posts').insert(insertData, { upsert: true });
      
    return { error, data };
}

export default ApiService