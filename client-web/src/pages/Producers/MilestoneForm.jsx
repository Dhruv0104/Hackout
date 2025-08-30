import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';

const validationSchema = Yup.object({
	milestone: Yup.string().required('Milestone is required'),
	description: Yup.string().required('Produced Quantity is required'),
	files: Yup.mixed().required('Proof/Report file is required'),
});

export default function MilestoneForm() {
	const { subsidyId } = useParams();
	const [milestoneOptions, setMilestoneOptions] = useState([]);

	useEffect(() => {
		const fetchMilestones = async () => {
			try {
				const response = await fetchGet({
					pathName: `producer/subsidy-milestones/${subsidyId}`,
				});
				if (response.success && Array.isArray(response.data)) {
					const options = response.data.map((m) => ({
						label: m.description,
						value: m._id,
					}));
					setMilestoneOptions(options);
				}
			} catch (error) {
				console.error('Error fetching milestones:', error);
			}
		};
		fetchMilestones();
	}, [subsidyId]);

	const handleSubmit = async (values, { resetForm }) => {
		try {
			const formData = new FormData();
			formData.append('milestone', values.milestone);
			formData.append('description', values.description);
			if (values.files) {
				formData.append('file', values.files);
			}
			const producerId = localStorage.getItem('_id');
			formData.append('producerId', producerId);

			const token = localStorage.getItem('token');
			const response = await fetch(
				import.meta.env.VITE_URL + `producer/submit-milestone/${subsidyId}`,
				{
					method: 'POST',
					headers: {
						...(token && { Authorization: 'Bearer ' + token }),
					},
					body: formData,
				}
			);

			const result = await response.json();

			if (!result.success) {
				alert('Error: ' + result.message);
				return;
			}

			alert('Milestone submitted successfully!');
			resetForm();
		} catch (err) {
			alert('Error: ' + err.message);
		}
	};

	const baseInputClasses =
		'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';

	return (
		<PageLayout>
			<div className="py-3 px-7 m-auto">
				<div className="flex items-center gap-1">
					<Button
						icon={<i className="pi pi-angle-left text-3xl text-primary" />}
						rounded
						text
						aria-label="Back"
						className="focus:outline-none focus:ring-0"
						onClick={() => window.history.back()}
					/>
					<h1 className="text-3xl font-bold text-primary">Milestone Report Submission</h1>
				</div>
				<div className="mt-10 p-6 max-w-2xl mx-auto bg-white shadow rounded">
					<Formik
						initialValues={{ milestone: '', description: '', files: null }}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ setFieldValue, values, errors, touched, handleChange, handleBlur }) => (
							<Form className="space-y-5">
								<div>
									<label className="block mb-1 font-medium">
										Select Milestone
									</label>
									<Dropdown
										id="milestone"
										name="milestone"
										value={values.milestone}
										options={milestoneOptions}
										placeholder="Choose milestone"
										onChange={(e) => setFieldValue('milestone', e.value)}
										onBlur={handleBlur}
										className="w-full rounded border border-gray-300 transition-all focus-within:shadow-none focus-within:ring-2 focus-within:ring-primary hover:border-primary"
									/>
									<ErrorMessage
										name="milestone"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<div>
									<label className="block mb-1 font-medium">
										Produced Quantity
									</label>
									<InputText
										id="description"
										name="description"
										value={values.description}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder="Enter produced quantity"
										className={`${baseInputClasses} ${
											errors.description && touched.description
												? 'ring-2 ring-red-400 border-red-400'
												: ''
										}`}
									/>
									<ErrorMessage
										name="description"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<div>
									<label className="block mb-1 font-medium">
										Upload Proof/Report File
									</label>
									<FileUpload
										mode="basic"
										name="file"
										accept=".pdf,.jpg,.png,.docx"
										maxFileSize={5000000}
										auto
										chooseLabel="Upload"
										chooseOptions={{
											icon: 'pi pi-cloud-upload',
											className: 'p-button-sm',
										}}
										className={`border p-2 ${
											errors.files && touched.files
												? 'ring-2 ring-red-400 border-red-400'
												: ''
										}`}
										customUpload
										uploadHandler={(e) => setFieldValue('files', e.files[0])}
									/>
									{values.files && (
										<div className="mt-2 text-sm text-gray-600">
											Selected File:{' '}
											<span className="font-medium">{values.files.name}</span>
										</div>
									)}
									<ErrorMessage
										name="files"
										component="div"
										className="text-red-500 text-sm mt-1"
									/>
								</div>

								<div className="flex justify-end">
									<Button
										type="submit"
										label="Submit"
										className="w-full bg-primary text-white text-lg py-2 rounded hover:primary-hover font-semibold"
									/>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</PageLayout>
	);
}
