// This will prevent authenticated users from accessing this route
//If a user is logged in so that person must be directly navigated to its profile dashboard not to the signup/login route

import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth)

  if (token === null) {
    return children; // go to signup/login route

  } else {
    return <Navigate to="/dashboard/my-profile" />
  }
}

export default OpenRoute