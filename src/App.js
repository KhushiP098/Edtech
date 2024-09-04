import React from 'react'
import "./App.css"
import Navbar from "./components/common/Navbar"
import VideoDetails from './components/core/ViewCourse/VideoDetails'


import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'
import VerifyEmail from './pages/VerifyEmail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OpenRoute from './components/core/Auth/OpenRoute'
import MyProfile from './components/core/Dashboard/MyProfile'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/common/PrivateRoute'
import Error from './pages/Error'
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Settings from "./components/core/Dashboard/Settings";

import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";
import EnrolledCourses from './components/core/Dashboard/EnrolledCourses'
import Cart from './components/core/Dashboard/Cart/Cart'
import { ACCOUNT_TYPE } from './utils/constants'

import AddCourse from './components/core/Dashboard/Addcourses/index'
import { useSelector } from 'react-redux'
import Contact from './pages/Contact'
import ViewCourse from './pages/ViewCourse'
import Instructor from './components/core/Dashboard/InstructorDashboard/Instructor'

function App() {

  const { user } = useSelector((state) => state.profile)

  return (
    <div className='w-screen  min-h-screen  bg-richblack-900 flex flex-col font-inter ' >

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog/:catalogName" element={<Catalog />} />
        <Route path="/courses/:courseId" element={<CourseDetails/>} />
      
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/signup" element={<OpenRoute><Signup /></OpenRoute>} />
        <Route path="/login" element={<OpenRoute><Login /></OpenRoute>} />
        <Route path="/forgot-Password" element={<OpenRoute><ForgotPassword /></OpenRoute>} />
        <Route path="/update-Password/:id" element={<OpenRoute><UpdatePassword /></OpenRoute>} />
        <Route path="/verify-email" element={<OpenRoute><VerifyEmail /></OpenRoute>} />

        <Route element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>}>
           
          <Route path="/dashboard/my-profile" element={<MyProfile />} />
          <Route path="/dashboard/setting" element={<Settings/>}/>

          {
            user?.accountType === ACCOUNT_TYPE.STUDENT &&
            (
              <>
                <Route path="/dashboard/enrolled-courses" element={<EnrolledCourses />} />
                <Route path="/dashboard/cart" element={<Cart />} />

              </>
            )
          }

{
        user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
          <Route path="dashboard/instructor" element={<Instructor />} />
          <Route path="/dashboard/add-course" element={<AddCourse />} />
          <Route path="/dashboard/my-courses" element={<MyCourses />} />
          <Route path="/dashboard/edit-course/:courseId" element={<EditCourse />} />
          
          </> 
        )
      }
      </Route>

      <Route  element={<PrivateRoute><ViewCourse/></PrivateRoute>} >
        {
          user?.accountType===ACCOUNT_TYPE.STUDENT &&(
            <>
            <Route path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails/>}
            />
              </>
          )
        }
      </Route>

        <Route path="*" element={<Error />} />

      </Routes>

    </div>
  );
}

export default App;
