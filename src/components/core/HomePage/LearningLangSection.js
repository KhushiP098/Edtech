import React from 'react'
import HighLightText from './HighLightText'
import know_Your_Progress from '../../../assets/Images/Know_your_progress.png'
import compare_with_others from '../../../assets/Images/Compare_with_others.png'
import plan_your_lesson from '../../../assets/Images/Plan_your_lessons.png'
import CTAButton from './CTAButton'

const LearningLangSection = () => {
    return (

        <div className='mt-[130px]'>

            <div className='flex flex-col items-center  gap-5'>

                <div className='text-4xl  font-semibold text-center'>
                    Your Swiss Knife
                    <HighLightText text={"learning any language"} />
                </div>

                <div className='text-center text-richblack-600 mx-auto text-base mt-3 font-medium w-[70%]'>
                    Using spin making learning multiple languages easy. With 20+ languages realistic
                    voice-over,progress tracking,custom schdule and more.
                </div>

                <div className='flex flex-row items-center justify-center mt-5'>

                  <img src={know_Your_Progress} alt="knowYourProgressImage" className='object-contain  -mr-32'/>
                  <img src={compare_with_others} alt="compare_with_others" className='object-contain'/>
                  <img src={plan_your_lesson} alt="plan_your_lesson" className='object-contain -ml-36'/>

                </div>

                <div className='w-fit'>
                <CTAButton  active={true} linkto={"/signup"}>
                     <div>Learn more</div> 
                </CTAButton>
                </div>



            </div>

        </div>

    )
}

export default LearningLangSection
