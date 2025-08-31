import React, { useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Avatar } from "primereact/avatar";
import { fetchPost } from "../../utils/fetch.utils";
import logo from "../../assets/logo.png";

const ProducerSchema = Yup.object().shape({
	companyName: Yup.string().required("Company Name is required"),
	contactPerson: Yup.string().required("Contact Person is required"),
	email: Yup.string()
		.email("Invalid email format")
		.required("Email is required"),
	phone: Yup.string()
		.matches(/^[0-9]{10}$/, "Phone must be 10 digits")
		.required("Phone number is required"),
});

const baseInputClasses =
	"w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary";

const Registration = () => {
	const navigate = useNavigate();
	const toast = useRef(null);

	return (
		<>
			<Toast ref={toast} />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-white to-gray-100 px-4">
				<h1 className="text-4xl font-extrabold text-primary mb-16 tracking-wide drop-shadow-sm overflow-hidden whitespace-nowrap border-r-4 border-primary animate-typing">
					Subsidy<span className="text-gray-800">Track</span>
				</h1>

				<div className="relative w-full max-w-md p-8 rounded-xl shadow-lg backdrop-blur-md bg-white/30 border border-white/40">
					{/* Logo Avatar */}
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
						<Avatar
							image={logo}
							size="xlarge"
							shape="circle"
							className="size-24 shadow-lg border-4 border-white bg-primary/3 p-1.5"
						/>
					</div>

					<h2 className="text-3xl font-bold text-primary text-center my-10">
						Producer Registration
					</h2>

					<Formik
						initialValues={{
							companyName: "",
							contactPerson: "",
							email: "",
							phone: "",
						}}
						validationSchema={ProducerSchema}
						onSubmit={async (values, { resetForm }) => {
							try {
								const response = await fetchPost({
									pathName: "auth/registration-producer",
									body: JSON.stringify(values),
								});
								if (response.success) {
									resetForm();
									toast.current.show({
										severity: "success",
										summary: "Success",
										detail: "Registration Successful.",
									});
									setTimeout(() => navigate("/login"), 1200);
								} else {
									toast.current.show({
										severity: "error",
										summary: "Registration Failed",
										detail: response.message,
										life: 3000,
									});
								}
							} catch (error) {
								toast.current.show({
									severity: "error",
									summary: "Registration Failed",
									detail: error.message,
									life: 3000,
								});
							}
						}}
					>
						{({ values, handleChange, handleBlur, errors, touched }) => (
							<Form className="space-y-5">
								{/* Company Name */}
								<div>
									<InputText
										id="companyName"
										name="companyName"
										value={values.companyName}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder="Company Name"
										className={`${baseInputClasses} ${errors.companyName && touched.companyName
												? "ring-2 ring-red-400 border-red-400"
												: ""
											}`}
									/>
									<ErrorMessage
										name="companyName"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								{/* Contact Person */}
								<div>
									<InputText
										id="contactPerson"
										name="contactPerson"
										value={values.contactPerson}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder="Contact Person"
										className={`${baseInputClasses} ${errors.contactPerson && touched.contactPerson
												? "ring-2 ring-red-400 border-red-400"
												: ""
											}`}
									/>
									<ErrorMessage
										name="contactPerson"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								{/* Email */}
								<div>
									<InputText
										id="email"
										name="email"
										value={values.email}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder="Email Address"
										className={`${baseInputClasses} ${errors.email && touched.email
												? "ring-2 ring-red-400 border-red-400"
												: ""
											}`}
									/>
									<ErrorMessage
										name="email"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								{/* Phone */}
								<div>
									<InputText
										id="phone"
										name="phone"
										value={values.phone}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder="Phone Number"
										className={`${baseInputClasses} ${errors.phone && touched.phone
												? "ring-2 ring-red-400 border-red-400"
												: ""
											}`}
									/>
									<ErrorMessage
										name="phone"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<Button
									type="submit"
									label={<div className="text-white font-semibold">Register</div>}
									className="w-full bg-primary hover:bg-[#2a547a] transition text-white font-semibold py-2.5 rounded shadow-sm transform hover:scale-105"
								/>

								<div className="mt-4 text-center">
									<span className="text-sm text-gray-600">
										Already have an account?{" "}
										<button
											onClick={() => navigate("/login")}
											type="button"
											className="text-primary font-medium hover:underline"
										>
											Login
										</button>
									</span>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</>
	);
};

export default Registration;
