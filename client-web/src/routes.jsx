import { createBrowserRouter } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Registration from './pages/Producers/Registration';

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
			// { path: 'institute', element: <InstituteList /> },
			// { path: 'institute/:id/departments', element: <AdminDepartment /> },
			// {
			// 	path: 'institute/:instituteId/department/:departmentId',
			// 	element: <FacultyAndStudentList />,
			// },
		],
	},

	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
