import React, { useState } from 'react'
import { 
    InputGroup, 
	Input, 
	Avatar,
	Upload,
	Button,
	Select,
	Notification, 
	toast,
	FormContainer 
} from 'components/ui'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import { Field, Form, Formik } from 'formik'
import { 
	HiOutlineMail, 
	HiCheck,
    HiOutlinePlus,
} from 'react-icons/hi'
import * as Yup from 'yup'
import { checkDetails, sbUpload, postInsert } from 'services/ApiService'
import useDrivePicker from 'react-google-drive-picker'
import Compress from "browser-image-compression"
import axios from "axios"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const { Addon } = InputGroup 

const validationSchema = Yup.object().shape({
	title:  Yup.string().required('Post title cannot be empty').matches(
		/^([A-Za-z0-9- ]){3,30}$/,
		"Post Title can only contain alphabets & digits with a reange of 3-30 characters"
	),
	category: Yup.string().required('Category is required'),
	featuredImg: Yup.string().required('Featured Image is required'),
})


var fihd, fisd;

const colourOptions = [
	{ value: '622832a5-a4f1-4c2e-96e7-380b9c9b8631', label: 'test3' },
	{ value: 'bc308b88-5727-4813-9bf4-bee2abaad94b', label: 'test' },
	{ value: '7370f1af-1d4c-40b4-9979-601e093e48fc', label: 'test2' },
]

const CreatePost = ({data}) => {
    
    const navigate = useNavigate()

	const [openPicker, authResponse] = useDrivePicker(); 

	const { username } = useSelector((state) => state.userData.author)
	const authID = useSelector((state) => state.auth.user.id)
	const provider = useSelector((state) => state.auth.session.providerToken)

	const [postTitle, setpostTitle] = useState("")
	const [docs, setDocs] = useState()
	const [docsName, setdocsName] = useState("Select your Google Docs from your Google Account")
	const [postmetaCon, setpostmetaCon] = useState(false)
	const [fihighRes, setfihighRes] = useState()
	const [filowRes, setfilowRes] = useState()

	const [btnLoading, setbtnLoading] = useState(false)
	const [btnDisabled, setbtnDisabled] = useState(false);

	const openNotification = (type, text) => {
		toast.push(
			<Notification type={type}>
				{text}
			</Notification>
		)
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

	const createPicker = () => {
		if(provider) {
		  openPicker({
			clientId: process.env.REACT_GAUTHDOCS_CLIENTID,
			developerKey: "AIzaSyB-1hDSWdCbUqyRPIZ1x77brHFkO8xR8fc",
			viewId: "DOCUMENTS",
			token: provider,
			showUploadView: false,
			showUploadFolders: true,
			supportDrives: true,
			multiselect: false,
			callbackFunction: (data) => {
			  if (data.action === 'cancel') {
				console.log('User clicked cancel/close button')
			  }else if (data.action === 'picked') {
				setDocs(data.docs[0].id)
				setdocsName(data.docs[0].name + ' Selected')
				console.log(data.docs[0].id)
				console.log(provider)
				setpostTitle(data.docs[0].name)
				setpostmetaCon(true)
			  }
			  console.log(data)
			},
		  })
		}
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
				setfilowRes(convertedBlobFile)
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

	const setBtn = (state) => {
		setbtnLoading(state)
		setbtnDisabled(state)
	}

	const createPost = async (values) => {
		setBtn(true)

		const { title, category } = values

		var postTitle = title.replace(/ /g, "-").toLowerCase()
		
		const options = {
			method: 'GET',
			url: 'https://stensil-backend.herokuapp.com/api',
			params: {fileId: docs, accessToken: provider, title: postTitle, authid: authID },
		}

		await checkDetails(postTitle, "posttitle", "posttitle", "posts").then(async (res) => { 
			if(res.posttitle == postTitle){
				setBtn(false)
				openNotification('danger', 'Title already exists. Choose a different title')
			}else if(res.code && res.code == "PGRST116") { 
				
				openNotification('info', 'Conversion of Google Docs file id to blog post is under process....')

				axios.request(options).then(async (response) => {
					console.log(response.data)
					openNotification('success', 'Conversion of Google Docs file id to blog post completed. Uploading featured image....')

					const images = [fihighRes, filowRes]
					const imagesName = ['hd.jpeg','sd.jpeg']

					for(var i = 0; i < images.length; i++) {
						const imagepath = 'public/'+authID+'/'+postTitle+'/featuredImg/'+ imagesName[i]

						await sbUpload('posts', imagepath, images[i]).then(({error, publicURL}) => {
							if(error) {
								setBtn(false)
								openNotification('danger', error.message)
							}
							if(publicURL) {
							  (imagesName[i] === 'hd.jpeg') ? fihd = publicURL : fisd = publicURL
							}
						})

					}
					openNotification('info', 'Featured Image uploaded. Saving the details....')

					console.log(fihd); console.log(fisd);

					const postUrl = '/posts/'+postTitle

					const insertData = [
					  { posttitle: postTitle, title: title, category: category, post: response.data, featured_imghd: fihd, featured_imgsd: fisd, postedby: authID, docsid: docs, href: postUrl },
					]

					await postInsert(insertData).then(({ error, data }) => {
						if(error) {
							setBtn(false)
							openNotification('danger', error.message)
						}
						if(data) {
							setBtn(false)
							openNotification('success', 'Post Created successfully....')
							navigate('/home')
						}
					})

				}).catch((error) => {
					setBtn(false)
					console.log("Test")
					console.log(error)
					openNotification('danger', error.message)
				});

			}
		});
		  
	}

	return (
		<>
		<FormDesription 
			title="Create New Post"
			desc=""
		/>
		<div className='grid grid-flow-row-dense md:grid-cols-2 gap-4 mt-10 mb-10 cursor-pointer' >
			<div>
				<p className='font-semibold'>Google Docs</p>
			</div>
			<div onClick={createPicker} className="col-span-2 mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-md">
				<div className="space-y-1 text-center">
				<img className="mx-auto h-12 w-12 text-neutral-400" alt="svgImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMjUiIGhlaWdodD0iMjUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIHRyYW5zZm9ybT0iIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBmb250LWZhbWlseT0ibm9uZSIgZm9udC13ZWlnaHQ9Im5vbmUiIGZvbnQtc2l6ZT0ibm9uZSIgdGV4dC1hbmNob3I9Im5vbmUiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMCwxNzJ2LTE3MmgxNzJ2MTcyeiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxwYXRoIGQ9IiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxwYXRoIGQ9IiIgZmlsbD0ibm9uZSI+PC9wYXRoPjxnIGZpbGw9IiM3Nzc3NzciPjxwYXRoIGQ9Ik00OC4xNiwyNC4wOGMtNS43MDAwOCwwIC0xMC4zMiw0LjYxOTkyIC0xMC4zMiwxMC4zMnYxMDMuMmMwLDUuNzAwMDggNC42MTk5MiwxMC4zMiAxMC4zMiwxMC4zMmg3NS42OGM1LjcwMDA4LDAgMTAuMzIsLTQuNjE5OTIgMTAuMzIsLTEwLjMydi02MS41MDM0NGMwLC0xLjgyMzIgLTAuNzI1NjMsLTMuNTc0MzggLTIuMDE1NjMsLTQuODY0MzhsLTQ1LjEzNjU2LC00NS4xMzY1NmMtMS4yOSwtMS4yOSAtMy4wNDExOCwtMi4wMTU2MiAtNC44NjQzOCwtMi4wMTU2MnpNNDguMTYsMjcuNTJoMzQuNHYzNy44NGMwLDUuNzAwMDggNC42MTk5MiwxMC4zMiAxMC4zMiwxMC4zMmgzNy44NHY2MS45MmMwLDMuODAxMiAtMy4wNzg4LDYuODggLTYuODgsNi44OGgtNzUuNjhjLTMuODAxMiwwIC02Ljg4LC0zLjA3ODggLTYuODgsLTYuODh2LTEwMy4yYzAsLTMuODAxMiAzLjA3ODgsLTYuODggNi44OCwtNi44OHpNODYsMjkuOTUyMTlsNDIuMjg3ODEsNDIuMjg3ODFoLTM1LjQwNzgxYy0zLjgwMTIsMCAtNi44OCwtMy4wNzg4IC02Ljg4LC02Ljg4ek02MC4yLDk2LjMyYy0wLjk0OTQ0LDAgLTEuNzIsMC43NzA1NiAtMS43MiwxLjcyYzAsMC45NDk0NCAwLjc3MDU2LDEuNzIgMS43MiwxLjcyaDUxLjZjMC45NDk0NCwwIDEuNzIsLTAuNzcwNTYgMS43MiwtMS43MmMwLC0wLjk0OTQ0IC0wLjc3MDU2LC0xLjcyIC0xLjcyLC0xLjcyek02MC4yLDExNi45NmMtMC45NDk0NCwwIC0xLjcyLDAuNzcwNTYgLTEuNzIsMS43MmMwLDAuOTQ5NDQgMC43NzA1NiwxLjcyIDEuNzIsMS43Mmg1MS42YzAuOTQ5NDQsMCAxLjcyLC0wLjc3MDU2IDEuNzIsLTEuNzJjMCwtMC45NDk0NCAtMC43NzA1NiwtMS43MiAtMS43MiwtMS43MnoiPjwvcGF0aD48L2c+PC9nPjwvZz48L3N2Zz4="/>
					<p className="text-xs text-neutral-500">
					 {docsName}
					</p>
				</div>
			</div>
		</div>
		{
			postmetaCon && (
				<Formik
					initialValues={{
						title: postTitle,
						category: '',
						featuredImg: '',
					}}
					enableReinitialize
					validationSchema={validationSchema}
					onSubmit={(values) => createPost(values)}
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
									<FormRow name="category" label="Category" {...validatorProps} >
										<Field name="category">
											{({ field, form }) => (
											<Select
												options={colourOptions}
												placeholder="Select"
												onChange={option => form.setFieldValue(field.name, option.value)}
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
												draggable
												accept=".jpg,.jpeg,.png"
												beforeUpload={(file, fileList) => beforeUpload(file, fileList)}
												onFileRemove={() => {
													form.setFieldValue(field.name, '')
												}}
												onChange={async (file)=> await getFile(file, form, field)} 
											>
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
			)
		}
		</>
	)
}

export default CreatePost