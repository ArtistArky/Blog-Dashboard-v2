import React, { useEffect, useState } from 'react'
import { Card, Button, Tooltip, Avatar, Badge, Notification, toast, Error } from 'components/ui'
import { Loading, TextEllipsis, UsersAvatarGroup } from 'components/shared'
//import Confirmations  from './Confirmations'
import { updateAuthorPosts } from 'store/userData/authorSlice'
import { setPostsData, setEmpty, deletePostData } from 'store/userData/postSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sbSelect, sbUpdate, sbStorageDelete, sbUserDataDelete } from 'services/ApiService'
import axios from "axios"
import { HiOutlinePlus } from 'react-icons/hi'
import { GrTrash, GrSync } from 'react-icons/gr'
import supabaseClient from 'utils/supabaseClient'

const openNotification = (type, text) => {
	toast.push(
		<Notification closable duration={0} type={type}>
			{text}
		</Notification>
	)
}

const maxPosts = 2

var inPage = 0, fnPage = maxPosts, postData = []

const PostSection = ({data}) => {

	const dispatch = useDispatch()

	const provider = useSelector((state) => state.auth.session.providerToken)
	const authID = useSelector((state) => state.auth.user.id)

	const [syncDisabled, setsyncDisabled] = useState(false)

	const navigate = useNavigate()

	const syncPost = (docsid, postTitle) => {
		console.log(postTitle)
		setsyncDisabled(true)
		openNotification('info', 'Syncing....')
		  
		const options = {
		  method: 'GET',
		  url: 'https://stensil-backend.herokuapp.com/api',
		  params: {fileId: docsid, accessToken: provider, title: postTitle },
		}
		
		axios.request(options).then(async (response) => {
			console.log(response.data)
			await sbUpdate('posts', postTitle, {post: response.data}, 'posttitle').then(({ error, data }) => {
				if(error) throw openNotification('error', error.message)
				if(data) {
				  console.log(data)
				  openNotification('success', 'Sync Complete')
				  setsyncDisabled(false)
				}
			})
	
		}).catch((error) => {
		  openNotification('error', error.message)
		  setsyncDisabled(false)
		});
	}
	
	const deletePosts = async (posttitle, post) => {
		setsyncDisabled(true)

		openNotification('info', 'Deleting....')

		const imgRegex = /[\w\.\$]+(?=png|jpeg|jpg|gif)\w*/gi
	
		const mainfolderPath = 'public/'+authID+'/'+posttitle
		const folderPath = mainfolderPath+'/featuredImg/'+'hd.jpeg'
		const folderPath2 = mainfolderPath+'/featuredImg/'+'sd.jpeg'
	
		var res = post.match(imgRegex)
		res = res.map((item) => {
		  return mainfolderPath+'/'+item
		});
		res.push(folderPath, folderPath2)
		console.log(res)

		await sbStorageDelete('posts', res).then(async ({ error, data }) => {
			if(error) throw openNotification('error', error.message)
			if(data) {
			  await sbUserDataDelete('posts', 'posttitle', posttitle, 'postedby', authID).then(({ error, data }) => {
				if(error) throw openNotification('error', error.message)
				if(data) {
				  var editedPostdata = [...postData]
				  const findIndex = editedPostdata.findIndex(a => a.posttitle === data[0].posttitle)
				  editedPostdata.splice(findIndex, 1)
				  postData = editedPostdata
				  console.log(postData)
				  postData.length === 0 ? dispatch(setEmpty()) : dispatch(deletePostData(data[0]))
				  inPage = postData.length; fnPage = postData.length + maxPosts;
				  openNotification('success', 'Delete Complete')
				  console.log(inPage)
				  console.log(fnPage)
				  setsyncDisabled(false)
				}
			  })
			  
			}
		})
		
	} 

	return (
		<div className="mb-6">
			<div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
				<Card
					className="group flex justify-center items-center border-dashed border-2 border-gray-400 hover:border-indigo-600" 
					clickable
					onClick={() => navigate('/app/create-post')}
				>
					<div className="flex flex-col justify-center items-center py-5">
						<div className="p-4 border-2 border-dashed rounded-full border-gray-400 dark:border-gray-600 group-hover:border-indigo-600">
							<HiOutlinePlus className="text-4xl text-gray-600 dark:text-gray-600 group-hover:text-indigo-600" />
						</div>
						<p className="mt-5 font-semibold">Add Post</p>
					</div>
				</Card>
				{data?.map(article => (
					<Card bordered key={article.posttitle}>
						<Badge className="mr-4 border border-gray-400" content={article.category.name} innerClass="bg-white text-gray-500" />
						<h6 className="truncate mb-4 mt-5">
							{article.title}
						</h6>
						<p className="truncate mb-4 mt-5 font-semibold">
							{ new Date(article.created_at).toLocaleString('en-us',{month:'short', day:'numeric', year:'numeric'}) }
						</p>
						<div className=" h-40 pr-100">
							<TextEllipsis className="pr-10" text={article.post.replace(/<[^>]*>?/gm, '')} maxTextCount={120} />
						</div>
						<div className="flex items-center justify-between mt-4">
							<Avatar className="mr-4" src={article.featured_imgsd} />
							<div className="flex">
								<Tooltip title="Delete">
									<Button 
										shape="circle" 
										variant="plain"
										size="sm" 
										disabled={syncDisabled}
										onClick={() => deletePosts(article.posttitle, article.post)}
										icon={<GrTrash className='opacity-70' />} 
									/>
								</Tooltip>
								<Tooltip title="Sync">
									<Button 
										shape="circle" 
										variant="plain" 
										size="sm"
										disabled={syncDisabled}
										onClick={() => syncPost(article.docsid, article.posttitle)}
										icon={<GrSync className='opacity-70' />} 
									/>
								</Tooltip>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}

const Articles = () => {

	const dispatch = useDispatch()
	
	const userPosts = useSelector((state) => state.userData.posts)
	const authID = useSelector((state) => state.auth.user.id)
	const authorPosts = useSelector((state) => state.userData.author.posts)

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(true)
	const [btnLoading, setbtnLoading] = useState(false)

	useEffect(() => {
		console.log("userPosts", userPosts)
		console.log("authorPosts", authorPosts)
		//dispatch(setEmpty())
		if(userPosts.length === 0 && inPage == 0) {
			fetchPosts()
		}else {
			setLoading(true)
			inPage = userPosts.length
			fnPage = userPosts.length + maxPosts
			console.log(inPage)
			console.log(fnPage)
			postData = userPosts
			console.log(postData)
			setLoading(false)
		}
		
	}, [])
	
	const fetchPosts = async () => {

		console.log(authID)
		await sbSelect('posts', '*, authors!inner(*), category!inner(*)', 'postedby', authID, inPage, fnPage).then(({ data, error }) => {
			if(error) {
				throw setError(true)
			}
			if(data.length === 0) {
				openNotification('info', 'No Posts to show')
				setLoading(false)
			}else if(data) {
				postData = inPage === 0 ? [...data] : [...postData, ...data]
				dispatch(setPostsData(postData)) 
				dispatch(updateAuthorPosts(data[0].authors.posts)) 
				inPage = postData.length; fnPage = postData.length + maxPosts;
				console.log(inPage)
				console.log(fnPage)
				setLoading(false)
			}
		})
	}

	const onArticleAdd = () => {
	}


	if(error === true) {

		return (
			<Error />
		)

	}else { 

		return (
			<Loading loading={loading}>
				<PostSection data={postData} />
				{
					authorPosts > maxPosts && (
						<div className="flex items-center justify-center mt-4">
							<div className="flex">
								<Button 
									shape="circle" 
									variant="plain" 
									size="sm"
									loading={btnLoading}
									onClick={() => {
										setbtnLoading(true)
										fetchPosts().then(() => {
											setbtnLoading(false)
										})
									}}
								>
									Show More
								</Button>	
							</div>
						</div>
					)
				}
				{/* <Confirmations data={categorizedArticles} /> */}
			</Loading>
		)
	}
}

export default Articles