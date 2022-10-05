import React, { useEffect } from 'react'
import { FormItem, FormContainer, Segment, Button, Input } from 'components/ui'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { SegmentItemOption } from 'components/shared'
import { 
	HiOutlineCode, 
	HiOutlineCube, 
	HiOutlinePencil, 
	HiOutlineShieldCheck,
	HiOutlineAcademicCap,
	HiOutlineSparkles,
	HiArrowSmLeft
} from 'react-icons/hi'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { Upload } from 'components/ui'
import { sbUpload } from 'services/ApiService'
import { stepTwo } from 'store/onboard/onboardSlice'

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
	logoimg: Yup.string().required('Blog Logo is required'),
	faviconimg: Yup.string().required('Blog Favicon is required'),
})

const Step3 = ({ onNext, onBack }) => {

    const dispatch = useDispatch()

	const steps =  useSelector((state) => state.onboard)

	useEffect(() => {
		console.log(steps);
	}, [])
	

	const onSetFieldValue = (form, field, val) => {
		form.setFieldValue(field.name, val[0])
		onNext?.()
	}

    const submitOnboard = (values) => {
		dispatch(stepTwo(values))
	}

	const beforeUpload = (file, fileList, type) => {
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

	return (
		<div className="text-center">
			<h3 className="mb-2">Tell us about your Blog</h3>
			<div className="mt-8 max-w-[600px] lg:min-w-[600px] mx-auto">
				<Formik
					initialValues={{
						description: steps.description,
						logoimg: steps.logoimg,
						faviconimg: steps.faviconimg,
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
									<FormItem
										label="Blog Logo"
										invalid={errors.logoimg && touched.logoimg}
									>
										<Field name="logoimg">
											{({ form, field }) => ( 							
												<Upload beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'l')} draggable accept=".jpg,.jpeg,.png"
													onChange={(file) => {
														const fileName = 'logo.jpeg'
														const filetype = 'image/jpeg'
														//const convertedBlobFile = new File([file], fileName, { type: filetype, lastModified: Date.now()})
														//console.log(convertedBlobFile)
														form.setFieldValue(field.name, file[0])
														console.log(values)
													}} 
													fileList={[steps.logoimg]}
												/>
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
												<Upload beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'f')} draggable accept=".jpg,.jpeg,.png"
													onChange={(file) => {
														const fileName = 'favicon.jpeg'
														const filetype = 'image/jpeg'
														//const convertedBlobFile = new File([file], fileName, { type: filetype, lastModified: Date.now()})
														//console.log(convertedBlobFile)
														form.setFieldValue(field.name, file[0])
														console.log(values)
													}} 
													fileList={[steps.faviconimg]}
												/>
											)}
										</Field>
										<ErrorMessage name="faviconimg" render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
									</FormItem>
									<FormItem>
										<Button block variant="solid" type="submit">Submit</Button>
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