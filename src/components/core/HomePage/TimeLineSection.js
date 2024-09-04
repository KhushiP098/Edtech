import React from 'react'

import logo1 from '../../../assets/TimeLineLogo/Logo1.svg'
import logo2 from '../../../assets/TimeLineLogo/Logo2.svg'
import logo3 from '../../../assets/TimeLineLogo/Logo3.svg'
import logo4 from '../../../assets/TimeLineLogo/Logo4.svg'

import timeLineImage from '../../../assets/Images/TimelineImage.png'

const timeline=[
    { 
        logo:logo1,
        heading:"Leadership",
        description:"Fully committed to the success company",
    },
    { 
        logo:logo2,
        heading:"Responsibility",
        description:"Students will always be our top priority",
    },
    { 
        logo:logo3,
        heading:"Flexibility",
        description:"The ability to switch is an important skills",
    }
    ,
    { 
        logo:logo4,
        heading:"Solve the problem",
        description:"Code your way to a solution",
    }
]

const TimeLineSection = () => {
  return (
    <div className='flex flex-row items-center gap-5'>

           {/* left div */}

        <div className='w-[45%] flex flex-col gap-5'>
            {
                timeline.map((elem,ind)=>{
                    return(
                        <div className='flex flex-row gap-6' key={ind}>

                           <div className='w-[50px] h-[50px] bg-white flex items-center'>
                            <img src={elem.logo}/>
                          </div>  

                           <div className='flex flex-col gap-4'>

                            {/* heading */}
                              <h2 className='font-semibold text-[18px]'>{elem.heading}</h2>

                            {/*subheading */}
                            <p className='text-base'>{elem.description}</p>
                            </div>
                        </div>
                    )
                })
            }
        </div>

        {/* right div */}
        <div className='relative  shadow-blue-200'>

             <img src={timeLineImage} 
             className='shadow-white object-cover h-fit'
             />

             <div  className='absolute bg-caribbeangreen-700 flex flex-row text-white uppercase py-7 left-[50%] -translate-x-[50%] -translate-y-[50%]'>
                 
               <div className='flex flex-row gap-5 items-center border-r border-caribbeangreen-300 px-7'>
                <p className='text-3xl font-bold'>10</p>
                <p className='text-caribbeangreen-300 text-sm'>Years of experience</p>
               </div>

               <div className='flex flex-row  gap-5 items-center px-7'>
                <p className='text-3xl font-bold'>250</p>
                <p className='text-caribbeangreen-300 text-sm'>Types of Courses</p>
               </div>


             </div>   

        </div>   



      
    </div>
  )
}

export default TimeLineSection
