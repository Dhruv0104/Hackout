import React from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import PageLayout from "../../components/layout/PageLayout";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const producers = [
  { name: "Producer 1", address: "0xABC123" },
  { name: "Producer 2", address: "0xDEF456" },
  { name: "Producer 3", address: "0xGHI789" },
];

const CreateSmartContract = () => {
  const initialValues = {
    contractName: "",
    selectedProducer: null,
    totalAmount: "",
    milestone: { description: "", amount: "" },
  };

  const validationSchema = Yup.object().shape({
    contractName: Yup.string().required("Contract Name is required"),
    selectedProducer: Yup.object().required("Producer selection is required"),
    totalAmount: Yup.number()
      .typeError("Total Amount must be a number")
      .required("Total Amount is required")
      .test(
        "match-milestone",
        "Total Amount must equal Milestone Amount",
        function (value) {
          return Number(value) === Number(this.parent.milestone.amount || 0);
        }
      ),
    milestone: Yup.object().shape({
      description: Yup.string().required("Milestone description is required"),
      amount: Yup.number()
        .typeError("Milestone amount must be a number")
        .required("Milestone amount is required"),
    }),
  });

  const handleSubmit = (values) => {
    console.log({
      contractName: values.contractName,
      totalAmount: values.totalAmount,
      producer: values.selectedProducer,
      milestones: [values.milestone], // keep array for flexibility
    });
    alert("Smart Contract Deployed! Check console for details.");
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h2 className="text-2xl font-semibold mb-4">Create New Contract</h2>
        <p className="mb-6 text-gray-600">
          Deploy a custom smart contract for subsidy distribution
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form>
              {/* Contract Name */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Contract Name</label>
                <Field
                  as={InputText}
                  name="contractName"
                  className="w-full"
                  placeholder="e.g., Green Hydrogen Production Q1 2024"
                />
                <ErrorMessage
                  name="contractName"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Producer Selection */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium">Select Producer</label>
                  <Dropdown
                    value={values.selectedProducer}
                    options={producers}
                    onChange={(e) => setFieldValue("selectedProducer", e.value)}
                    optionLabel="name"
                    placeholder="Select a producer"
                    className="w-full"
                  />
                  <ErrorMessage
                    name="selectedProducer"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Producer Address</label>
                  <InputText
                    className="w-full"
                    value={values.selectedProducer?.address || ""}
                    disabled
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Total Subsidy Amount</label>
                <Field
                  as={InputText}
                  name="totalAmount"
                  className="w-full"
                  placeholder="₹100,000"
                />
                <ErrorMessage
                  name="totalAmount"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Single Milestone */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Milestone</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    as={InputText}
                    name="milestone.description"
                    className="col-span-2"
                    placeholder="Milestone description"
                  />
                  <Field
                    as={InputText}
                    name="milestone.amount"
                    className="col-span-1"
                    placeholder="Amount"
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
                label="Deploy Smart Contract"
                className="w-full bg-primary text-white hover:bg-primary-dark"
              />
            </Form>
          )}
        </Formik>
      </div>
    </PageLayout>
  );
};

export default CreateSmartContract;
