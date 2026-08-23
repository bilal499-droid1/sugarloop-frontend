import { useEffect, useState } from 'react'
import { FaUserPlus } from 'react-icons/fa'
import { useStaffAuth } from '../../context/StaffAuthContext'
import { fetchStaffUsers } from '../../lib/staffApi'
import { fetchBranches } from '../../lib/api'
import { STAFF_ROLES, STAFF_ROLE_LABEL } from '../../lib/staffConstants'
import StaffUserPanel from '../../components/staff/StaffUserPanel'
import StaffUserForm from '../../components/staff/StaffUserForm'
import ResetPasswordForm from '../../components/staff/ResetPasswordForm'

const EMPTY_FILTERS = { search: '', role: '', branchId: '', isActive: '' }

const selectClass =
  'h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent'

function TeamRow({ staffUser, isSelected, isSelf, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 border-b border-border-light last:border-b-0 cursor-pointer transition-colors ${
        isSelected ? 'bg-accent/5' : 'bg-transparent hover:bg-black/[0.02]'
      } ${staffUser.isActive ? '' : 'opacity-55'}`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${
          staffUser.isActive ? 'bg-[#2fa360]' : 'bg-[#c0392b]'
        }`}
      />
      <span className="flex-1 min-w-0">
        <span className="block font-display font-medium text-sm text-black truncate">
          {staffUser.name}
          {isSelf && <span className="ml-1.5 text-[0.65rem] text-accent font-semibold">You</span>}
        </span>
        <span className="block text-xs text-text-body truncate">{staffUser.email}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[0.7rem] font-display font-semibold text-text-body">
          {STAFF_ROLE_LABEL[staffUser.role] ?? staffUser.role}
        </span>
        <span className="block text-[0.7rem] text-text-body/80">
          {staffUser.role === 'admin' ? 'All' : (staffUser.branch?.code ?? '—')}
        </span>
      </span>
    </button>
  )
}

/**
 * The team screen: who can sign into this console, and everything an admin can do about
 * it — add, edit, reset a password, switch an account off and back on.
 *
 * Admin-only. `RequireAdmin` keeps a branch manager off the route and `StaffLayout` hides
 * the link, but the real guard is the server: every `/staff/users` route sits behind
 * `requireRole(ADMIN)`.
 *
 * Switched-off accounts stay in the list, dimmed, rather than being filtered away by
 * default. Reactivating is one click — but only if you can find the person, and a list
 * that hides them makes "switch off" look permanent when it is not.
 */
export default function StaffTeamPage() {
  const { staffUser: me } = useStaffAuth()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)

  const [branches, setBranches] = useState([])
  const [people, setPeople] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  /** 'detail' | 'create' | 'edit' | 'reset' — what the right-hand column is showing. */
  const [mode, setMode] = useState('detail')
  const [flash, setFlash] = useState(null)

  const selected = people.find((person) => person.id === selectedId) ?? null

  // The same public endpoint the storefront's branch picker uses — a dropdown of four
  // shops does not need an authenticated route of its own.
  useEffect(() => {
    let active = true
    fetchBranches()
      .then((data) => active && setBranches(data ?? []))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setListError(null)

    fetchStaffUsers(appliedFilters)
      .then(({ items, meta }) => {
        if (!active) return
        setPeople(items)
        setNextCursor(meta.nextCursor ?? null)
      })
      .catch((error) => {
        if (!active) return
        setListError(error?.message ?? 'Could not load the team.')
        setPeople([])
        setNextCursor(null)
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [appliedFilters])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const { items, meta } = await fetchStaffUsers({ ...appliedFilters, cursor: nextCursor })
      setPeople((current) => [...current, ...items])
      setNextCursor(meta.nextCursor ?? null)
    } catch (error) {
      setListError(error?.message ?? 'Could not load more.')
    } finally {
      setLoadingMore(false)
    }
  }

  /**
   * Patches the row in place instead of refetching the list.
   *
   * Refetching would re-sort, lose the scroll position and — with a status filter
   * applied — make the person the admin just edited vanish from under their cursor. The
   * list is a record of what they are working on, not a live query result.
   */
  const replaceInList = (saved) => {
    setPeople((current) => current.map((person) => (person.id === saved.id ? saved : person)))
  }

  const handleSaved = (saved, { created }) => {
    if (created) {
      setPeople((current) => [saved, ...current])
      setFlash(`${saved.name} can now sign in. Send them the password you copied.`)
    } else {
      replaceInList(saved)
      setFlash(`Saved ${saved.name}.`)
    }
    setSelectedId(saved.id)
    setMode('detail')
  }

  const selectPerson = (id) => {
    setSelectedId(id)
    setMode('detail')
    setFlash(null)
  }

  const setSelectFilter = (key) => (event) => {
    const next = { ...filters, [key]: event.target.value }
    setFilters(next)
    setAppliedFilters(next)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="m-0 font-display font-bold text-xl text-black">Team</h1>
        <button
          type="button"
          onClick={() => {
            setMode('create')
            setSelectedId(null)
            setFlash(null)
          }}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer"
        >
          <FaUserPlus className="text-xs" aria-hidden="true" />
          Add someone
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setAppliedFilters(filters)
        }}
        className="mb-5 flex flex-wrap items-end gap-3 bg-white border border-border-light rounded-xl p-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Name or email</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="bilal"
            className={`${selectClass} min-w-[12rem]`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Role</span>
          <select value={filters.role} onChange={setSelectFilter('role')} className={selectClass}>
            <option value="">All</option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {STAFF_ROLE_LABEL[role]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Branch</span>
          <select
            value={filters.branchId}
            onChange={setSelectFilter('branchId')}
            className={selectClass}
          >
            <option value="">All</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Status</span>
          <select
            value={filters.isActive}
            onChange={setSelectFilter('isActive')}
            className={selectClass}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Switched off</option>
          </select>
        </label>

        <button
          type="submit"
          className="h-9 px-4 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent"
        >
          Search
        </button>
      </form>

      {flash && (
        <p className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#eaf7ee] text-xs text-[#227a3f]">{flash}</p>
      )}
      {listError && (
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {listError}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-5 items-start">
        <div className="bg-white border border-border-light rounded-2xl overflow-hidden">
          {loading ? (
            <p className="m-0 px-4 py-6 text-sm text-text-body">Loading the team…</p>
          ) : people.length === 0 ? (
            <p className="m-0 px-4 py-6 text-sm text-text-body">Nobody matches these filters.</p>
          ) : (
            <>
              {people.map((person) => (
                <TeamRow
                  key={person.id}
                  staffUser={person}
                  isSelected={person.id === selectedId}
                  isSelf={person.id === me?.id}
                  onSelect={() => selectPerson(person.id)}
                />
              ))}
              {nextCursor && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full h-10 border-none border-t border-border-light bg-transparent font-display font-medium text-sm text-accent cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>

        <div>
          {mode === 'create' ? (
            <StaffUserForm
              mode="create"
              branches={branches}
              isSelf={false}
              onSaved={handleSaved}
              onCancel={() => setMode('detail')}
            />
          ) : !selected ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border-light text-sm text-text-body">
              Choose someone to see their account.
            </div>
          ) : mode === 'edit' ? (
            <StaffUserForm
              mode="edit"
              staffUser={selected}
              branches={branches}
              isSelf={selected.id === me?.id}
              onSaved={handleSaved}
              onCancel={() => setMode('detail')}
            />
          ) : mode === 'reset' ? (
            <ResetPasswordForm
              staffUser={selected}
              onDone={() => setMode('detail')}
              onCancel={() => setMode('detail')}
            />
          ) : (
            <StaffUserPanel
              staffUser={selected}
              isSelf={selected.id === me?.id}
              onEdit={() => setMode('edit')}
              onResetPassword={() => setMode('reset')}
              onChanged={replaceInList}
            />
          )}
        </div>
      </div>
    </div>
  )
}
