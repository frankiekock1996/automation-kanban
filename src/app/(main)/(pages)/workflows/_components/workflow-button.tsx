'use client'
import React from 'react'
import { Plus} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import CustomModal from '@/components/global/custom-modal'
import DateTimePickerForm from '@/components/forms/date-time-picker-form'
import Workflowform from '@/components/forms/workflow-form'
type Props = {}

const WorkflowButton = (props: Props) => {
  const { setOpen, setClose } = useModal()


  const handleClick = () => {
    setOpen(
      <CustomModal
        title="Create a Workflow Automation"
        subheading="Workflows are a powerfull that help you automate tasks."
      >
        <Workflowform />
       {/* < DateTimePickerForm/> */}
      </CustomModal>
    )
  }

  return (
    <Button 
      size={'icon'} 
      onClick={handleClick}>
      <Plus />
    </Button>
  )
}

export default WorkflowButton