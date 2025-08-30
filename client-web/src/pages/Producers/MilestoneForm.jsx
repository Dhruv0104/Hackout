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

	const handleSubmit = (values) => {
		console.log('Submitted Data:', values);
		alert('Milestone submitted successfully.');
	};

	const baseInputClasses =
		'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';

	return (
		<PageLayout>
			<div className="p-6 max-w-2xl mx-auto bg-white shadow rounded-2xl">
				<h2 className="text-2xl font-bold mb-4 text-primary">Submit Milestone Report</h2>
				<Formik
					initialValues={{ milestone: '', description: '', files: null }}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
				>
					{({ setFieldValue, values, errors, touched, handleChange, handleBlur }) => (
						<Form className="space-y-5">
							<div>
								<label className="block mb-1 font-medium">Select Milestone</label>
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
								<label className="block mb-1 font-medium">Produced Quantity</label>
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
									name="files"
									accept=".pdf,.jpg,.png,.docx"
									maxFileSize={5000000}
									auto
									chooseLabel="Upload"
									className={`${baseInputClasses} ${
										errors.files && touched.files
											? 'ring-2 ring-red-400 border-red-400'
											: ''
									}`}
									customUpload
									uploadHandler={(e) => setFieldValue('files', e.files[0])}
								/>
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
		</PageLayout>
	);
}
