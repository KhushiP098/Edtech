
import React from 'react'
import { useSelector,useDispatch } from 'react-redux';
import Iconbtn from '../../../common/Iconbtn'
import { buyCourse } from '../../../../services/operations/studentFeaturesAPI';
import { useNavigate } from 'react-router-dom';

const RenderTotalAmount = () => {
    
  const {cart, total} =useSelector((state)=>state.cart);
  const {token}=useSelector((state)=>state.auth);
  const {user}=useSelector((state)=>state.profile);
  const navigate=useNavigate();
  const dispatch=useDispatch();

   
  const handleBuyCourse=()=>{
    const courses=cart.map((course)=>course._id);
    buyCourse(token,courses,user,navigate,dispatch)
    console.log("Bought these courses",courses)

  }

  return (
    <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
    <p className="mb-1 text-sm font-medium text-richblack-300">Total:</p>
    <p className="mb-6 text-3xl font-medium text-yellow-100">₹ {total}</p>
    <Iconbtn
      text="Buy Now"
      onclick={handleBuyCourse}
      customClasses="w-full justify-center text-white bg-richblack-900  p-2 rounded-md border border-white "
    />
  </div>
  )
}

export default RenderTotalAmount
