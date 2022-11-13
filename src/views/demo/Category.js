import React, { useEffect, useState } from 'react'
import { FormItem, FormContainer, Segment, Input, Upload, Card, Button, Tooltip, Avatar, Badge, Notification, toast, Dialog, Error } from 'components/ui'
import { Loading, TextEllipsis, ConfirmDialog, Container } from 'components/shared'
import { Field, Form, Formik, ErrorMessage } from 'formik'
import { updateAuthorCategory } from 'store/userData/authorSlice'
import { setEmpty } from 'store/userData/postSlice'
import { setCategoryData, setEmptyC, deleteCategoryData } from 'store/userData/categorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sbSelect, sbUpdate, sbStorageDelete, sbUserDataDelete, sbInsert, sbUpload } from 'services/ApiService'
import axios from "axios"
import { HiOutlinePlus } from 'react-icons/hi'
import { GrTrash, GrEdit } from 'react-icons/gr'
import supabaseClient from 'utils/supabaseClient'
import PanelHeader from './PanelHeader'
import * as Yup from 'yup'
import Compress from "browser-image-compression"
import { CatContext, useGlobalContext } from "utils/context/catContext"

const openNotification = (type, text) => {
	toast.push(
		<Notification type={type}>
			{text}
		</Notification>
	)
}

const validationSchema = Yup.object().shape({
	catName: Yup.string().required('Category Name is required').matches(
		/^([a-zA-Z0-9 ]){3,20}$/,
		"Category name can only contain alphabets, digits & space with a range of 3-20 characters"
	),
	featuredImg: Yup.string().required('Featured Image is required'),
})

const maxCategory = 2

var inPage = 0, fnPage = maxCategory, catData = [], initFormState

var fihd, fisd;

const CategorySection = ({data}) => {

	const { setCategory } = useGlobalContext()

	const dispatch = useDispatch()

	const provider = useSelector((state) => state.auth.session.providerToken)
	const authID = useSelector((state) => state.auth.user.id)

	const [syncDisabled, setsyncDisabled] = useState(false)
    const [categoryId, setCategoryId] = useState()
    const [confirmdialogOpen, setconfirmdialogOpen] = useState(false)
    const [dialogOpen, setdialogOpen] = useState(false)
	const [fihighRes, setfihighRes] = useState()
	const [filowRes, setfilowRes] = useState()
	const [mode, setMode] = useState()
	const [fiImgUrl, setfiImgUrl] = useState()

	const [btnLoading, setbtnLoading] = useState(false)
	const [btnDisabled, setbtnDisabled] = useState(false)

	const navigate = useNavigate()

	const onCategoryDeleteConfirmationClose = () => {
		setconfirmdialogOpen(false)
	}

	const onCategoryAddDialogClose = () => {
		setdialogOpen(false)
	}

    const deleteAction = async (id) => {
		setsyncDisabled(true)
        openNotification('info', 'Deleting....')

        const folderPath = 'public/'+authID+'/'+id+'/featuredImg/'+'hd.jpeg';
        const folderPath2 = 'public/'+authID+'/'+id+'/featuredImg/'+'sd.jpeg';
    
        await sbStorageDelete('category', [folderPath, folderPath2]).then(async ({ error, data }) => {
    
            if(error) throw openNotification('danger', error.message)
            if(data) {
                
			  await sbUserDataDelete('category', 'id', id, 'createdby', authID).then(({ error, data }) => {
				if(error) throw openNotification('danger', error.message)
				if(data) {
				  var editedCatdata = [...catData]
				  const findIndex = editedCatdata.findIndex(a => a.id === data[0].id)
				  editedCatdata.splice(findIndex, 1)
				  catData = editedCatdata
				  console.log(catData)
				  setCategory(catData)
				  catData.length === 0 ? dispatch(setEmptyC()) : dispatch(deleteCategoryData(data[0]))
				  inPage = catData.length; fnPage = catData.length + maxCategory;
				  openNotification('success', 'Delete Complete')
				  console.log(inPage)
				  console.log(fnPage)
				  setsyncDisabled(false)
				}
			  })

            }

        })
        
    } 

    const onCategoryDeleteConfirm = async () => { 
        setconfirmdialogOpen(false)

        openNotification('info', 'Updating all the posts linked with the category....')
        
        await sbUpdate('posts', categoryId, { category: '255d4855-644e-43ab-829b-16adc417df97' }, 'category').then(({ error, data }) => {
            if(error) throw openNotification('danger', error.message)
            if(data) {
              dispatch(setEmpty())
              deleteAction(categoryId)
            }
        })
    
    }

    const deleteCategory = async (id, posts) => { 
        if(posts > 0) {
          setCategoryId(id)
          setconfirmdialogOpen(true)
        } else {
          setconfirmdialogOpen(false)
          deleteAction(id)
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
				const url = URL.createObjectURL(convertedBlobFile)
				console.log(convertedBlobFile)
				setfilowRes(convertedBlobFile)
				setfiImgUrl(url)
				openNotification('success', 'Featured Image conversion complete. You can now proceed to submit the post')
				form.setFieldValue(field.name, convertedBlobFile)
				setbtnDisabled(false)
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


	const setBtn = (state) => {
		setbtnLoading(state)
		setbtnDisabled(state)
	}

    const saveCategory = async ({ catName }) => {
        setBtn(true)

        var categoryTitle = catName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "-").toLowerCase();

        const { data, error } = await supabaseClient
        .from("category")
        .select('title')
        .eq('title', categoryTitle)
        .eq('createdby', authID);

        if(error) {
            setBtn(false)
            openNotification('danger', error.message)
        }
        else if(data?.length > 0) {
            setBtn(false)
            openNotification('danger', 'Category already exists')
        }else { 

            const insertData = [
                {
                    title: categoryTitle, name: catName, createdby: authID,
                }
            ]

            await sbInsert('category', insertData).then(async (res) => {
                
                if(res.error) {
                    setBtn(false)
                    openNotification('danger', error.message)
                }
                if(res.data) {
                    const categoryId = res.data[0].id

					openNotification('success', 'Uploading featured image. This may take a while. Please make sure you have stable internet connection')

					const images = [fihighRes, filowRes]
					const imagesName = ['hd.jpeg','sd.jpeg']

					for(var i = 0; i < images.length; i++) {

                        const imagepath = 'public/'+authID+'/'+categoryId+'/featuredImg/'+ imagesName[i]

						await sbUpload('category', imagepath, images[i]).then(({error, publicURL}) => {
							if(error) {
								setBtn(false)
								openNotification('danger', error.message)
							}
							if(publicURL) {
							  const mainurl = publicURL.toString() + '?' + new Date().getTime();
							  (imagesName[i] === 'hd.jpeg') ? fihd = mainurl : fisd = mainurl
							}
						})

					}
                    openNotification('info', 'Featured Image uploaded. Saving the details....')

                    const categoryUrl = '/category/'+categoryTitle

                    const { data, error } = await supabaseClient.from('category').update(
                        { featured_imghd: fihd, featured_imgsd: fisd, href: categoryUrl }
                    )
                    .eq('id', categoryId)
                    .eq('createdby', authID);
                    if(error) {
                        setBtn(false)
                        openNotification('danger', error.message)
                    }
                    if(data) {
                        catData = [...data, ...catData]
                        console.log(catData)
						setCategory(catData)
                        dispatch(setCategoryData(catData))
                        setBtn(false)
                        setdialogOpen(false) 
                    }

                }
            })

        }
    
    }
	
	const checkImgs = () => { 
        var images = [];
        var imagesName = [];
        if(fihighRes) {
          images = [fihighRes, filowRes]
          imagesName = ['hd.jpeg', 'sd.jpeg']
        }
        return {images,imagesName}
    }

	const editCat = async ({ catName }) => {
		setBtn(true)
		
		var catTitle = catName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "-").toLowerCase()
		
		openNotification('info', 'Uploading featured Image. Please wait....')

        const {images, imagesName} = checkImgs();
        console.log(images);
		
		if(images.length > 0) {
			
			for(var i = 0; i < images.length; i++) {
				const imagepath = 'public/'+authID+'/'+categoryId+'/featuredImg/'+ imagesName[i]

				await sbUpload('category', imagepath, images[i]).then(({error, publicURL}) => {
					if(error) {
						setBtn(false)
						openNotification('danger', error.message)
					}
					if(publicURL) {
						const mainurl = publicURL.toString() + '?' + new Date().getTime();
						(imagesName[i] === 'hd.jpeg') ? fihd = mainurl : fisd = publicURL
					}
				})

			}
			openNotification('info', 'Featured Image uploaded. Saving the details....')
		}

		console.log(fihd); console.log(fisd)
		
		const catUrl = '/category/'+catTitle
		
		const { data, error } = await supabaseClient.from('category').update(
			{ title: catTitle, name: catName, featured_imghd: fihd, featured_imgsd: fisd, href: catUrl }
		)
		.eq('id', categoryId)
		.eq('createdby', authID);
		if(error) {
			setBtn(false)
			openNotification('danger', error.message)
		}
		if(data) {
			openNotification('success', "Saved successfully")
			onCategoryAddDialogClose()
			window.location.reload()
		}
	}
	
	const categoryFun = async (values) => {
		console.log(mode)
		if(mode === "Add") {
			saveCategory(values)
		}else {
			editCat(values)
		}
	}

	return (
		<div className="mb-6">
			<div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
                <Dialog
                    isOpen={dialogOpen}
                    onClose={onCategoryAddDialogClose}
                    onRequestClose={onCategoryAddDialogClose}
                >
                    <h5 className="mb-4">{mode} Category</h5>
                    <div>
                        <Formik
                            initialValues={initFormState}
                            validationSchema={validationSchema}
                            onSubmit={(values) => categoryFun(values)}
                        >
                            {({values, touched, errors}) => {
                                return (
                                    <Form>
                                        <FormContainer>
                                            <FormItem
                                                label="Category Name"
                                                invalid={errors.catName && touched.catName}
                                            >
                                                <Field 
                                                    type="text" 
                                                    autoComplete="off" 
                                                    name="catName" 
                                                    placeholder="Name..." 
                                                    component={Input} 
                                                />
                                                <ErrorMessage name="catName"  render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
                                            </FormItem>
                                            <FormItem
                                                label="Featured Image"
                                                invalid={errors.featuredImg && touched.featuredImg}
                                            >
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
                                                <ErrorMessage name="featuredImg" render={msg => <div className='text-red-500 text-left'>{msg}</div>} />
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
					onClick={() => {
						initFormState = {
							catName: '',
							featuredImg: '',
						}
						setMode("Add")
						setdialogOpen(true)
					 }
				    }
			   >
					<div className="flex flex-col justify-center items-center py-5">
						<div className="p-4 border-2 border-dashed rounded-full border-gray-400 dark:border-gray-600 group-hover:border-indigo-600">
							<HiOutlinePlus className="text-4xl text-gray-600 dark:text-gray-600 group-hover:text-indigo-600" />
						</div>
						<p className="mt-5 font-semibold">Add Category</p>
					</div>
				</Card>
				{data?.map(category => (
					<Card bordered key={category.id}>
                        <Badge className="mr-4 font-semibold" content={category.posts} innerClass="bg-red-50 text-red-500"/>
						<h6 className="truncate mb-4 mt-5">
							{category.name}
						</h6>
						<p className="truncate mb-4 font-semibold">
							{ new Date(category.created_at).toLocaleString('en-us',{month:'short', day:'numeric', year:'numeric'}) }
						</p>
						{/* <div className=" h-40 pr-100">
							<TextEllipsis className="pr-10" text={article.post.replace(/<[^>]*>?/gm, '')} maxTextCount={120} />
						</div> */}
						<div className="flex items-center justify-between mt-4">
							<Avatar className="mr-4" src={category.featured_imgsd} />
							<div className="flex">
								<Tooltip title="Delete">
									<Button 
										shape="circle" 
										variant="plain"
										size="sm" 
										disabled={syncDisabled}
										onClick={() => deleteCategory(category.id, category.posts)}
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
											const { id, name, featured_imghd, featured_imgsd } = category
											initFormState = {
												catName: name,
												featuredImg: featured_imghd,
											}
											setMode("Edit")
											setfiImgUrl(featured_imghd)
											setCategoryId(id)
											fihd = featured_imghd; fisd = featured_imgsd;
											setdialogOpen(true)
										}}
										icon={<GrEdit className='opacity-70' />} 
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
                <ConfirmDialog
                    isOpen={confirmdialogOpen}
                    onClose={onCategoryDeleteConfirmationClose}
                    onRequestClose={onCategoryDeleteConfirmationClose}
                    type="danger"
                    title="Delete category"
                    onCancel={onCategoryDeleteConfirmationClose}
                    onConfirm={onCategoryDeleteConfirm}
                    confirmButtonColor="red-600"
                >
                    <p>
                        Are you sure you want to delete this category?
                        All the posts under this category will not carry any category after delete.  
                        All this action cannot be undone.
                    </p>
                </ConfirmDialog>
			</div>
		</div>
	)
}

const Category = () => {

	const dispatch = useDispatch()
	
	const userCategory = useSelector((state) => state.userData.category)
	const authID = useSelector((state) => state.auth.user.id)
	const authorCategory = useSelector((state) => state.userData.author.category)

	const [category, setCategory] = useState() 

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(true)
	const [btnLoading, setbtnLoading] = useState(false)

	useEffect(() => {
		console.log("userCategory", userCategory)
		console.log("authorCategory", authorCategory)
        console.log(inPage)
        console.log(fnPage)
		//dispatch(setEmptyC())
		if(userCategory.length === 0) {
			inPage = 0; fnPage = maxCategory;
			fetchCategory()
		}else {
			setLoading(true)
			inPage = userCategory.length
			fnPage = userCategory.length + maxCategory
			console.log(inPage)
			console.log(fnPage)
			catData = userCategory
			setCategory(catData)
			console.log(catData)
			setLoading(false)
		}
		
	}, [])
	
	const fetchCategory = async () => {

		console.log(authID)
		await sbSelect('category', `*, authors(*)`, 'createdby', authID, inPage, fnPage).then(({ data, error }) => {
			if(error) {
				throw setError(true)
			}
			if(data.length === 0) {
				openNotification('info', 'No Category to show')
				setLoading(false)
			}else if(data) {
				catData = inPage === 0 ? [...data] : [...catData, ...data]
				setCategory(catData)
				dispatch(setCategoryData(catData)) 
				dispatch(updateAuthorCategory(data[0].authors.category)) 
				inPage = catData.length; fnPage = catData.length + maxCategory;
				console.log(inPage)
				console.log(fnPage)
				setLoading(false)
			}
		})
	}

	if(error === true) {

		return (
			<Error />
		)

	}else { 

		return (
            <Container>
			    <PanelHeader type="Category" title="Manage Category" />
                <Loading loading={loading}>
					<CatContext.Provider value={{ category, setCategory }}>
                    	<CategorySection data={category} />
					</CatContext.Provider>
                    {
                        authorCategory > maxCategory && (
                            <div className="flex items-center justify-center mt-4">
                                <div className="flex">
                                    <Button 
                                        shape="circle" 
                                        variant="plain" 
                                        size="sm"
                                        loading={btnLoading}
                                        onClick={() => {
                                            setbtnLoading(true)
                                            fetchCategory().then(() => {
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
                </Loading>
            </Container>
		)
	}
}

export default Category