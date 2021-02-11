import React from 'react'

export default function Record({record}) {
  return (
    <div>
      Record<br />
      <p>Start: {record.start}</p>
      <p>End: {record.end}</p>
    </div>
  )
}
