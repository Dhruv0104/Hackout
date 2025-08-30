import { createBrowserRouter } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Registration from './pages/Producers/Registration';
import CreateSmartContract from './pages/government/create-smart-contract';
import GovernmentDashboard from './pages/government/dashboard';
import ActiveContractsTable from './pages/government/active-contracts';
import MySubsidies from './pages/Producers/MySubsidies';
import ProducerDashboard from './pages/Producers/ProducerDashboard';

const routes = createBrowserRouter([
	{
		path: '/',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/login',
		// loader: loginLoader,
		element: <Login />,
	},
	// {
	// 	path: '/forgot-password',
	// 	loader: loginLoader,
	// 	element: <ForgotPassword />,
	// },
	// Admin routes
	{
		path: '/admin',
		// loader: verifyLoader('admin'),
		errorElement: <ErrorElement />,
		children: [
			// { path: 'dashboard', element: <AdminDashboard /> },
			// { path: 'institute', element: <InstituteList /> },
			// { path: 'institute/:id/departments', element: <AdminDepartment /> },
			// {
			// 	path: 'institute/:instituteId/department/:departmentId',
			// 	element: <FacultyAndStudentList />,
			// },
		],
	},

	{
		path: '/producer',
		errorElement: <ErrorElement />,
		children: [
			{ path: 'registration', element: <Registration /> },
			{ path: 'subsidies', element: <MySubsidies /> },
			{ path: 'dashboard', element: <ProducerDashboard /> },
		],
	},

	{
		path: '/government',
		children: [
			{ path: 'create-smart-contract', element: <CreateSmartContract /> },
			{ path: 'dashboard', element: <GovernmentDashboard /> },
			{ path: 'active-contracts', element: <ActiveContractsTable /> },
		],
	},
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
