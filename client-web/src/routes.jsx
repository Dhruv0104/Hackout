import { createBrowserRouter, useParams } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Registration from './pages/Producers/Registration';
import CreateSmartContract from './pages/government/create-smart-contract';
import GovernmentDashboard from './pages/government/dashboard';
import ActiveContractsTable from './pages/government/active-contracts';
import MySubsidies from './pages/Producers/MySubsidies';
import MilestoneForm from './pages/Producers/MilestoneForm';
import ProducerDashboard from './pages/Producers/ProducerDashboard';
import AuditorDashboard from './pages/auditors/AuditorDashboard';
import VerifyMilestones from './pages/auditors/VerifyMilestones';
import LogViewer from './pages/auditors/LogViewer';
import Milestones from './pages/Producers/milestones';

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
	{
		path: '/producer',
		errorElement: <ErrorElement />,
		children: [
			{ path: 'registration', element: <Registration /> },
			{ path: 'dashboard', element: <ProducerDashboard /> },
			{ path: 'subsidies', element: <MySubsidies /> },
			{ path: 'milestone-form/:subsidyId', element: <MilestoneForm /> },
			{ path: 'fetch-milestones/:id', element: <Milestones /> },
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
	{
		path: '/auditor',
		children: [
			{ path: 'dashboard', element: <AuditorDashboard /> },
			{ path: 'verify-milestones', element: <VerifyMilestones /> },
			{ path: 'log-viewer/:contractId', element: <LogViewer /> },
		],
	},
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
