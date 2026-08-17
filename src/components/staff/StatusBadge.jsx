import { ORDER_STATUS_LABEL } from '../../lib/staffConstants'

const TONE = {
  placed: 'bg-[#eef2ff] text-[#3949ab]',
  confirmed: 'bg-[#e8f4fd] text-[#1e6fa8]',
  preparing: 'bg-[#fff4e0] text-[#a8720f]',
  out_for_delivery: 'bg-[#e9f7ee] text-[#1f8a4c]',
  ready_for_pickup: 'bg-[#e9f7ee] text-[#1f8a4c]',
  completed: 'bg-[#e6f6ea] text-[#227a3f]',
  failed: 'bg-[#fdecea] text-[#c0392b]',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-display font-semibold whitespace-nowrap ${
        TONE[status] ?? 'bg-black/5 text-text-body'
      }`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  )
}
