import React, { useEffect, useState } from 'react'
import { FormItem, FormContainer, Card, Input, Upload, Select, Button, Tooltip, Avatar, Badge, Notification, toast, Error, Dialog } from 'components/ui'
import { Loading, TextEllipsis, ConfirmDialog, UsersAvatarGroup } from 'components/shared'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
//import Confirmations  from './Confirmations'
import { updateAuthorPosts } from 'store/userData/authorSlice'
import { setPostsData, setEmpty, deletePostData } from 'store/userData/postSlice'
import { setEmptyC } from 'store/userData/categorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sbSelect, sbUpdate, sbStorageDelete, sbUserDataDelete, checkDetails, sbUpload, sbInsert, sbSelectDefault  } from 'services/ApiService'
import axios from "axios"
import { HiOutlinePlus } from 'react-icons/hi'
import { GrTrash, GrEdit, GrSync } from 'react-icons/gr'
import { PostContext, useGlobalContext } from "utils/context/postContext"
import * as Yup from 'yup'
import Compress from "browser-image-compression"
import supabaseClient from 'utils/supabaseClient'

const openNotification = (type, text) => {
	toast.push(
		<Notification type={type}>
			{text}
		</Notification>
	)
}

const validationSchema = Yup.object().shape({
	title:  Yup.string().required('Post title cannot be empty'),
	category: Yup.string().required('Category is required'),
	featuredImg: Yup.string().required('Featured Image is required'),
})

const maxPosts = 2

var inPage = 0, fnPage = maxPosts, postData = [], fihd, fisd, initEditState;

const PostSection = ({data}) => {

	const { setPosts } = useGlobalContext()

	const dispatch = useDispatch()

	const provider = useSelector((state) => state.auth.session.providerToken)
	const authID = useSelector((state) => state.auth.user.id)

	const [syncDisabled, setsyncDisabled] = useState(false)

	const [categoryList, setcategoryList] = useState()
    const [postid, setpostid] = useState()
    const [postTitle, setpostTitle] = useState()
    const [postContent, setpostContent] = useState()
	const [catId, setcatId] = useState("")
    const [confirmdialogOpen, setconfirmdialogOpen] = useState(false)
    const [dialogOpen, setdialogOpen] = useState(false)
	const [fihighRes, setfihighRes] = useState()
	const [filowRes, setfilowRes] = useState()
	const [fiImgUrl, setfiImgUrl] = useState()

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(false)
	const [btnLoading, setbtnLoading] = useState(false)
	const [btnDisabled, setbtnDisabled] = useState(false)

	const navigate = useNavigate()
	
	//test
	const syncPost = (docsid, postTitle, postId) => {
		console.log(postTitle)
		setsyncDisabled(true)
		openNotification('info', 'Syncing....')
		  
		const options = {
		  method: 'GET',
		  url: 'https://stensil-backend.herokuapp.com/api',
		  params: {fileId: docsid, accessToken: provider, title: postId },
		}
		
		axios.request(options).then(async (response) => {
			console.log(response.data)
			await sbUpdate('posts', postTitle, {post: response.data}, 'posttitle').then(({ error, data }) => {
				if(error) throw openNotification('danger', error.message)
				if(data) {
				  console.log(data)
				  openNotification('success', 'Sync Complete')
				  setsyncDisabled(false)
				}
			})
	
		}).catch((error) => {
		  openNotification('danger', error.message)
		  setsyncDisabled(false)
		});
	}
	
	const onCategoryDeleteConfirmationClose = () => {
		setconfirmdialogOpen(false)
	}

    const onCategoryDeleteConfirm = async () => { 
        setconfirmdialogOpen(false)
		console.log(postTitle)
		console.log(postContent)
		console.log(postid)
		deletePosts(postTitle, postContent, postid)
    
    }

	const deletePosts = async (posttitle, post, postid) => {
		setsyncDisabled(true)

		openNotification('info', 'Deleting....')

		const imgRegex = /[\w\.\$]+(?=png|jpeg|jpg|gif)\w*/gi
	
		const mainfolderPath = 'public/'+authID+'/'+postid
		const folderPath = mainfolderPath+'/featuredImg/'+'hd.jpeg'
		const folderPath2 = mainfolderPath+'/featuredImg/'+'sd.jpeg'
	
		var res = post.match(imgRegex)
		console.log(res)
		if(res != null) {
			res = res.map((item) => {
				return mainfolderPath+'/'+item
			});
		}else {
			res = []
		}
		res.push(folderPath, folderPath2)
		console.log(res)

		await sbStorageDelete('posts', res).then(async ({ error, data }) => {
			if(error) throw openNotification('danger', error.message)
			if(data) {
			  await sbUserDataDelete('posts', 'posttitle', posttitle, 'postedby', authID).then(({ error, data }) => {
				if(error) throw openNotification('danger', error.message)
				if(data) {
				  var editedPostdata = [...postData]
				  const findIndex = editedPostdata.findIndex(a => a.posttitle === data[0].posttitle)
				  editedPostdata.splice(findIndex, 1)
				  postData = editedPostdata
				  console.log(postData)
				  setPosts(postData)
				  postData.length === 0 ? dispatch(setEmpty()) : dispatch(deletePostData(data[0]))
				  dispatch(setEmptyC())
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

	const onPostEditDialogClose = () => {
		setdialogOpen(false)
	}

	const getFile = (files, form, field) => {
		  
		setbtnDisabled(true)
		openNotification('info', 'Featured Image conversion is under progress. Please wait before you submit the post')
		const file = files[0]
		const filehdName = 'hd.jpeg'
		const filesdName = 'sd.jpeg'
		const filetype = 'image/jpeg'
		const highresOptions = {
			maxSizeMB: 10,
			fileType: filetype,
		}
		const lowresOptions = {
			maxSizeMB: 0.05,
			maxWidthOrHeight: 320,
			fileType: filetype,
		}
		Compress(file, highresOptions)
		.then(compressedBlob => {
			const convertedBlobFile = new File([compressedBlob], filehdName, { type: filetype, lastModified: Date.now()})
			setfihighRes(convertedBlobFile)
			console.log(convertedBlobFile)
			Compress(file, lowresOptions)
			.then(compressedBlob => {
				const convertedBlobFile = new File([compressedBlob], filesdName, { type: filetype, lastModified: Date.now()})
				const url = URL.createObjectURL(convertedBlobFile)
				setfilowRes(convertedBlobFile)
				setfiImgUrl(url)
				console.log(convertedBlobFile)
				setbtnDisabled(false)
				openNotification('success', 'Featured Image conversion complete. You can now proceed to submit the post')
				form.setFieldValue(field.name, convertedBlobFile)
			})
			.catch(e => {
				console.log(e)
			})

		})
		.catch(e => {
			console.log(e)
		})
	}
	
	const beforeUpload = (file, fileList) => {
		var valid = true;

		console.log(file)
		console.log(fileList)
        const allowedFileType = ['image/jpeg', 'image/png']
        const maxFileSize = 15000000

        if(fileList.length >= 1) {
            return `You can only upload 1 image file`
        }

		if (!allowedFileType.includes(file[0].type)) {
			return 'Please upload a .jpeg or .png file!'
		}

		if(file[0].size >= maxFileSize) {
			return'Upload image cannot more then 150kb!'
		}

		return valid;
    }
	
	const fetchCatList = async() => {
		setLoading(true)

		await sbSelectDefault('category', 'id, title, name', 'createdby', authID).then(({ error, data }) => {

		  if(error) {
			  throw setError(true)
		  }
			
		  if(data) {
			  var catList = [{ value: "255d4855-644e-43ab-829b-16adc417df97", label: 'None' }]
			  data.map((item) => {
				catList.push({ value: item.id, label: item.name })
			  });
			  console.log(catList)
			  setcategoryList(catList)
			  setLoading(false)
		  }

		})

	}

	const setBtn = (state) => {
		setbtnLoading(state)
		setbtnDisabled(state)
	}
	
	const checkImgs = (values) => { 
        var images = [];
        var imagesName = [];
        if(fihighRes) {
          images = [fihighRes, filowRes]
          imagesName = ['hd.jpeg', 'sd.jpeg']
        }
        return {images,imagesName}
    }

	const editPost = async (values) => {
		setBtn(true)
		
		const { title, category } = values
		var postTitle = title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "-").toLowerCase()
		
		openNotification('info', 'Uploading featured Image. Please wait....')

        const {images, imagesName} = checkImgs(values);
        console.log(images);
		
		if(images.length > 0) {
			
			for(var i = 0; i < images.length; i++) {
				const imagepath = 'public/'+authID+'/'+postid+'/featuredImg/'+ imagesName[i]

				await sbUpload('posts', imagepath, images[i]).then(({error, publicURL}) => {
					if(error) {
						setBtn(false)
						openNotification('danger', error.message)
					}
					if(publicURL) {
						const mainurl = publicURL + '?' + new Date().getTime();
						(imagesName[i] === 'hd.jpeg') ? fihd = mainurl : fisd = mainurl
					}
				})

			}
			openNotification('info', 'Featured Image uploaded. Saving the details....')
		}

		console.log(fihd); console.log(fisd)
		
		const postUrl = '/posts/'+postTitle
		
		const { data, error } = await supabaseClient.from('posts').update(
			{ posttitle: postTitle, title: title, category: category, featured_imghd: fihd, featured_imgsd: fisd, href: postUrl }
		)
		.eq('id', postid)
		.eq('postedby', authID);
		if(error) {
			setBtn(false)
			openNotification('danger', error.message)
		}
		if(data) {
			openNotification('success', "Saved successfully")
			onPostEditDialogClose()
			window.location.reload()
		}
	}

	return (
		<div className="mb-6">
			<div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
				
                <Dialog
                    isOpen={dialogOpen}
                    onClose={onPostEditDialogClose}
                    onRequestClose={onPostEditDialogClose}
                >
                    <h5 className="mb-4">Edit Post</h5>
                    <div>
                        <Formik
							initialValues={initEditState}
							enableReinitialize
							validationSchema={validationSchema}
							onSubmit={(values) => editPost(values)}
						>
							{({values, touched, errors, isSubmitting, resetForm}) => {
								const validatorProps = {touched, errors}
								return (
									<Form>
										<FormContainer>
											<FormRow name="title" label="Post Title" {...validatorProps} border={false} >
												<Field
													type="text" 
													autoComplete="off" 
													name="title" 
													placeholder="Title" 
													component={Input}
												/>
											</FormRow>
											<FormRow className="-m-10" name="category" label="Category" {...validatorProps} >
												<Field name="category">
													{({ field, form }) => (
													<Select
														options={categoryList}
														placeholder="Select"
														defaultValue={categoryList[0]}
														onFocus={fetchCatList}
														isLoading={loading}
														onChange={option => {
															setcatId(option.value)
															form.setFieldValue(field.name, option.value)
														}}
													/>
													)}
												</Field>
											</FormRow>
											<FormRow name="featuredImg" label="Featured Image" {...validatorProps} >
												<Field name="featuredImg">
													{({ form, field }) => ( 
														<Upload 
															className="cursor-pointer" 
															showList={true}
															accept=".jpg,.jpeg,.png"
															beforeUpload={(file, fileList) => beforeUpload(file, fileList)}
															onFileRemove={() => {
																form.setFieldValue(field.name, '')
																setfiImgUrl()
															}}
															onChange={(file)=> getFile(file, form, field)} 
														>
															<Avatar size={60} src={fiImgUrl} icon={<HiOutlinePlus />} />
														</Upload>
													)}
												</Field>
											</FormRow>
											<div className="mt-4 ltr:text-right">
												<Button disabled={btnDisabled} variant="solid" loading={btnLoading} type="submit">
													Save
												</Button>
											</div>
										</FormContainer>
									</Form>
								)
							}}
						</Formik>
                    </div>
                </Dialog>
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
										onClick={() => {
											setpostTitle(article.posttitle)
											setpostContent(article.post)
											setpostid(article.id)
											setconfirmdialogOpen(true)
										}}
										icon={<GrTrash className='opacity-70' />} 
									/>
								</Tooltip>
								<Tooltip title="Edit">
									<Button 
										shape="circle" 
										variant="plain"
										size="sm" 
										disabled={syncDisabled}
										onClick={() => {
											const { id, title, category, featured_imghd, featured_imgsd } = article
											setpostid(id)
											setpostTitle(title)
											setcategoryList([{ value: category.id, label: category.name === "Uncategorized" ? "None" : category.name }])
											setfiImgUrl(featured_imghd)
										    initEditState = {
												title: title,
												category: category.id,
												featuredImg: featured_imghd
											}
											fihd = featured_imghd; fisd = featured_imgsd;
											setdialogOpen(true)
										}}
										icon={<GrEdit className='opacity-70' />} 
									/>
								</Tooltip>
								<Tooltip title="Sync">
									<Button 
										shape="circle" 
										variant="plain" 
										size="sm"
										disabled={syncDisabled}
										onClick={() => syncPost(article.docsid, article.posttitle, article.id)}
										icon={<GrSync className='opacity-70' />} 
									/>
								</Tooltip>
							</div>
						</div>
					</Card>
				))}
                <ConfirmDialog
                    isOpen={confirmdialogOpen}
                    onClose={onCategoryDeleteConfirmationClose}
                    onRequestClose={onCategoryDeleteConfirmationClose}
                    type="danger"
                    title="Delete Post"
                    onCancel={onCategoryDeleteConfirmationClose}
                    onConfirm={onCategoryDeleteConfirm}
                    confirmButtonColor="red-600"
                >
                    <p>
                        Are you sure you want to delete this post?
                        Note:- This action cannot be undone.
                    </p>
                </ConfirmDialog>
			</div>
		</div>
	)
}

const Articles = () => {

	const dispatch = useDispatch()
	
	const userPosts = useSelector((state) => state.userData.posts)
	const authID = useSelector((state) => state.auth.user.id)
	const authorPosts = useSelector((state) => state.userData.author.posts)

	const [posts, setPosts] = useState() 

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(true)
	const [btnLoading, setbtnLoading] = useState(false)

	useEffect(() => {
		console.log("userPosts", userPosts)
		console.log("authorPosts", authorPosts)
		//dispatch(setEmpty())
		if(userPosts.length === 0) {
			inPage = 0; fnPage = maxPosts;
			fetchPosts()
		}else {
			setLoading(true)
			inPage = userPosts.length
			fnPage = userPosts.length + maxPosts
			console.log(inPage)
			console.log(fnPage)
			postData = userPosts
			setPosts(postData)
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
				setPosts(postData)
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
				<PostContext.Provider value={{ posts, setPosts }}>
					<PostSection data={posts} />
				</PostContext.Provider>
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