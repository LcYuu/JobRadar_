import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children, restricted = false }) => {
  const { jwt } = useSelector(store => store.auth);
  
  if (jwt && restricted) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;