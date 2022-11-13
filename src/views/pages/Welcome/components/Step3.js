import React, { useEffect, useState } from 'react'
import { FormItem, FormContainer, Segment, Button, Input, Avatar, Upload, Notification, toast } from 'components/ui'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { SegmentItemOption } from 'components/shared'
import { 
	HiOutlineCode, 
	HiOutlineCube, 
	HiOutlinePencil, 
	HiOutlineShieldCheck,
	HiOutlineAcademicCap,
	HiOutlineSparkles,
	HiArrowSmLeft,
	HiOutlinePlus
} from 'react-icons/hi'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { sbUpload, sbUpdate } from 'services/ApiService'
import { stepTwo } from 'store/onboard/onboardSlice'
import { updateAuthorData } from 'store/userData/authorSlice'
import axios from "axios"

const roles = [
	{ value: 'softwareEngineer', label: 'Software Engineer', icon: <HiOutlineCode /> },
	{ value: 'productManager', label: 'Product Manager', icon: <HiOutlineCube /> },
	{ value: 'designer', label: 'Designer', icon: <HiOutlinePencil /> },
	{ value: 'qaTester', label: 'QA Tester', icon: <HiOutlineShieldCheck /> },
	{ value: 'skateHolder', label: 'Skate Holder', icon: <HiOutlineAcademicCap /> },
	{ value: 'other', label: 'Others', icon: <HiOutlineSparkles /> },
]

const validationSchema = Yup.object().shape({
	description: Yup.string().required('Blog Description is required'),
})

var logo, favicon;

const Step3 = ({ onNext, onBack }) => {

    const dispatch = useDispatch()

	const steps =  useSelector((state) => state.onboard)
	const authID = useSelector((state) => state.auth.user.id)

	const stepsLogo = steps.logoimg ? URL.createObjectURL(steps.logoimg) : null;
	const stepsFavicon = steps.faviconimg ? URL.createObjectURL(steps.faviconimg) : null;

	const [logoImgURL, setlogoImgURL] = useState(stepsLogo)
	const [faviconImgURL, setfaviconImgURL] = useState(stepsFavicon)

	const [btnLoading, setbtnLoading] = useState(false)

	useEffect(() => {
		// if(steps.logoimg == null){
		// 	console.log('test')
		// }
		//console.log(Object.values(steps.logoimg))
		//console.log(URL.createObjectURL(steps.logoimg))
		console.log(steps)
	}, [])

	const openNotification = (type, text) => {
		toast.push(
			<Notification type={type}>
				{text}
			</Notification>
		)
	}

	const onSetFieldValue = (form, field, val) => {
		form.setFieldValue(field.name, val[0])
		onNext?.()
	}

	const siteurl = steps.blog_name+'.'+process.env.REACT_APP_SITE_URL

	var form1 = new FormData()
	form1.append('domain', siteurl)
	form1.append('timezone', steps.timezone)
	var form2 = new FormData()
	form2.append('site_id', siteurl)
	form2.append('name', steps.blog_name)
	
	const url1 = process.env.REACT_APP_PSITE_AURL
	const url2 = url1.toString()+'/shared-links'

	console.log(url1)
	console.log(url2)

	var config1 = {
		headers: { 
		  'Authorization': `Bearer ${process.env.REACT_APP_PSITE}`, 
		},
	};
	var config2 = {
		headers: { 
		  'Authorization': `Bearer ${process.env.REACT_APP_PSITE}`, 
		},
	};
	var config3 = {...config1}
	console.log(config3)
	
	const checkImgs = (values) => { 
		const { logoimg, faviconimg } = values;

        var images = [];
        var name = [];

        if(logoimg && faviconimg) {
          images = [logoimg, faviconimg]
          name = ['logo.jpeg', 'favicon.jpeg']
        }else if(logoimg) {
			images = [logoimg]
			name = ['logo.jpeg']
		}else if(faviconimg) {
			images = [faviconimg]
			name = ['favicon.jpeg']
		}
        return {images,name}
    }

	const request2 = (values) => {
		
		axios.request({ method: 'PUT', url: url2, ...config2, data: form2 }).then(async (response) => {
			const response2 = response.data
			console.log(response2)

			if(response2) {

				const sharedurl = response2.url
				console.log(sharedurl)

				const {images, name} = checkImgs(values)
        		console.log(images)
				//const imagepath = 'public/'+authId+'/images/'+name[i];
				console.log(authID)
		
				if(images.length > 0) {
		
					openNotification('info', 'Analytics Configured. Uploading images....')
					for(var i = 0; i < images.length; i++) {
						console.log(i)
						const imagepath = 'public/'+authID+'/images/'+name[i];
						await sbUpload('authors', imagepath, images[i]).then(({publicURL}) => {
							if(publicURL) {
							  console.log(publicURL);
							  const mainurl = publicURL + '?' + new Date().getTime();
							  (name[i] == 'logo.jpeg') ? logo = mainurl : favicon = mainurl;
							}
						})
					}
	
					openNotification('info', 'Images uploaded. Saving the details...')
				}
				console.log(logo); console.log(favicon);

				const updateData = {
					title: steps.title,
					description: values.description,
					username: steps.blog_name,
					logoimg: logo,
					faviconimg: favicon, 
					aurl: sharedurl
				}
				await sbUpdate('authors', authID, updateData, 'id').then(({ data }) => {
					if(data) {
						setbtnLoading(false);
						dispatch(updateAuthorData(updateData))
						window.location.reload();
					}
				})

			}
		}).catch(errors => {
			setbtnLoading(false)
			openNotification('danger', errors.message)
		})
	}

    const submitOnboard = async (values) => {
		setbtnLoading(true);
		dispatch(stepTwo(values))

		openNotification('info', 'Configuring Analytics...')

		axios.request({ method: 'POST', url: url1.toString(), ...config1, data: form1 }).then(async (response) => {
			const response1 = response.data
			console.log(response1)

			if(response1) {
				request2(values)
			}
		}).catch(errors => {
			if(errors.status = 400) {
				console.log("Site Created")
				request2(values)
			}else {
				setbtnLoading(false)
				console.log(errors)
				openNotification('danger', errors.message)
			}

		})
	}

	const beforeUpload = (file, fileList) => {
		var valid = true;

		console.log(file)
		console.log(fileList)
        const allowedFileType = ['image/jpeg', 'image/png']
        const maxFileSize = 200000

        if(fileList.length >= 1) {
            return `You can only upload 1 image file`
        }

		if (!allowedFileType.includes(file[0].type)) {
			return 'Please upload a .jpeg or .png file!'
		}

		if(file[0].size >= maxFileSize) {
			return'Upload image cannot more then 150kb!'
		}
		
		// if(type === 'f') { 
		// 	const img = new Image();
		// 	img.src = URL.createObjectURL(file[0])

		// 	img.onload = function () {
		// 			const width = img.width; const height = img.height;
		// 			console.log(width)
		// 			console.log(height)
		// 			if(width != height) {
		// 				return "Image must be square"
		// 			}
		// 	};
		// }
		return valid;
    }

	return (
		<div className="text-center">
			<h3 className="mb-2">Tell us about your Blog</h3>
			<div className="mt-8 max-w-[600px] lg:min-w-[600px] mx-auto">
				<Formik
					initialValues={{
						description: steps.description,
						logoimg: steps.logoimg ? steps.logoimg : '',
						faviconimg: steps.faviconimg ? steps.faviconimg : '',
					}}
					validationSchema={validationSchema}
					onSubmit={(values) => submitOnboard(values)}
				>
					{({values, touched, errors}) => {
						return (
							<Form>
								<FormContainer>
									<FormItem
										label="Blog Description"
										invalid={errors.description && touched.description}
									>
										<Field 
											type="text" 
											autoComplete="off" 
											name="description" 
											placeholder="Blog description..." 
											component={Input} 
										/>
										<ErrorMessage name="description"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
									</FormItem>
									<div>
										<FormItem
											label="Blog Logo"
											invalid={errors.logoimg && touched.logoimg}
										>
											<Field name="logoimg">
												{({ form, field }) => ( 	
												<Upload 
													className="cursor-pointer" 
													showList={true}
													accept=".jpg,.jpeg,.png"
													beforeUpload={(file, fileList) => beforeUpload(file, fileList)}
													onFileRemove={() => setlogoImgURL()}
													onChange={(file)=> {
														const url = URL.createObjectURL(file[0])
														const fileName = 'logo.jpeg'
														const filetype = 'image/jpeg'
														const convertedBlobFile = new File([file[0]], fileName, { type: filetype, lastModified: Date.now()})
														// console.log(convertedBlobFile)
														form.setFieldValue(field.name, convertedBlobFile)
														setlogoImgURL(url)
														console.log(values)
													}} 
												>
													<Avatar size={80} src={logoImgURL} icon={<HiOutlinePlus />} />
												</Upload>						
													// <Upload beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'l')} draggable accept=".jpg,.jpeg,.png"
													// 	onChange={(file) => {
													// 		const fileName = 'logo.jpeg'
													// 		const filetype = 'image/jpeg'
													// 		//const convertedBlobFile = new File([file], fileName, { type: filetype, lastModified: Date.now()})
													// 		//console.log(convertedBlobFile)
													// 		form.setFieldValue(field.name, file[0])
													// 		console.log(values)
													// 	}} 
													// 	fileList={[steps.logoimg]}
													// />
												)}
											</Field>
											<ErrorMessage name="logoimg" render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
										</FormItem>
										<FormItem
											label="Blog Favicon"
											invalid={errors.faviconimg && touched.faviconimg}
										>
											<Field name="faviconimg">
												{({ form, field }) => ( 	
												<Upload 
													className="cursor-pointer" 
													showList={true}
													accept=".jpg,.jpeg,.png"
													beforeUpload={(file, fileList) => beforeUpload(file, fileList)}
													onFileRemove={() => setfaviconImgURL()}
													onChange={(file)=> {
														const url = URL.createObjectURL(file[0])
														const fileName = 'favicon.jpeg'
														const filetype = 'image/jpeg'
														const convertedBlobFile = new File([file[0]], fileName, { type: filetype, lastModified: Date.now()})
														// console.log(convertedBlobFile)
														form.setFieldValue(field.name, convertedBlobFile)
														setfaviconImgURL(url)
														console.log(values)
													}} 
												>
													<Avatar size={80} src={faviconImgURL} icon={<HiOutlinePlus />} />
												</Upload>							
													// <Upload beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'f')} draggable accept=".jpg,.jpeg,.png"
													// 	onChange={(file) => {
													// 		const fileName = 'favicon.jpeg'
													// 		const filetype = 'image/jpeg'
													// 		//const convertedBlobFile = new File([file], fileName, { type: filetype, lastModified: Date.now()})
													// 		//console.log(convertedBlobFile)
													// 		form.setFieldValue(field.name, file[0])
													// 		console.log(values)
													// 	}} 
													// 	fileList={[steps.faviconimg]}
													// />
												)}
											</Field>
											<ErrorMessage name="faviconimg" render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
										</FormItem>
									</div>
									<FormItem>
										<Button block variant="solid" type="submit" loading={btnLoading}>Submit</Button>
										<Button
											className="mt-4"
											variant="plain" 
											onClick={onBack}
											type="button"
											icon={<HiArrowSmLeft />}
											block
										>
											Back
										</Button>
									</FormItem>
								</FormContainer>
							</Form>
						)
					}}
				</Formik>
			</div>
		</div>
	)
}

export default Step3