import React, { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { fetchPost } from '../../utils/fetch.utils';

// ✅ Validation Schema
const ProducerSchema = Yup.object().shape({
	companyName: Yup.string().required('Company Name is required'),
	contactPerson: Yup.string().required('Contact Person is required'),
	email: Yup.string().email('Invalid email format').required('Email is required'),
	phone: Yup.string()
		.matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
		.required('Phone number is required'),
});

const baseInputClasses =
	'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';

const Registration = () => {
	const navigate = useNavigate();
	const toast = useRef(null);
	return (
		<>
			<Toast ref={toast} />
			<div className="flex justify-center items-center min-h-screen bg-gray-100">
				<div className="bg-white shadow-xl rounded-2xl pt-5 pb-8 px-6 w-full max-w-lg">
					<h2 className="text-2xl font-bold text-center mb-7 text-primary">
						Registration
					</h2>
					<Formik
						initialValues={{
							companyName: '',
							contactPerson: '',
							email: '',
							phone: '',
						}}
						validationSchema={ProducerSchema}
						onSubmit={async (values, { resetForm }) => {
							console.log('Form Data:', values);
							try {
								const response = await fetchPost({
									pathName: 'auth/registration-producer',
									body: JSON.stringify(values),
								});
								if (response.success) {
									resetForm();
									navigate('/login');
								} else {
									toast.current.show({
										severity: 'error',
										summary: 'Registration Failed',
										detail: response.message,
										life: 3000,
									});
								}
							} catch (error) {
								toast.current.show({
									severity: 'error',
									summary: 'Registration Failed',
									detail: error.message,
									life: 3000,
								});
							}
						}}
					>
						{({ values, handleChange, handleBlur, errors, touched }) => (
							<Form className="space-y-5">
								<div>
									<span className="p-input-icon-left w-full">
										<InputText
											id="companyName"
											name="companyName"
											value={values.companyName}
											onChange={handleChange}
											onBlur={handleBlur}
											placeholder="Company Name"
											className={`${baseInputClasses} ${
												errors.companyName && touched.companyName
													? 'ring-2 ring-red-400 border-red-400'
													: ''
											}`}
										/>
									</span>
									<ErrorMessage
										name="companyName"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<div>
									<span className="p-input-icon-left w-full">
										<InputText
											id="contactPerson"
											name="contactPerson"
											value={values.contactPerson}
											onChange={handleChange}
											onBlur={handleBlur}
											placeholder="Contact Person"
											className={`${baseInputClasses} ${
												errors.contactPerson && touched.contactPerson
													? 'ring-2 ring-red-400 border-red-400'
													: ''
											}`}
										/>
									</span>
									<ErrorMessage
										name="contactPerson"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<div>
									<span className="p-input-icon-left w-full">
										<InputText
											id="email"
											name="email"
											value={values.email}
											onChange={handleChange}
											onBlur={handleBlur}
											placeholder="Email Address"
											className={`${baseInputClasses} ${
												errors.email && touched.email
													? 'ring-2 ring-red-400 border-red-400'
													: ''
											}`}
										/>
									</span>
									<ErrorMessage
										name="email"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<div>
									<span className="p-input-icon-left w-full">
										<InputText
											id="phone"
											name="phone"
											value={values.phone}
											onChange={handleChange}
											onBlur={handleBlur}
											placeholder="Phone Number"
											className={`${baseInputClasses} ${
												errors.phone && touched.phone
													? 'ring-2 ring-red-400 border-red-400'
													: ''
											}`}
										/>
									</span>
									<ErrorMessage
										name="phone"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<Button
									type="submit"
									label="Register"
									className="w-full bg-primary text-white text-xl py-2 rounded hover:primary-hover font-semibold"
								/>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</>
	);
};

export default Registration;
