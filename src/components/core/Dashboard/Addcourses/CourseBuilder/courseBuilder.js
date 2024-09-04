import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {createSection,updateSection} from "../../../../../services/operations/courseDetailsAPI"

import {setCourse,setEditCourse,setStep} from "../../../../../slices/courseSlice"
import Iconbtn from "../../../../common/Iconbtn"
import NestedView from "./NestedView"

export default function CourseBuilderForm() {
  const {register,handleSubmit,setValue,formState: { errors },} = useForm()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null);
  const dispatch = useDispatch()


  //whenever edit section or create section button is pressed this func is called
  const onSubmit = async (data) => {
  
    setLoading(true);

    let result;
 

    // id you are editing
    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      )
      console.log("edit", result)
    } 
    // if we are creating the section
    else {

      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token
      )
    }

    //either section is updated or created
    if (result) {
      // console.log("section result", result)

      // update the course data with result
      dispatch(setCourse(result))

      // if we have edited the data we will again set editsection name as false
      setEditSectionName(null)

      // after the successful creation or updation we have again marked the sectionName field value as empty
      setValue("sectionName", "")
    }
    setLoading(false)
  }

  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  const handleChangeEditSectionName = (sectionId, sectionName) => {

    // if teh section on which we are clicking for editing if ts already in the edit mode so we will cancel the edit
    if (editSectionName === sectionId) {
      cancelEdit()
      return;
    }

    // else edit the section name of the section iD given
    setEditSectionName(sectionId)
    setValue("sectionName", sectionName)
  }

  const goToNext = () => {

    if (course.courseContent.length === 0) {
      toast.error("Please add atleast one section");
      return;
    }
    if (
      course.courseContent.some((section) => section.subSections.length === 0)) {
      toast.error("Please add atleast one lecture in each section");
      return;
    }

    dispatch(setStep(3))
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* section name */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            Section Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="form-style w-full p-1"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>

        {/* create section /edit button */}
        {/* This is a submit button if editSectionName is false then create section button is used to call teh onSubmit handler */}
        <div className="flex items-end gap-x-4">
         <Iconbtn
            type="submit"
            disabled={loading}
            text={editSectionName ? "Edit Section Name" : "Create Section"}
            outline={true}
             customClasses={`flex items-center gap-3 text-yellow-50 px-4 py-2 border border-yellow-50 rounded-md`}
          >
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </Iconbtn>


          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>


      {course.courseContent.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}


      {/* Next Prev Button */}
      <div className="flex  items-center justify-end gap-x-3">
        <button
          onClick={goBack}
          className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
        >
          Back
        </button>

        <Iconbtn disabled={loading} text="Next" onclick={goToNext}
        customClasses={`flex items-center gap-3 text-black px-4 py-2 bg-yellow-50 rounded-md`}>
          <MdNavigateNext />
        </Iconbtn>
      </div>
    </div>
  )
}