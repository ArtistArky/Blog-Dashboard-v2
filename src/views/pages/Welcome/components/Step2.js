import React, { useState } from 'react'
import { Button, FormItem, FormContainer, Select, InputGroup, Input } from 'components/ui'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { HiArrowSmLeft } from 'react-icons/hi'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { stepOne } from 'store/onboard/onboardSlice'
import { actualTZ } from 'mock/data/actualTZ'

import AsyncSelect from 'react-select/async'

const validationSchema = Yup.object().shape({
	blogName: Yup.string().required('Blog name is required').matches(
		/^([a-z0-9]){6,30}$/,
		"Blog name can only contain lowercase alphabets & digits with a reange of 6-30 characters"
	  ),
	title: Yup.string().required('Blog title is required').matches(
		/^([A-Za-z0-9 \u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff] ]){3,500}$/,
		"Blog Title can only contain alphabets & digits with a reange of 6-30 characters"
	  ),
	timezone: Yup.string().required('Time Zone is required for viewing the Analytics'),
})

const allowed = ['value'];

// const timezoneList = Object.keys(actualTZ[0])
//   .filter(key => allowed.includes(key))
//   .reduce((obj, key) => {
//     obj[key] = actualTZ[key];
//     return obj;
//   }, {});

actualTZ.forEach(object => {
	delete object['offset'];
	delete object['label2'];
});

console.log(actualTZ);

const { Addon } = InputGroup 

const filterColors = (inputValue) => {
	return actualTZ.filter((i) =>
		i.label.includes(inputValue)
	)
}

const loadOptions = ( inputValue, callback ) => {
	setTimeout(() => {
		callback(filterColors(inputValue))
	}, 1000)
}

const Step2 = ({ onNext, onBack }) => {

    const dispatch = useDispatch()

	const stepone =  useSelector((state) => state.onboard)	

	const [_, setValue] = useState('')

	const handleInputChange = (newValue) => {
		setValue(newValue)
		return newValue
	}

	return (
		<div className="text-center">
			<h3 className="mb-2">Tell us about your Blog</h3>
			<div className="mt-8 max-w-[600px] lg:min-w-[600px] mx-auto">
				<Formik
					initialValues={{
						blogName: stepone.blog_name,
						title: stepone.title,
						timezone: stepone.timezone
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
													<Addon>{process.env.REACT_APP_SITE_URL}</Addon>
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
									<FormItem 
										label="Time Zone"
										invalid={errors.timezone && touched.timezone}
									 >
										<Field name="timezone">
											{({ field, form }) => (
											<Select
												options={actualTZ}
												placeholder="Select"
												cacheOptions
												defaultOptions
												loadOptions={loadOptions}
												onInputChange={handleInputChange}
												componentAs={AsyncSelect}
												defaultValue={{label: stepone.timezone, value: stepone.timezone }}
												//onFocus={fetchCatList}
												//isLoading={loading}
												onChange={option => {
													form.setFieldValue(field.name, option.value)
												}}
											/>
											)}
										</Field>
										<ErrorMessage name="timezone" render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
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