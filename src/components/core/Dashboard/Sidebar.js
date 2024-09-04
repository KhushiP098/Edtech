
import React,{useState} from 'react'
import  {sidebarLinks}   from '../../../data/dashboard-links'
import { logout } from '../../../services/operations/authAPI'
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { VscSignOut } from 'react-icons/vsc';

import ConfirmationalModal from '../../common/ConfirmationalModal'
import SidebarLink from './SidebarLink'


const Sidebar = () => {

    const { user, loading: profileLoading } = useSelector((state) => state.profile);
    const { loading: authLoading } = useSelector((state) => state.auth);
    const [confirmationModal,setConfirmationModal]=useState(null);

     const dispatch=useDispatch();
     const navigate =useNavigate();


    if (profileLoading || authLoading) {
        return (
            <div className=''>
                Loading...mt-10
            </div>
        )
    }

    return (
        <div>
            <div className='flex flex-col min-w-[222px] border-r-[1px]  border-richblack-700  bg-richblack-800 py-10'>
                <div className='flex flex-col'>
                    {
                        sidebarLinks.map((link) => {
                            if (link.type && user?.accountType !== link.type) return null;
                            return (
                                <SidebarLink key={link.id} link={link} iconName={link.icon} />
                              
                            )
                        })
                    }
                </div>

                <div className='mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-600 '>
                    <div className='flex flex-col'>

                        <SidebarLink link={{ name: "Settings", path: "dashboard/setting" }} IconName="VscSettingGear" />
                          

                        <button onClick={() =>setConfirmationModal(
                            {
                                text1: "Are You Sure ?",
                                 text2:"You will be logged out of your account!",
                            btn1Text:"Logout",
                            btn2Text:"Cancel",
                            btn1Handler:()=>dispatch(logout(navigate)),
                            btn2Handler:()=>setConfirmationModal(null),
        
                           }
                        ) }         
                        className='text-sm font-medium  text-richblack-300'
                        >
                           <div className='flex  items-center gap-x-2 '>
                            <VscSignOut className='text-lg' />
                            <span>Logout</span>
                            
                            </div> 

                       </button>
                </div>
            </div>
        </div>
         
         {/* if the  value of the confirmational modal is null then it will be not visible */}
        {confirmationModal && <ConfirmationalModal modalData={confirmationModal} />}
      
    </div >
  )
}

export default Sidebar;
