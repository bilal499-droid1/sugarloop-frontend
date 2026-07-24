import { useState } from 'react'
import { FaPlus, FaMinus } from 'react-icons/fa'

export default function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-light">
      <button
        type="button"
        className="w-full flex items-center justify-between bg-none border-none cursor-pointer py-[0.9rem] font-display font-medium text-[0.95rem] text-black [&>svg]:text-[0.7rem] [&>svg]:text-[#9a9a9a] [&>svg]:shrink-0"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        {open ? <FaMinus /> : <FaPlus />}
      </button>
      {open && (
        <div className="pb-4 text-[0.9rem] leading-[1.7] text-text-body">{children}</div>
      )}
    </div>
  )
}
