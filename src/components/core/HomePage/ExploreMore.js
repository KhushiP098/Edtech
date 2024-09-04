
import React,{useState} from 'react'
import HighLightText from './HighLightText'
import {HomePageExplore} from '../../../data/homepage-explore'
import CourseCard from './CourseCard'

const tabsName=[
    "Free",
    "New to Coding",
    "Most popular",
    "Skills paths",
    "Career paths"
]

const ExploreMore = () => {
      
   const data=HomePageExplore; 
    const [currentTab,setTab]=useState(tabsName[0]);
    const [courses,setCourses]=useState(data[0].courses);
    const [currentCard,setCurrentCard]=useState(data[0].courses[0].heading)
    
     const  setMyCards=(ind)=>{
        setTab(tabsName[ind]);
        setCourses(data[ind].courses)
        setCurrentCard(data[ind].courses[ind].heading)
     }

  return (
    <div className=''>

        <div className='text-4xl text-center font-semibold '>
           Unlock the <HighLightText text={"power of code"}/>
         </div> 

         <p className='text-center text-richblack-300  text-[16px] mt-3'>
            learn to build anything you can imagine
          </p>  

          <div className='flex flex-row rounded-full bg-richblue-800 mb-5 border-r border-richblack-100 my-4' >
            {
                tabsName.map((elem,ind)=>{
                    return(
                         <div  className={`text-[16px] flex flex-row items-center gap-2  ${currentTab===elem} ? "bg-richblack-900 text-richblack-5 font-medium" :" text-richblack-200" rounded-full transition-all cursor-pointer  hover:bg-richblack-900 hover:text-richblack-5 px-7  py-4`} key={ind} onClick={()=>setMyCards(ind)}>
                            {elem}
                          </div>  
                    )
                })
            }

          </div>

          {/* <div className='flex flex-row gap-5'>
            {
                courses.map((elem,ind)=>{
                    return(
                        <CourseCard  id={ind}  key={ind} cardData={elem} currentCard={currentCard} setCurrentCard={setCurrentCard}/>  
                    )

                })
            }
          </div> */}
 
         
       
    </div>
  )
}

export default ExploreMore
