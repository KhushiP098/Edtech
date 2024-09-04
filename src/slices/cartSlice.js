import {createSlice} from '@reduxjs/toolkit'
import {toast} from  'react-hot-toast'

const initialState={
   cart: localStorage.getItem("cart")? JSON.parse(localStorage.getItem("cart")) :[]  ,
   totalItems:localStorage.getItem("totalItems")?JSON.parse(localStorage.getItem("totalItems")):0 ,
   total:localStorage.getItem("total")? JSON.parse(localStorage.getItem("total")) :0,
}

const cartSlice =createSlice({
    name:"cart",
    initialState:initialState,
    reducers:{

        addToCart:(state,value)=>{
            const course =value.payload;
            const index=state.cart.findIndex((item)=>item._id===course._id)
            // if there is no item in teh cart array which matches the condition than this function
            // findIndex() retruns -1
               
            if(index>=0){
                //if the course is already in the cart
                toast.error("Course already in cart");
                return;
            }

            // if the course is not in the cart ,add it to the cart
             state.cart.push(course);
             // updatethe total quantity and price
             state.totalItems++;
             state.total+=course.price;


             // update to  localStorage
             localStorage.setItem("total",JSON.stringify(state.total));
             localStorage.setItem("totalItems",JSON.stringify(state.totalItems));
             localStorage.setItem("cart",JSON.stringify(state.cart));

             // show toast
             toast.success("Course added to cart");


        },

        removeFromCart: (state, action) => {
            const courseId = action.payload
            const index = state.cart.findIndex((item) => item._id === courseId)
      
            if (index >= 0) {
              // If the course is found in the cart, remove it
              state.totalItems--
              state.total -= state.cart[index].price
              state.cart.splice(index, 1)
              // Update to localstorage
              localStorage.setItem("cart", JSON.stringify(state.cart))
              localStorage.setItem("total", JSON.stringify(state.total))
              localStorage.setItem("totalItems", JSON.stringify(state.totalItems))
              // show toast
              toast.success("Course removed from cart")
            }
          },
          resetCart: (state) => {
            state.cart = []
            state.total = 0
            state.totalItems = 0
            // Update to localstorage
            localStorage.removeItem("cart")
            localStorage.removeItem("total")
            localStorage.removeItem("totalItems")
          },

        
        
    }
});

export const {addToCart,removeFromCart,resetCart}=cartSlice.actions;
export default cartSlice.reducer;

