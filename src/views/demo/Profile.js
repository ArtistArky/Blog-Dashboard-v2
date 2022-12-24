import React, { useState } from "react";
import {
  Alert,
  FormItem,
  InputGroup,
  Input,
  Avatar,
  Upload,
  Select,
  Button,
  Notification,
  toast,
  FormContainer,
  Dialog,
  Table,
} from "components/ui";
import FormDesription from "./FormDesription";
import FormRow from "./FormRow";
import { Field, Form, Formik, ErrorMessage } from "formik";
import { HiOutlineMail, HiOutlineLink, HiOutlinePlus } from "react-icons/hi";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { sbUpload, sbUpdate } from "services/ApiService";
import {
  updateAuthorData,
  updateCusDomain,
  updateCusDomainD,
} from "store/userData/authorSlice";
import axios from "axios";
import { HiCheck, HiBan } from "react-icons/hi";
import { AiOutlineReload, AiOutlineDelete } from "react-icons/ai";

const { Addon } = InputGroup;
const { Tr, Th, Td, THead, TBody } = Table;

const validationSchema = Yup.object().shape({
  blogName: Yup.string()
    .required("Blog name cannot be empty")
    .matches(
      /^([a-z0-9]){6,30}$/,
      "Blog name can only contain lowercase alphabets & digits with a reange of 6-30 characters"
    ),
  title: Yup.string()
    .required("Blog title cannot be empty")
    .matches(
      /^([A-Za-z0-9 \u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff] ]){3,500}$/,
      "Blog Title can only contain alphabets & digits with a reange of 6-30 characters"
    ),
  description: Yup.string().required("Blog Description cannot be empty"),
  logoimg: Yup.string().nullable(true),
  faviconimg: Yup.string().nullable(true),
});

const cdvalidationSchema = Yup.object().shape({
  cusDomain: Yup.string().required("Custom Domain is required"),
  ssl: Yup.string().required("SSL status is required"),
});

const sslOptions = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

var logo, favicon;

const Profile = ({ data }) => {
  const dispatch = useDispatch();

  const {
    username,
    title,
    description,
    logoimg,
    faviconimg,
    cus_domain,
    cus_domain_d,
    prev_name,
  } = useSelector((state) => state.userData.author);
  const authID = useSelector((state) => state.auth.user.id);

  const [logoImg, setlogoImg] = useState();
  const [faviconImg, setfaviconImg] = useState();
  const [logoImgURL, setlogoImgURL] = useState(logoimg);
  const [faviconImgURL, setfaviconImgURL] = useState(faviconimg);
  const [dialogOpen, setdialogOpen] = useState(false);

  const [btnLoading, setbtnLoading] = useState(false);
  const [cdbtnLoading, setcdbtnLoading] = useState(false);
  const [cdbtnDisabled, setcdbtnDisabled] = useState(false);
  const [csbtnDisabled, setcsbtnDisabled] = useState(false);

  const [domainDet, setdomainDet] = useState(cus_domain_d);

  const openNotification = (type, text) => {
    toast.push(<Notification type={type}>{text}</Notification>);
  };

  const onAddDialogClose = () => {
    setdialogOpen(false);
  };

  const beforeUpload = (file, fileList) => {
    var valid = true;

    console.log(file);
    console.log(fileList);
    const allowedFileType = ["image/jpeg", "image/png"];
    const maxFileSize = 150000;

    if (fileList.length >= 1) {
      return `You can only upload 1 image file`;
    }

    if (!allowedFileType.includes(file[0].type)) {
      return "Please upload a .jpeg or .png file!";
    }

    if (file[0].size >= maxFileSize) {
      return "Upload image cannot more then 150kb!";
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
  };

  const checkImgs = (values) => {
    var images = [];
    var name = [];
    if (logoImg && faviconImg) {
      images = [logoImg, faviconImg];
      name = ["logo.jpeg", "favicon.jpeg"];
    } else if (logoImg) {
      images = [logoImg];
      name = ["logo.jpeg"];
      favicon = values.faviconimg;
    } else if (faviconImg) {
      images = [faviconImg];
      name = ["favicon.jpeg"];
      logo = values.logoimg;
    } else {
      logo = values.logoimg;
      favicon = values.faviconimg;
    }
    return { images, name };
  };

  const updateProfileData = async (values) => {
    setbtnLoading(true);

    const { images, name } = checkImgs(values);
    console.log(images);
    //const imagepath = 'public/'+authId+'/images/'+name[i];
    console.log(authID);

    if (images.length > 0) {
      openNotification("info", "Uploading images....");
      for (var i = 0; i < images.length; i++) {
        const imagepath = "public/" + authID + "/images/" + name[i];
        await sbUpload("authors", imagepath, images[i]).then(
          ({ error, publicURL }) => {
            if (error) {
              setbtnLoading(false);
              openNotification("danger", error.message);
            }
            if (publicURL) {
              console.log(publicURL);
              const mainurl = publicURL + "?" + new Date().getTime();
              name[i] == "logo.jpeg" ? (logo = mainurl) : (favicon = mainurl);
            }
          }
        );
      }
      openNotification("info", "Images uploaded. Saving the details....");
    }
    console.log(logo);
    console.log(favicon);
    const updateData = {
      title: values.title,
      description: values.description,
      username: values.blogName,
      logoimg: logo,
      faviconimg: favicon,
    };
    await sbUpdate("authors", authID, updateData, "id").then(
      ({ error, data }) => {
        if (error) {
          setbtnLoading(false);
          openNotification("danger", error.message);
        }
        if (data) {
          setbtnLoading(false);
          dispatch(updateAuthorData(updateData));
          openNotification("success", "Updated successfully....");
        }
      }
    );
  };

  const setBtn = (state) => {
    setcdbtnLoading(state);
    setcdbtnDisabled(state);
  };

  const addDomain = async (values) => {
    setBtn(true);
    const { cusDomain, ssl } = values;

    const domainD = cusDomain.split(".");

    const options = {
      method: "GET",
      url: "https://0zmogq-5000.preview.csb.app/api/cus-domain",
      params: {
        incomingDomain: cusDomain,
        targetDomain: "inkflow.tk",
        ssl: ssl === true ? "443" : "80",
      },
    };

    if (domainD.length > 2) {
      setBtn(false);
      openNotification(
        "danger",
        "Do not include www or subdomain in Custom Domain. A Custom domain should be entered in the format - customdomain.com"
      );
    } else {
      axios
        .request(options)
        .then(async function (response) {
          var res = response.data;
          console.log(res);

          const updateData = {
            username: domainD[0],
            cus_domain: domainD[1],
            prev_name: username,
          };
          await sbUpdate("authors", authID, updateData, "id").then(
            ({ error, data }) => {
              if (error) {
                setBtn(false);
                openNotification("danger", error.message);
              }
              if (data) {
                setBtn(false);
                dispatch(updateCusDomain(updateData));
                openNotification(
                  "success",
                  "Custom Domain Added successfully...."
                );
                window.location.reload();
              }
            }
          );
        })
        .catch(function (error) {
          openNotification("danger", error.message);
          setBtn(false);
        });
    }
  };

  const cusdomainStatReload = async (cusDomain) => {
    setcsbtnDisabled(true);
    openNotification("info", "Reloading Status....");

    const options = {
      method: "GET",
      url: "https://0zmogq-5000.preview.csb.app/api/cus-domain/check",
      params: {
        incomingDomain: cusDomain,
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        var { apx_hit, dns_pointed_at, has_ssl, is_resolving } =
          response.data.data;

        const updateData = {
          cus_domain_d: [
            { name: "API Hit", status: apx_hit },
            {
              name: "DNS",
              status: dns_pointed_at === "169.155.54.56" ? true : false,
            },
            { name: "Resolving", status: is_resolving },
            { name: "SSL", status: has_ssl },
          ],
        };

        dispatch(updateCusDomainD(updateData));
        setdomainDet(updateData.cus_domain_d);
        openNotification("success", "Status Reloaded");
        setcsbtnDisabled(false);
      })
      .catch(function (error) {
        openNotification("danger", error.message);
        setcsbtnDisabled(false);
      });
  };

  const cusdomainStatDelete = async (cusDomain) => {
    setcsbtnDisabled(true);
    openNotification("info", "Deleting....");

    const options = {
      method: "GET",
      url: "https://0zmogq-5000.preview.csb.app/api/cus-domain/delete",
      params: {
        incomingDomain: cusDomain,
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        var res = response.data;
        console.log(res);

        const updateData = {
          username: prev_name,
          cus_domain: null,
          prev_name: null,
        };
        await sbUpdate("authors", authID, updateData, "id").then(
          ({ error, data }) => {
            if (error) {
              setBtn(false);
              openNotification("danger", error.message);
            }
            if (data) {
              setBtn(false);
              dispatch(updateCusDomain(updateData));
              openNotification(
                "success",
                "Custom Domain Deleted successfully...."
              );
              window.location.reload();
            }
          }
        );
      })
      .catch(function (error) {
        openNotification("danger", error.message);
        setcsbtnDisabled(false);
      });
  };

  return (
    <>
      <Dialog
        isOpen={dialogOpen}
        onClose={onAddDialogClose}
        onRequestClose={onAddDialogClose}
      >
        <h5 className="mb-4">Add Custom Domain</h5>
        <div>
          <Formik
            initialValues={{
              cusDomain: "",
              ssl: "",
            }}
            validationSchema={cdvalidationSchema}
            onSubmit={(values) => addDomain(values)}
          >
            {({ values, touched, errors }) => {
              return (
                <Form>
                  <FormContainer>
                    <FormItem
                      label="Custom Domain"
                      invalid={errors.cusDomain && touched.cusDomain}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="cusDomain"
                        placeholder="example.com"
                        component={Input}
                      />
                      <ErrorMessage
                        name="cusDomain"
                        render={(msg) => (
                          <div className="text-red-500 text-left">{msg}</div>
                        )}
                      />
                    </FormItem>
                    <FormItem
                      label="Is your Domain already has SSL Certificate?"
                      invalid={errors.ssl && touched.ssl}
                    >
                      <Field name="ssl">
                        {({ field, form }) => (
                          <Select
                            options={sslOptions}
                            placeholder="SSL"
                            onChange={(option) =>
                              form.setFieldValue(field.name, option.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="ssl"
                        render={(msg) => (
                          <div className="text-red-500 text-left">{msg}</div>
                        )}
                      />
                    </FormItem>
                    <FormItem>
                      <Button
                        block
                        variant="solid"
                        type="submit"
                        disabled={cdbtnDisabled}
                        loading={cdbtnLoading}
                      >
                        Add
                      </Button>
                    </FormItem>
                  </FormContainer>
                </Form>
              );
            }}
          </Formik>
        </div>
      </Dialog>
      <Formik
        initialValues={{
          blogName: username,
          title: title,
          description: description,
          logoimg: logoimg,
          faviconimg: faviconimg,
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values) => updateProfileData(values)}
      >
        {({ values, touched, errors, isSubmitting, resetForm }) => {
          const validatorProps = { touched, errors };
          return (
            <Form>
              <FormContainer>
                <FormDesription
                  title="General"
                  desc="Basic info about you blog, like your blog name, title, description, logo image and favicon image that will displayed in public"
                />
                {cus_domain === null ? (
                  <>
                    <FormRow
                      className="items-center justify-center"
                      name="blogName"
                      label="Blog Name"
                      {...validatorProps}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="blogName"
                        render={({
                          field /* { name, value, onChange, onBlur } */,
                        }) => (
                          <InputGroup>
                            <Input placeholder="blogname" {...field} />
                            <Addon>.inkflow.com</Addon>
                          </InputGroup>
                        )}
                      />
                      <div className="text-center my-7">
                        <p>OR</p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setdialogOpen(true);
                        }}
                        className="text-neutral-500"
                        block
                        icon={<HiOutlineLink className="mr-3" />}
                      >
                        <span>Link Custom Domain</span>
                      </Button>
                    </FormRow>
                  </>
                ) : (
                  <div className="mt-10">
                    {[
                      domainDet[0].status,
                      domainDet[1].status,
                      domainDet[2].status,
                      domainDet[3].status,
                    ].includes(false) === true ? (
                      <Alert className="mb-5" showIcon>
                        In order to connect your domain, you'll need to have a
                        DNS A record that points testdomainmi.tk at{" "}
                        <b>169.155.54.56</b>. If you already have an A record
                        for that address, please change it to point at{" "}
                        <b>169.155.54.56</b> and remove any other A records for
                        that exact address. It may take a few minutes for your
                        SSL certificate to take effect once you've pointed your
                        DNS A record.
                      </Alert>
                    ) : null}
                    <Table>
                      <THead>
                        <Tr>
                          <Th>Custom Domain</Th>
                          <Th>API Hit</Th>
                          <Th>DNS</Th>
                          <Th>Resolving</Th>
                          <Th>SSL</Th>
                          <Th></Th>
                          <Th></Th>
                        </Tr>
                      </THead>
                      <TBody>
                        <Tr>
                          <Td>{username + "." + cus_domain}</Td>
                          {domainDet.map((item, index) => (
                            <Td id={index}>
                              {item.status === false ? (
                                <HiBan className="opacity-60" />
                              ) : (
                                <HiCheck className="opacity-60" />
                              )}
                            </Td>
                          ))}
                          <Td>
                            <Button
                              shape="circle"
                              variant="plain"
                              size="xs"
                              disabled={csbtnDisabled}
                              onClick={(e) => {
                                e.preventDefault();
                                cusdomainStatReload(
                                  username + "." + cus_domain
                                );
                              }}
                              icon={<AiOutlineReload />}
                            />
                          </Td>
                          <Td>
                            <Button
                              shape="circle"
                              variant="plain"
                              size="xs"
                              disabled={csbtnDisabled}
                              onClick={(e) => {
                                e.preventDefault();
                                cusdomainStatDelete(
                                  username + "." + cus_domain
                                );
                              }}
                              icon={<AiOutlineDelete />}
                            />
                          </Td>
                        </Tr>
                      </TBody>
                    </Table>
                  </div>
                )}
                <FormRow
                  name="title"
                  label="Title"
                  {...validatorProps}
                  border={false}
                >
                  <Field
                    type="text"
                    autoComplete="off"
                    name="title"
                    placeholder="Title"
                    component={Input}
                  />
                </FormRow>
                <FormRow
                  name="description"
                  label="Description"
                  {...validatorProps}
                >
                  <Field
                    type="text"
                    autoComplete="off"
                    name="description"
                    placeholder="Description"
                    render={({
                      field /* { name, value, onChange, onBlur } */,
                    }) => (
                      <Input placeholder="Description" {...field} textArea />
                    )}
                    prefix={<HiOutlineMail className="text-xl" />}
                  />
                </FormRow>
                <FormRow name="logoimg" label="Logo Image" {...validatorProps}>
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
                        beforeUpload={(file, fileList) =>
                          beforeUpload(file, fileList)
                        }
                        onFileRemove={() => {
                          form.setFieldValue(field.name, logoimg);
                          setlogoImg();
                          setlogoImgURL(logoimg);
                        }}
                        onChange={(file) => {
                          const url = URL.createObjectURL(file[0]);
                          const fileName = "logo.jpeg";
                          const filetype = "image/jpeg";
                          const convertedBlobFile = new File(
                            [file[0]],
                            fileName,
                            { type: filetype, lastModified: Date.now() }
                          );
                          form.setFieldValue(field.name, convertedBlobFile);
                          setlogoImg(convertedBlobFile);
                          setlogoImgURL(url);
                          console.log(values);
                        }}
                      >
                        <Avatar
                          size={60}
                          src={logoImgURL}
                          icon={<HiOutlinePlus />}
                        />
                      </Upload>
                    )}
                  </Field>
                </FormRow>
                <FormRow
                  name="faviconimg"
                  label="Favicon Image"
                  {...validatorProps}
                >
                  <Field name="faviconimg">
                    {({ form, field }) => (
                      <Upload
                        className="cursor-pointer"
                        showList={true}
                        accept=".jpg,.jpeg,.png"
                        beforeUpload={(file, fileList) =>
                          beforeUpload(file, fileList)
                        }
                        onFileRemove={() => {
                          form.setFieldValue(field.name, faviconimg);
                          setfaviconImg();
                          setfaviconImgURL(faviconimg);
                        }}
                        onChange={(file) => {
                          const url = URL.createObjectURL(file[0]);
                          const fileName = "favicon.jpeg";
                          const filetype = "image/jpeg";
                          const convertedBlobFile = new File(
                            [file[0]],
                            fileName,
                            { type: filetype, lastModified: Date.now() }
                          );
                          form.setFieldValue(field.name, convertedBlobFile);
                          setfaviconImg(convertedBlobFile);
                          setfaviconImgURL(url);
                          console.log(values);
                        }}
                      >
                        <Avatar
                          size={60}
                          src={faviconImgURL}
                          icon={<HiOutlinePlus />}
                        />
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
          );
        }}
      </Formik>
    </>
  );
};

export default Profile;
