import React from 'react'
import CourseCard from './CourseCard'

import { Swiper,SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import   'swiper/css/autoplay'
import { Autoplay, FreeMode, Pagination } from "swiper/modules"


const CourseSlider = ({Courses}) => {
  return (
    <>
      {Courses?.length ? (
          
          //  <p className='text-white'>Course Slider</p>
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          // modules={[FreeMode,Pagination,]}
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-h-[30rem]"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <CourseCard course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>

      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  )
}

export default CourseSlider
