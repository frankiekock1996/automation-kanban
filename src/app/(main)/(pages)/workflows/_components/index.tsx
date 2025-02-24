import React from 'react'
import Workflow
 from './workflow'
type Props = {}

const Workflows = (props: Props) => {
  return (
    <div className="relative flex flex-col gap-4">
      <section className="flex flex-col m-2">
        <Workflow description="creating a testflow" id='e2345678' name='test' publish />
      </section>
    </div>
     
  )
}

export default Workflows