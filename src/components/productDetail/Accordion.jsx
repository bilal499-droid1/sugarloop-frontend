import { useState } from 'react'
import { FaPlus, FaMinus } from 'react-icons/fa'
import './Accordion.css'

export default function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="accordion">
      <button type="button" className="accordion__trigger" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        {open ? <FaMinus /> : <FaPlus />}
      </button>
      {open && <div className="accordion__panel">{children}</div>}
    </div>
  )
}
