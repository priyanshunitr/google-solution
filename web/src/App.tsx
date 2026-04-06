import GuestApp from './apps/guest/GuestApp';
import './App.css';

export default function App() {
  // In the future, this root router will conditionally run EmployeeApp,
  // ResponderApp, or GuestApp based on the route, authentication state, or subdomain.
  
  // For now, it delegates directly to the primary Guest application bundle.
  return <GuestApp />;
}
