import React, { useEffect, useState } from 'react'
import { FormItem, FormContainer, Segment, Input, Upload, Card, Button, Tooltip, Avatar, Badge, Notification, toast, Dialog, Error, Select } from 'components/ui'
import { Loading, TextEllipsis, ConfirmDialog, Container } from 'components/shared'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { updateAuthorCategory } from 'store/userData/authorSlice'
import { setEmpty } from 'store/userData/postSlice'
import { setNavData, setEmptyN, deleteNavData } from 'store/userData/navSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sbSelectDefault, sbUpdate, sbDelete, sbInsert } from 'services/ApiService'
import axios from "axios"
import { HiOutlinePlus } from 'react-icons/hi'
import { GrTrash, GrSync } from 'react-icons/gr'
import supabaseClient from 'utils/supabaseClient'
import PanelHeader from './PanelHeader'
import * as Yup from 'yup'
import isURL from 'validator/es/lib/isURL'
import { NavContext, useGlobalContext } from "utils/context/navContext"

const openNotification = (type, text) => {
	toast.push(
		<Notification type={type}>
			{text}
		</Notification>
	)
}

const validationSchema = Yup.object().shape({
	navType: Yup.string().required('Navigation Type is required'),
	navName: Yup.string().required('Navigation Name is required').matches(
		/^([A-Za-z0-9- ]){3,30}$/,
		"Navigation name can only contain alphabets, digits & space with a range of 3-30 characters"
	),
	navLink: Yup.string().required('Navigation link is required')
})

const maxCategory = 2

var inPage = 0, fnPage = maxCategory, navData = []

var fihd, fisd;

const navOptions = [
	{ value: 'Navigation Menu', label: 'Navigation Menu' },
	{ value: 'Social Icon', label: 'Social Icon' },
	{ value: 'CTA Button', label: 'CTA Button' },
]

const socialOptions = [
	{ value: 'Facebook', label: 'Facebook' },
	{ value: 'Twitter', label: 'Twitter' },
	{ value: 'Youtube', label: 'Youtube' },
	{ value: 'Instagram', label: 'Instagram' },
]

const NavigationSection = ({data}) => {

	const { setNav } = useGlobalContext()

	const dispatch = useDispatch()

	const provider = useSelector((state) => state.auth.session.providerToken)
	const authID = useSelector((state) => state.auth.user.id)

	const [syncDisabled, setsyncDisabled] = useState(false)
    const [categoryId, setCategoryId] = useState()
    const [dialogOpen, setdialogOpen] = useState(false)

	const [btnLoading, setbtnLoading] = useState(false)
	const [btnDisabled, setbtnDisabled] = useState(false)

	const navigate = useNavigate()

	const onCategoryAddDialogClose = () => {
		setdialogOpen(false)
	}

	const setBtn = (state) => {
		setbtnLoading(state)
		setbtnDisabled(state)
	}

	
	const saveNavigation = async ({ navType, navName, navLink}) => {

		let urlOptions = {
			protocols: [
				'http',
				'https',
			],
			require_protocol: true,
			require_host: true,
			require_valid_protocol: true,
			allow_underscores: false,
			host_whitelist: false,
			host_blacklist: false,
			allow_trailing_dot: false,
			allow_protocol_relative_urls: false,
			disallow_auth: false
		}
	
		console.log(navName, navLink, navType);
		
		if(!isURL(navLink, urlOptions)) {
			openNotification('danger', 'URL entered is invalid')
		}else {
			setBtn(true)

			const { data, error } = await supabaseClient
			.from("navigation")
			.select('name, type')
			.eq('type', navType)
			.eq('createdby', authID);
	
			if(error) {
				setBtn(false)
				openNotification('danger', error.message)
			}
			
			const existingName = data?.filter(function(obj) {
			  return ((obj.name == navName) && (obj.type == navType));
			})

			console.log(existingName)

			if(existingName?.length > 0) {
				setBtn(false) 
				openNotification('danger', 'Navigation with same name already exists')
			}else {
	
			  if(navType == "Navigation Menu" && data?.length == 5) {

				  setBtn(false) 
				  openNotification('danger', 'Limit reached!! Maximum no of Navigation menu that can be created is 5')

			  }else if(navType == "Social Icon" && data?.length == 4) {
				
				  setBtn(false) 
				  openNotification('danger', 'Limit reached!! Maximum no of Social icons that can be created is 4')

			  }else if(navType == "CTA Button" && data?.length == 1) {

				  setBtn(false) 
				  openNotification('danger', 'Limit reached!! Maximum no of CTA Buttons that can be created is 1')

			  }else {
				  
				  const insertData = [
					{ name: navName, type: navType, link: navLink, createdby: authID },
				  ]

				  await sbInsert('navigation', insertData).then(({ error, data }) => {
					if(error) {
						setBtn(false)
						openNotification('danger', error.message)
					}
					if(data) {
                        navData = [...data, ...navData]
                        console.log(navData)
						setNav(navData)
                        dispatch(setNavData(navData))
						openNotification('success', 'Navigation Menu created successfully')
                        setBtn(false)
                        setdialogOpen(false) 
					}

				  })
				  
			  }
			
			}
		  
	
		}
	
	}

	const deleteNavigation = async (id) => { 
		console.log(id)

		openNotification('info', 'Deleting....')
		
		await sbDelete('navigation', id).then(({ error, data }) => {
	
			if(error) {
				setBtn(false)
				openNotification('danger', error.message)
			}
			if(data) {
				var editedNavdata = [...navData]
				const findIndex = editedNavdata.findIndex(a => a.id === data[0].id)
				editedNavdata.splice(findIndex, 1)
				navData = editedNavdata
				console.log(navData)
				setNav(navData)
				navData.length === 0 ? dispatch(setEmptyN()) : dispatch(deleteNavData(data[0]))
				openNotification('success', 'Delete Complete')
				setsyncDisabled(false)
			}

		})
		
	  } 

	return (
		<div className="mb-6">
			<div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
                <Dialog
                    isOpen={dialogOpen}
                    onClose={onCategoryAddDialogClose}
                    onRequestClose={onCategoryAddDialogClose}
                >
                    <h5 className="mb-4">Add Navigation</h5>
                    <div>
                        <Formik
                            initialValues={{
                                navType: '',
                                navName: '',
                                navLink: '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={(values) => saveNavigation(values)}
                        >
                            {({values, touched, errors}) => {
                                return (
                                    <Form>
                                        <FormContainer>
											<FormItem name="navType" label="Navigation Type"
											 invalid={errors.navType && touched.navType}>
												<Field name="navType">
													{({ field, form }) => (
														<Select
															options={navOptions}
															placeholder="Select"
															onChange={option => form.setFieldValue(field.name, option.value)}
														/>
													)}
												</Field>
												<ErrorMessage name="navType"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
											</FormItem>
											{
												values.navType === "Social Icon" ? 
													<FormItem name="navName" label="Social Icon"
													 invalid={errors.navName && touched.navName}>
														<Field name="navName">
															{({ field, form }) => (
																<Select
																	options={socialOptions}
																	placeholder="Select"
																	onChange={option => form.setFieldValue(field.name, option.value)}
																/>
															)}
														</Field>
														<ErrorMessage name="navName"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
													</FormItem>
												:
												
												<FormItem
													label="Navigation Name"
													invalid={errors.navName && touched.navName}
												>
													<Field 
														type="text" 
														autoComplete="off" 
														name="navName" 
														placeholder="Name..." 
														component={Input} 
													/>
													<ErrorMessage name="navName"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
												</FormItem>
											}
                                            <FormItem
                                                label="Link"
                                                invalid={errors.navLink && touched.navLink}
                                            >
                                                <Field 
                                                    type="text" 
                                                    autoComplete="off" 
                                                    name="navLink" 
                                                    placeholder="Link..." 
                                                    component={Input} 
                                                />
                                                <ErrorMessage name="navLink"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
                                            </FormItem>
                                            <FormItem>
                                                <Button block variant="solid" type="submit" disabled={btnDisabled} loading={btnLoading}>Submit</Button>
                                            </FormItem>
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
					onClick={() => setdialogOpen(true)}
				>
					<div className="flex flex-col justify-center items-center py-5">
						<div className="p-4 border-2 border-dashed rounded-full border-gray-400 dark:border-gray-600 group-hover:border-indigo-600">
							<HiOutlinePlus className="text-4xl text-gray-600 dark:text-gray-600 group-hover:text-indigo-600" />
						</div>
						<p className="mt-5 font-semibold">Add Navigation</p>
					</div>
				</Card>
				{data?.map(nav => (
					<Card bordered key={nav.id}>
                        <Badge className="mr-4" innerClass="bg-emerald-500" content={nav.type} />
						<h6 className="truncate mb-4 mt-5">
							{nav.name}
						</h6>
						<p className="truncate mb-4 font-semibold">
							{ new Date(nav.created_at).toLocaleString('en-us',{month:'short', day:'numeric', year:'numeric'}) }
						</p>
						{/* <div className=" h-40 pr-100">
							<TextEllipsis className="pr-10" text={article.post.replace(/<[^>]*>?/gm, '')} maxTextCount={120} />
						</div> */}
						<div className="flex items-center justify-end mt-4">
							<div className="flex justify-end">
								<Tooltip title="Delete">
									<Button 
										shape="circle" 
										variant="plain"
										size="sm" 
										disabled={syncDisabled}
										onClick={() => deleteNavigation(nav.id)}
										icon={<GrTrash className='opacity-70' />} 
									/>
								</Tooltip>
								{/* <Tooltip title="Sync">
									<Button 
										shape="circle" 
										variant="plain" 
										size="sm"
										disabled={syncDisabled}
										onClick={() => syncPost(article.docsid, article.posttitle)}
										icon={<GrSync className='opacity-70' />} 
									/>
								</Tooltip> */}
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}

const Navigation = () => {

	const dispatch = useDispatch()
	
	const userNav = useSelector((state) => state.userData.navigation)
	const authID = useSelector((state) => state.auth.user.id)

	const [nav, setNav] = useState() 

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		console.log("userNav", userNav)
		//dispatch(setEmptyC())
		if(userNav.length === 0) {
			fetchNav()
		}else {
			setLoading(true)
			navData = userNav
			setNav(navData)
			console.log(navData)
			setLoading(false)
		}
		
	}, [])
	
	const fetchNav = async () => {

		console.log(authID)
		
		const { data, error } = await supabaseClient
        .from('navigation')
        .select(`*, authors(*)`)
        .eq('createdby', authID)
        .order('created_at', { ascending: false })
		
		if(error) {
			throw setError(true)
		}
		if(data.length === 0) {
			openNotification('info', 'No Navigations to show')
			setLoading(false)
		}else if(data) {
			navData = navData.length === 0 ? [...data] : [...navData, ...data]
			setNav(navData)
			dispatch(setNavData(navData)) 
			setLoading(false)
		}

	}

	if(error === true) {

		return (
			<Error />
		)

	}else { 

		return (
            <Container>
			    <PanelHeader type="Navigation" title="Manage Navigation" />
                <Loading loading={loading}>
					<NavContext.Provider value={{ nav, setNav }}>
                    	<NavigationSection data={nav} />
					</NavContext.Provider>
                </Loading>
            </Container>
		)
	}
}

export default Navigation