import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import PageLayout from '../../components/layout/PageLayout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

const CreateSmartContract = () => {
	const initialValues = {
		contractName: '',
		selectedProducer: null,
		totalAmount: '',
		milestone: { description: '', amount: '' },
	};
	const [producers, setProducers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const navigate = useNavigate();
	const toast = useRef(null);

	const baseInputClasses =
		'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';

	const validationSchema = Yup.object().shape({
		contractName: Yup.string().required('Contract Name is required'),
		selectedProducer: Yup.object().required('Producer selection is required'),
		totalAmount: Yup.number()
			.typeError('Total Amount must be a number')
			.required('Total Amount is required')
			.test('match-milestone', 'Total Amount must equal Milestone Amount', function (value) {
				return Number(value) === Number(this.parent.milestone.amount || 0);
			}),
		milestone: Yup.object().shape({
			description: Yup.string().required('Milestone description is required'),
			amount: Yup.number()
				.typeError('Milestone amount must be a number')
				.required('Milestone amount is required'),
		}),
	});

	useEffect(() => {
		const loadProducers = async () => {
			setLoading(true);
			const res = await fetchGet({ pathName: 'government/fetch-all-producers' });
			if (res?.success && res?.data) {
				setProducers(res.data);
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: res?.message || 'Failed to fetch producers',
				});
			}
			setLoading(false);
		};
		loadProducers();
	}, []);

	const handleSubmit = async (values) => {
		setSubmitLoading(true);
		try {
			const res = await fetchPost({
				pathName: 'government/create-contract',
				body: JSON.stringify({
					contractName: values.contractName,
					totalAmount: values.totalAmount,
					producer: values.selectedProducer,
					milestones: [values.milestone],
				}),
			});
			if (res?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Smart Contract Deployed!',
				});
				setTimeout(() => {
					navigate('/government/active-contracts');
				}, 1000);
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: res?.message || 'Failed to create contract',
				});
			}
		} catch (error) {
			toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
		}
		setSubmitLoading(false);
	};

	return (
		<PageLayout>
			<Toast ref={toast} />
			{submitLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[0px] bg-black/10">
					<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
				</div>
			)}
			<div className="p-5">
				<h1 className="text-3xl text-primary font-bold mb-8 text-start tracking-wide">
					Create New Contract
				</h1>
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
							<p className="mt-3 text-primary">Loading...</p>
						</div>
					</div>
				) : (
					<div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
						<Formik
							initialValues={initialValues}
							validationSchema={validationSchema}
							onSubmit={handleSubmit}
						>
							{({ values, setFieldValue }) => (
								<Form>
									<div className="mb-4">
										<label className="block mb-1 font-medium">
											Contract Name
										</label>
										<Field
											as={InputText}
											name="contractName"
											className={baseInputClasses}
											placeholder="e.g., Green Hydrogen Production Q1 2024"
										/>
										<ErrorMessage
											name="contractName"
											component="div"
											className="text-red-500 text-sm"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4 mb-4">
										<div>
											<label className="block mb-1 font-medium">
												Select Producer
											</label>
											<Dropdown
												value={values.selectedProducer}
												options={producers}
												onChange={(e) =>
													setFieldValue('selectedProducer', e.value)
												}
												optionLabel="companyName"
												placeholder="Select a producer"
												className="w-full rounded border border-gray-300 transition-all focus-within:shadow-none focus-within:ring-2 focus-within:ring-primary hover:border-primary"
											/>
											<ErrorMessage
												name="selectedProducer"
												component="div"
												className="text-red-500 text-sm"
											/>
										</div>

										<div>
											<label className="block mb-1 font-medium">
												Producer Address
											</label>
											<InputText
												className={baseInputClasses}
												value={
													values.selectedProducer?.walletAddress
														? values.selectedProducer.walletAddress.slice(
																0,
																4
														  ) + 'xxxxxxxxxxxxxx'
														: ''
												}
												disabled
											/>
										</div>
									</div>

									<div className="mb-4">
										<label className="block mb-1 font-medium">
											Total Subsidy Amount (ETH)
										</label>
										<Field
											as={InputText}
											name="totalAmount"
											className={baseInputClasses}
											placeholder="e.g. 0.01"
										/>
										<ErrorMessage
											name="totalAmount"
											component="div"
											className="text-red-500 text-sm"
										/>
									</div>

									<div className="mb-5">
										<h3 className="text-lg font-semibold mb-2">
											Milestone (Tons)
										</h3>
										<div className="grid grid-cols-3 gap-2">
											<Field
												as={InputText}
												name="milestone.description"
												className={`${baseInputClasses} col-span-2`}
												placeholder="Milestone description"
											/>
											<Field
												as={InputText}
												name="milestone.amount"
												className={`${baseInputClasses} col-span-1`}
												placeholder="Amount (ETH)"
											/>
										</div>
										<ErrorMessage
											name="milestone.description"
											component="div"
											className="text-red-500 text-sm"
										/>
										<ErrorMessage
											name="milestone.amount"
											component="div"
											className="text-red-500 text-sm"
										/>
									</div>

									<Button
										type="submit"
										label={loading ? 'Deploying...' : 'Deploy Smart Contract'}
										className="w-full bg-primary text-white hover:bg-primary-dark"
										disabled={loading}
									/>
								</Form>
							)}
						</Formik>
					</div>
				)}
			</div>
		</PageLayout>
	);
};

export default CreateSmartContract;
