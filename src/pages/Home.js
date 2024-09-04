import React from 'react'
import { FaArrowRight } from 'react-icons/fa'

import { Link } from 'react-router-dom'

import HighLightText from '../components/core/HomePage/HighLightText'
import CTAButton from '../components/core/HomePage/CTAButton'
import Banner from '../assets/Images/banner.mp4'
import CodeBlocks from '../components/core/HomePage/CodeBlocks'
import TimeLineSection from '../components/core/HomePage/TimeLineSection'
import LearningLangSection from '../components/core/HomePage/LearningLangSection'
import InstructorSection from '..//components/core/HomePage/InstructorSection'
import ExploreMore from '../components/core/HomePage/ExploreMore'

import Footer from '../components/common/Footer'
const Home = () => {
  return (
    <div>
      {/* Section1 */}
      <div className='relative mx-auto flex flex-col w-11/12 items-center text-white justify-between'>

        <Link to={"/signup"}>

          <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit'>
            <div className='flex flex-row items-center gap-2  rounded-full  px-10 py-[5px] group-hover:bg-richblack-900'   >
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>

          </div>


        </Link>

        <div className='text-center text-4xl semi-bold mt-7'>
          Empower Your future text
          <HighLightText text={"Coding skills"} />
        </div>

        <div className='mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
          With our online coding courses,you can learn at your own pace ,from anywhere in the world, and access to a wealth of resources
          ,including hands-on projects ,quizzes,and,presonalised feedback from instructors.

        </div>

        <div className='flex flex-row gap-7  mt-8'>

          <CTAButton active={true} linkto={"/signup"}>
            Learn More
          </CTAButton>

          <CTAButton active={false} linkto={"/login"}>
            Book a demo
          </CTAButton>


        </div>

        <div className='shadow-blur-200 mx-3 my-12'>
          <video muted loop autoPlay>
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/*code section1  */}
        <div>
          <CodeBlocks position={"lg:flex-row"}
            heading={
              <div className='text-4xl font-semibold'>Unlock Your
                <HighLightText text={"coding potential"} />
                with our online courses
              </div>}

            subheading={"Our courses are designed  and taught by industry experts who have years of experience "}
            ctabtn1={
              {
                btnText: "try it yourself",
                linkto: "/signup",
                active: true,
              }
            }

            ctabtn2={
              {
                btnText: "lear more",
                linkto: "/login",
                active: false,

              }
            }

            codeblock={`
                                <!DOCTYPE html>
                                <html>
                                <head> <title> </title>
                                </head>
                                <body>
                                 <h1>Hello world </h1>
                                </body>

                                </html>

                           `}

            codeColour={"yellow"}
          />
        </div>

        {/* code section 2 */}
        <div>
          <CodeBlocks position={"lg:flex-row-reverse"}
            heading={
              <div className='text-4xl font-semibold'>Start
                <HighLightText text={"coding in seconds"} />
                with our online courses
              </div>}

            subheading={"Our courses are designed  and taught by industry experts who have years of experience "}
            ctabtn1={
              {
                btnText: "continue Lesson",
                linkto: "/signup",
                active: true,
              }
            }

            ctabtn2={
              {
                btnText: "lear more",
                linkto: "/login",
                active: false,

              }
            }

            codeblock={`
                                <!DOCTYPE html>
                                <html>
                                <head> <title> </title>
                                </head>
                                <body>
                                 <h1>Hello world </h1>
                                </body>

                                </html>

                           `}

            codeColour={"yellow"}
          />
        </div>
    
        <ExploreMore/>

      </div>

      {/* Section2 */}
      <div className='bg-white text-richblack-700 py-10'>

        <div className='homePageBg h-[310px]'>

          <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>

            <div className='h-[150px]'></div>

            <div className='flex flex-row gap-7 text-white'>

              <CTAButton active={true} linkto={"/signup"}>
                <div className='flex items-center gap-3'>Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>

              <CTAButton active={false} linkto={"/login"}>
                <div>
                  Learn more
                </div>
              </CTAButton>


            </div>


          </div>



        </div>

        <div className='mx-auto w-11/12 flex flex-col items-center gap-7 justify-between max-w-maxContent'>

          <div className='flex  flex-row gap-5 mb-10 mt-[95px]'>

            <div className='text-4xl font-semibold w-[45%]'>
              Get the skills you need for a
              <HighLightText text={"job that is in demand"} />
            </div>

            <div className='flex flex-col  gap-10 w-[40%] items-start'>
              <div className='text-[16px]'>
                The mordern StudyNotation is the dictates its own terms.Today,to be a good competitive specialist
                required more than professional skills.
              </div>

              <CTAButton active={true} linkto={"/signup"}>
                Learn more
              </CTAButton>
            </div>

          </div>

          <TimeLineSection />

          <LearningLangSection />

        </div>
      </div>

      {/* Section3 */}
      <div className='w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-8 first-leeter bg-richblack-900 text-white '>

          <InstructorSection/>
          <h2  className='text-4xl text-center font-semibold mt-10 '>Review from other learners</h2>
      </div>

      {/* Footer */}
      <Footer/>
      
    </div>
  )
}

export default Home;