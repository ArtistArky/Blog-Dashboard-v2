import React from 'react'
import { Button, FormItem, FormContainer, Select, InputGroup, Input } from 'components/ui'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { HiArrowSmLeft } from 'react-icons/hi'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { stepOne } from 'store/onboard/onboardSlice'

const validationSchema = Yup.object().shape({
	blogName: Yup.string().required('Blog name is required').matches(
		/^([a-z0-9]){6,30}$/,
		"Blog name can only contain lowercase alphabets & digits with a reange of 6-30 characters"
	  ),
	title: Yup.string().required('Blog title is required').matches(
		/^([A-Za-z0-9 ]){6,30}$/,
		"Blog Title can only contain alphabets & digits with a reange of 6-30 characters"
	  ),
})

const sizes = [
	{label: 'Solo', value: 'solo'},
	{label: '2 ~ 10 members', value: '2~10'},
	{label: '11 ~ 50 members', value: '11~50'},
	{label: '51 ~ 200 members', value: '51~200'},
	{label: '201 ~ 500 members', value: '201~500'}
]

const { Addon } = InputGroup 

export const BlogNameInp = ({values}) => {
	return (
		<InputGroup className="mb-4">
			<Input value={values.blogName} />
			<Addon>.inkflow.com</Addon>
		</InputGroup>
	)
}

const Step2 = ({ onNext, onBack }) => {

    const dispatch = useDispatch()

	const stepone =  useSelector((state) => state.onboard)

	return (
		<div className="text-center">
			<h3 className="mb-2">Tell us about your Blog</h3>
			<div className="mt-8 max-w-[600px] lg:min-w-[600px] mx-auto">
				<Formik
					initialValues={{
						blogName: stepone.blog_name,
						title: stepone.title
					}}
					validationSchema={validationSchema}
					onSubmit={(values) => {
						console.log(values)
						dispatch(stepOne(values))
						onNext?.()
					}}
				>
					{({values, touched, errors}) => {
						return (
							<Form>
								<FormContainer>
									<FormItem
										label="Blog name"
										invalid={errors.blogName && touched.blogName}
									>
										<Field 
											type="text" 
											autoComplete="off" 
											name="blogName" 
											render={({ field /* { name, value, onChange, onBlur } */ }) => (
												<InputGroup className="mb-4">
													<Input {...field} />
													<Addon>.inkflow.com</Addon>
												</InputGroup>
											)}
										/>
										<ErrorMessage name="blogName"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
									</FormItem>
									<FormItem
										label="Blog title"
										invalid={errors.title && touched.title}
									>
										<Field 
											type="text" 
											autoComplete="off" 
											name="title" 
											placeholder="Blog title..." 
											component={Input} 
										/>
										<ErrorMessage name="title"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
									</FormItem>
									<FormItem>
										<Button block variant="solid" type="submit">Continue</Button>
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

export default Step2