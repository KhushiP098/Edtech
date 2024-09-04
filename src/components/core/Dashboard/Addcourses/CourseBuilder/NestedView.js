import { useState } from "react"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDropdownMenu } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import { deleteSection,deleteSubSection,} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import  ConfirmationalModal from "../../../../common/ConfirmationalModal"
import SubSectionModal from "./SubSectionModal"
import toast from "react-hot-toast"

export default function NestedView({ handleChangeEditSectionName }) {
   
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // States to keep track of mode of modal [add, view, edit]

  const [addSubSection, setAddSubsection] = useState(null)
  const [viewSubSection, setViewSubSection] = useState(null)
  const [editSubSection, setEditSubSection] = useState(null)

  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)


  const handleDeleteSection = async (sectionId) => {
    const result = await deleteSection({
      sectionId,
      courseId: course._id,
      token,
    })

    if (result) {
      dispatch(setCourse(result))
      toast.success("Section deleted successfully!");
    }
    else{
      toast.error("Could'nt delete section");
    }
    setConfirmationModal(null);
  }

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId, token })
    if (result) {
      // update the structure of course
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setConfirmationModal(null)
  }

  return (
    <>
      <div
        className="rounded-lg bg-richblack-700 p-6 px-8"
        id="nestedViewContainer"
      >

        {/* sare section ko show ker rahe h */}
        {course?.courseContent?.map((section) => (
          // Section Dropdown open attribute is used because we want the drop down to remain open by default
          <details key={section._id} open>

            {/* Section Dropdown Content */}
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">

              <div className="flex items-center gap-x-3">

                <RxDropdownMenu className="text-2xl text-richblack-50" />
                <p className="font-semibold text-richblack-50">
                  {section.sectionName}
                </p>
              </div>

              <div className="flex items-center gap-x-3">

                {/* /edit section name button */}
                <button
                  onClick={() =>
                    handleChangeEditSectionName(
                      section._id,
                      section.sectionName
                    )
                  }
                >
                <MdEdit className="text-xl text-richblack-300" />
                </button>


                {/* delete section button */}{/* onclick pr delete modal aaega  */}
        
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleteSection(section._id), // this is delete section button
                      btn2Handler: () => setConfirmationModal(null),  // this is cancel button
                    })
                  }
                >
                <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>
                
                  {/* dropdown icon and slash */}
                <span className="font-medium text-richblack-300">|</span>
                <AiFillCaretDown className={`text-xl text-richblack-300`} />

              </div>
            </summary>

          
              {/* Render All Sub Sections Within a Section */}
            <div className="px-6 pb-4">
              {
               section.subSections.map((data) => (

                // onClicking every subsection it will be opened for large view
                <div
                  key={data?._id}
                  onClick={() => setViewSubSection(data)}
                  className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                >

                  <div className="flex items-center gap-x-3 py-2 ">
                         
                         {/* dropdown icon */}
                    <RxDropdownMenu className="text-2xl text-richblack-50" />

                         {/* subsection name */}
                    <p className="font-semibold text-richblack-50">
                      {data.name}
                    </p>

                  </div>

                  {/* e.stopPropagation se upar wale onclick isse click kerne pr call ni hoga */}
                  {/* behar wala div is div pe aaply nhi hoga */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-x-3"
                  >
                    
                    {/* edit sub section button */}
                    <button
                      onClick={() =>
                        setEditSubSection({ ...data, sectionId: section._id })
                      }
                    >
                    <MdEdit className="text-xl text-richblack-300" />
                    </button>

                    {/* delete button for subsection */}
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Delete this Sub-Section?",
                          text2: "This lecture will be deleted",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () =>
                            handleDeleteSubSection(data._id, section._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      <RiDeleteBin6Line className="text-xl text-richblack-300" />
                    </button>

                  </div>
                </div>
              ))}


              {/* Add New Lecture to every Section */}
              <button
                onClick={() => setAddSubsection(section._id)}
                className="mt-3 flex items-center gap-x-1 text-yellow-50"
              >
                <FaPlus className="text-lg" />
                <p>Add Lecture</p>
              </button>

            </div>


          </details>
        ))}
      </div>


      {/* Modal Display */}
      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubsection}
          add={true}
        />
      ) : viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection} 
          edit={true}
        />
      ) : (
        <></>
      )}

      {/* confirmational modal is always placed at the end of the code and it will be rendered only if its value is  not null */}
      {/* Confirmation Modal */}
      {confirmationModal ? (
        < ConfirmationalModal modalData={confirmationModal} />
      ) : (
        <></>
      )}
    </>
  )
}