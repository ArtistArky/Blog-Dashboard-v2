import React, { useState } from 'react'
import { 
    InputGroup, 
	Input, 
	Avatar,
	Upload,
	Button,
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
import { useDispatch, useSelector } from 'react-redux'
import { sbUpload, sbProfileUpdate } from 'services/ApiService'
import { updateAuthorData } from 'store/userData/authorSlice'

const { Addon } = InputGroup 

const validationSchema = Yup.object().shape({
	blogName: Yup.string().required('Blog name cannot be empty').matches(
		/^([a-z0-9]){6,30}$/,
		"Blog name can only contain lowercase alphabets & digits with a reange of 6-30 characters"
	),
	title:  Yup.string().required('Blog title cannot be empty').matches(
		/^([A-Za-z0-9 ]){6,30}$/,
		"Blog Title can only contain alphabets & digits with a reange of 6-30 characters"
	),
	description: Yup.string().required('Blog Description cannot be empty'),
	logoimg: Yup.string().required('Blog Logo cannot be empty'),
	faviconimg: Yup.string().required('Blog Favicon cannot be empty'),
})

var logo, favicon;

const Profile = ({data}) => {
    
    const dispatch = useDispatch()

	const { username, title, description, logoimg, faviconimg } = useSelector((state) => state.userData.author)
	const authID = useSelector((state) => state.auth.user.id)

	const [logoImg, setlogoImg] = useState()
	const [faviconImg, setfaviconImg] = useState()
	const [logoImgURL, setlogoImgURL] = useState(logoimg)
	const [faviconImgURL, setfaviconImgURL] = useState(faviconimg)

	const [btnLoading, setbtnLoading] = useState(false)

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
        const maxFileSize = 150000

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

    const checkImgs = (values) => { 
        var images = [];
        var name = [];
        if(logoImg && faviconImg) {
          images = [logoImg, faviconImg]
          name = ['logo.jpeg', 'favicon.jpeg']
        }else if(logoImg) {
          images = [logoImg]
          name = ['logo.jpeg']
          favicon = values.faviconimg
        }else if(faviconImg) {
          images = [faviconImg]
          name = ['favicon.jpeg']
          logo = values.logoimg
        }else {
          logo = values.logoimg
          favicon = values.faviconimg
        }
        return {images,name}
      }

    const updateProfileData = async (values) => {
		setbtnLoading(true);

        const {images, name} = checkImgs(values);
        console.log(images);
        //const imagepath = 'public/'+authId+'/images/'+name[i];
		console.log(authID)

        if(images.length > 0) {
            openNotification('info', 'Uploading images....')
            for(var i = 0; i < images.length; i++) {
                const imagepath = 'public/'+authID+'/images/'+name[i];
                await sbUpload('authors', imagepath, images[i]).then(({error, publicURL}) => {
                    if(error) {
                        setbtnLoading(false);
                        openNotification('danger', error.message)
                    }
                    if(publicURL) {
                      console.log(publicURL);
                      const mainurl = publicURL + '?' + new Date().getTime();
                      (name[i] == 'logo.jpeg') ? logo = mainurl : favicon = mainurl;
                    }
                })
            }
            openNotification('info', 'Images uploaded. Saving the details....')
        }
		console.log(logo); console.log(favicon);
		const updateData = {
			title: values.title,
			description: values.description,
			username: values.blogName,
			logoimg: logo,
			faviconimg: favicon, 
		}
		await sbProfileUpdate(authID, updateData).then(({ error, data }) => {
			if(error) {
				setbtnLoading(false);
				openNotification('danger', error.message)
			}
			if(data) {
				setbtnLoading(false);
				dispatch(updateAuthorData(updateData))
                openNotification('success', 'Updated successfully....')
			}
		})
	}

	return (
		<Formik
            initialValues={{
                blogName: username,
                title: title,
                description: description,
                logoimg: logoimg,
                faviconimg: faviconimg
            }}
			enableReinitialize
			validationSchema={validationSchema}
			onSubmit={(values) =>  updateProfileData(values)}
		>
			{({values, touched, errors, isSubmitting, resetForm}) => {
				const validatorProps = {touched, errors}
				return (
					<Form>
						<FormContainer>
							<FormDesription 
								title="General"
								desc="Basic info about you blog, like your blog name, title, description, logo image and favicon image that will displayed in public"
							/>
							<FormRow name="blogName" label="Blog Name" {...validatorProps} >
								<Field 
									type="text" 
									autoComplete="off" 
									name="blogName" 
                                    render={({ field /* { name, value, onChange, onBlur } */ }) => (
                                        <InputGroup>
                                            <Input placeholder="blogname" {...field} />
                                            <Addon>.inkflow.com</Addon>
                                        </InputGroup>
                                    )}
								/>
							</FormRow>
							<FormRow name="title" label="Title" {...validatorProps} border={false} >
								<Field
									type="text" 
									autoComplete="off" 
									name="title" 
									placeholder="Title" 
									component={Input}
								/>
							</FormRow>
							<FormRow name="description" label="Description" {...validatorProps} >
								<Field 
									type="text"
									autoComplete="off"
									name="description"
									placeholder="Description"
                                    render={({ field /* { name, value, onChange, onBlur } */ }) => (
                                            <Input placeholder="Description" {...field} textArea />
                                    )}
									prefix={<HiOutlineMail className="text-xl" />}
								/>
							</FormRow>
							<FormRow name="logoimg" label="Logo Image" {...validatorProps} >
								{/* <Field name="avatar">
									{({ field, form }) => {
									const avatarProps = field.value ? { src: field.value } : {}
									return (
										<Upload
											className="cursor-pointer"
											onChange={files => onSetFormFile(form, field, files)}
											onFileRemove={files => onSetFormFile(form, field, files)}
											showList={false}
											uploadLimit={1}
										>
											<Avatar 
												className="border-2 border-white dark:border-gray-800 shadow-lg"
												size={60} 
												shape="circle"
												icon={<HiOutlineUser />}
												{...avatarProps}  
											/>
										</Upload>
									)
									}}
								</Field> */}
                                <Field name="logoimg">
                                    {({ form, field }) => ( 	
                                    <Upload 
                                        className="cursor-pointer" 
                                        showList={true}
                                        accept=".jpg,.jpeg,.png"
                                        beforeUpload={(file, fileList) => beforeUpload(file, fileList)}
                                        onFileRemove={() => {
                                            form.setFieldValue(field.name, logoimg)
                                            setlogoImg()
                                            setlogoImgURL(logoimg)
                                        }}
                                        onChange={(file)=> {
                                            const url = URL.createObjectURL(file[0])
                                            const fileName = 'logo.jpeg'
                                            const filetype = 'image/jpeg'
                                            const convertedBlobFile = new File([file[0]], fileName, { type: filetype, lastModified: Date.now()})
                                            form.setFieldValue(field.name, convertedBlobFile)
                                            setlogoImg(convertedBlobFile)
                                            setlogoImgURL(url)
                                            console.log(values)
                                        }} 
                                    >
                                        <Avatar size={60} src={logoImgURL} icon={<HiOutlinePlus />} />
                                    </Upload>
                                    )}
                                </Field>
							</FormRow>
							<FormRow name="faviconimg" label="Favicon Image" {...validatorProps} >
                                <Field name="faviconimg">
                                    {({ form, field }) => ( 	
                                    <Upload 
                                        className="cursor-pointer" 
                                        showList={true}
                                        accept=".jpg,.jpeg,.png"
                                        beforeUpload={(file, fileList) => beforeUpload(file, fileList)}
                                        onFileRemove={() => {
                                            form.setFieldValue(field.name, faviconimg)
                                            setfaviconImg()
                                            setfaviconImgURL(faviconimg)
                                        }}
                                        onChange={(file)=> {
                                            const url = URL.createObjectURL(file[0])
                                            const fileName = 'favicon.jpeg'
                                            const filetype = 'image/jpeg'
                                            const convertedBlobFile = new File([file[0]], fileName, { type: filetype, lastModified: Date.now()})
                                            form.setFieldValue(field.name, convertedBlobFile)
                                            setfaviconImg(convertedBlobFile)
                                            setfaviconImgURL(url)
                                            console.log(values)
                                        }} 
                                    >
                                        <Avatar size={60} src={faviconImgURL} icon={<HiOutlinePlus />} />
                                    </Upload>
                                    )}
                                </Field>
							</FormRow>
							<div className="mt-4 ltr:text-right">
								<Button variant="solid" loading={btnLoading} type="submit">
									Update
								</Button>
							</div>
						</FormContainer>
					</Form>
				)
			}}
		</Formik>
	)
}

export default Profile