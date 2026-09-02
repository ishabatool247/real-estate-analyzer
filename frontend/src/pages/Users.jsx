
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserPlus,
  Users as UsersIcon,
  ArrowUpRight,
  MoreHorizontal,
  UserRound,
  X,
  Save,
  Trash2,
  UserCheck,
  UserX,
  RotateCcw,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


/* =========================================================
   DEFAULT USERS
========================================================= */

const defaultUsers = [
  {
    id: 1,
    initials: "EA",
    name: "EstatePro Admin",
    email: "admin@estatepro.com",
    role: "Administrator",
    status: "Active",
    joined: "Jan 12, 2026",
  },
  {
    id: 2,
    initials: "AK",
    name: "Ahmed Khan",
    email: "ahmed@estatepro.com",
    role: "Property Manager",
    status: "Active",
    joined: "Feb 08, 2026",
  },
  {
    id: 3,
    initials: "UA",
    name: "Usman Ali",
    email: "usman@estatepro.com",
    role: "Analyst",
    status: "Active",
    joined: "Mar 21, 2026",
  },
  {
    id: 4,
    initials: "SA",
    name: "Sara Ahmed",
    email: "sara@estatepro.com",
    role: "Property Manager",
    status: "Pending",
    joined: "Apr 04, 2026",
  },
]


/* =========================================================
   USERS PAGE
========================================================= */

function Users() {

  const navigate = useNavigate()


  /* =======================================================
     STATE
  ======================================================= */

  const [users, setUsers] = useState(() => {

    const savedUsers =
      localStorage.getItem("estatepro_users")

    if (savedUsers) {

      try {
        return JSON.parse(savedUsers)
      } catch {
        return defaultUsers
      }

    }

    return defaultUsers
  })


  const [showUserForm, setShowUserForm] =
    useState(false)

  const [editingUser, setEditingUser] =
    useState(null)

  const [openMenu, setOpenMenu] =
    useState(null)

  const [message, setMessage] =
    useState("")


  const emptyForm = {
    name: "",
    email: "",
    role: "Property Manager",
    status: "Active",
  }


  const [form, setForm] =
    useState(emptyForm)


  /* =======================================================
     SAVE USERS AUTOMATICALLY
  ======================================================= */

  useEffect(() => {

    localStorage.setItem(
      "estatepro_users",
      JSON.stringify(users)
    )

  }, [users])


  /* =======================================================
     SHOW MESSAGE
  ======================================================= */

  const showMessage = (text) => {

    setMessage(text)

    setTimeout(() => {
      setMessage("")
    }, 2500)
  }


  /* =======================================================
     INITIALS
  ======================================================= */

  const getInitials = (name) => {

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }


  /* =======================================================
     OPEN ADD USER
  ======================================================= */

  const handleAddUser = () => {

    setEditingUser(null)

    setForm(emptyForm)

    setShowUserForm(true)

    setOpenMenu(null)
  }


  /* =======================================================
     OPEN MANAGE
  ======================================================= */

  const handleManage = (user) => {

    setEditingUser(user)

    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })

    setShowUserForm(true)

    setOpenMenu(null)
  }


  /* =======================================================
     FORM INPUT
  ======================================================= */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }


  /* =======================================================
     SAVE USER
  ======================================================= */

  const handleSaveUser = () => {

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {

      alert(
        "Please enter user name and email."
      )

      return
    }


    if (editingUser) {

      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: form.name.trim(),
                initials: getInitials(
                  form.name
                ),
                email:
                  form.email.trim(),
                role: form.role,
                status: form.status,
              }
            : user
        )
      )

      showMessage(
        "User updated successfully."
      )

    } else {

      const newUser = {

        id: Date.now(),

        initials:
          getInitials(form.name),

        name:
          form.name.trim(),

        email:
          form.email.trim(),

        role:
          form.role,

        status:
          form.status,

        joined:
          new Date().toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }
          ),
      }


      setUsers((previous) => [
        ...previous,
        newUser,
      ])

      showMessage(
        "User added successfully."
      )
    }


    setForm(emptyForm)

    setEditingUser(null)

    setShowUserForm(false)
  }


  /* =======================================================
     DELETE USER
  ======================================================= */

  const handleDelete = (user) => {

    setOpenMenu(null)

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${user.name}?`
      )

    if (!confirmed) {
      return
    }


    setUsers((previous) =>
      previous.filter(
        (item) => item.id !== user.id
      )
    )

    showMessage(
      "User deleted successfully."
    )
  }


  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const handleToggleStatus = (user) => {

    const newStatus =
      user.status === "Active"
        ? "Pending"
        : "Active"


    setUsers((previous) =>
      previous.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    )


    setOpenMenu(null)

    showMessage(
      `${user.name} is now ${newStatus}.`
    )
  }


  /* =======================================================
     RESET USERS
  ======================================================= */

  const handleReset = () => {

    const confirmed =
      window.confirm(
        "Reset all users to the default EstatePro users?"
      )

    if (!confirmed) {
      return
    }


    setUsers(defaultUsers)

    showMessage(
      "Users reset successfully."
    )
  }


  /* =======================================================
     STATS
  ======================================================= */

  const totalUsers =
    users.length

  const activeUsers =
    users.filter(
      (user) =>
        user.status === "Active"
    ).length

  const pendingUsers =
    users.filter(
      (user) =>
        user.status === "Pending"
    ).length

  const administrators =
    users.filter(
      (user) =>
        user.role === "Administrator"
    ).length


  return (

    <div className="min-h-screen bg-slate-50 text-slate-800">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


            {/* LEFT */}

            <div>

              <button
                onClick={() => navigate("/")}
                className="group mb-3 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-slate-500 transition hover:text-green-600"
              >

                <ArrowLeft
                  size={17}
                  className="transition group-hover:-translate-x-1"
                />

                Back to Dashboard

              </button>


              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">

                  <UsersIcon size={21} />

                </div>


                <div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Users
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Manage EstatePro users, roles and account access.
                  </p>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              >

                <RotateCcw size={16} />

                Reset

              </button>


              <button
                type="button"
                onClick={handleAddUser}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-green-700"
              >

                <UserPlus size={18} />

                Add User

              </button>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (

        <div className="fixed right-5 top-24 z-[80]">

          <div className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-xl">

            <CheckCircle2 size={18} />

            {message}

          </div>

        </div>

      )}


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-8">


        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <UserStat
            icon={<UsersIcon size={21} />}
            title="Total Users"
            value={totalUsers}
            description="Registered users"
            change="Live"
          />

          <UserStat
            icon={<CheckCircle2 size={21} />}
            title="Active Users"
            value={activeUsers}
            description="Currently active"
            change="Active"
          />

          <UserStat
            icon={<Clock3 size={21} />}
            title="Pending"
            value={pendingUsers}
            description="Awaiting approval"
            change={`${pendingUsers} accounts`}
          />

          <UserStat
            icon={<ShieldCheck size={21} />}
            title="Administrators"
            value={administrators}
            description="Admin accounts"
            change="Secure"
          />

        </div>


        {/* =====================================================
            USERS TABLE
        ===================================================== */}

        <section className="mt-6 overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">


          {/* SECTION HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                  <UserRound size={19} />

                </div>


                <div>

                  <h2 className="font-bold text-slate-900">
                    All Users
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    View and manage EstatePro accounts.
                  </p>

                </div>

              </div>

            </div>


            <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">

              {users.length} Users

            </div>

          </div>


          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[820px] text-left text-sm">

              <thead className="border-b border-slate-100 bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="group transition hover:bg-green-50/30"
                  >


                    {/* USER */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 font-bold text-green-700 transition group-hover:bg-green-600 group-hover:text-white">

                          {user.initials}

                        </div>


                        <div>

                          <p className="font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* ROLE */}

                    <td className="px-6 py-5">

                      <span className="inline-flex rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">

                        {user.role}

                      </span>

                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          user.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "Active"
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                        />

                        {user.status}

                      </span>

                    </td>


                    {/* JOINED */}

                    <td className="px-6 py-5">

                      <span className="text-sm font-medium text-slate-500">

                        {user.joined}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td className="relative px-6 py-5 text-right">

                      <div className="inline-flex items-center gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            handleManage(user)
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-50"
                        >

                          Manage

                          <ArrowUpRight size={13} />

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === user.id
                                ? null
                                : user.id
                            )
                          }
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >

                          <MoreHorizontal size={17} />

                        </button>

                      </div>


                      {/* MORE MENU */}

                      {openMenu === user.id && (

                        <div className="absolute right-6 top-14 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-xl">

                          <button
                            type="button"
                            onClick={() =>
                              handleManage(user)
                            }
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-green-50 hover:text-green-700"
                          >

                            <UserRound size={16} />

                            Edit User

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                user
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >

                            {user.status === "Active"
                              ? <UserX size={16} />
                              : <UserCheck size={16} />
                            }

                            {user.status === "Active"
                              ? "Set Pending"
                              : "Set Active"
                            }

                          </button>


                          <div className="my-1 border-t border-slate-100" />


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(user)
                            }
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >

                            <Trash2 size={16} />

                            Delete User

                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))}


                {/* EMPTY STATE */}

                {users.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-6 py-14 text-center"
                    >

                      <UsersIcon
                        size={40}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-bold text-slate-700">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add a new user to get started.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================================
            ACCESS MANAGEMENT
        ===================================================== */}

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-green-100/50" />

          <div className="relative flex items-start gap-4 p-6 md:p-7">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">

              <ShieldCheck size={23} />

            </div>


            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="font-bold text-slate-900">
                  User Access Management
                </h3>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                  Secure
                </span>

              </div>


              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">

                Administrators can manage user accounts, assign roles and
                control access to EstatePro property intelligence,
                market analysis and platform features.

              </p>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          ADD / EDIT USER MODAL
      ===================================================== */}

      {showUserForm && (

        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">

                  {editingUser
                    ? "Manage User"
                    : "Add New User"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {editingUser
                    ? "Update user account information."
                    : "Create a new EstatePro user account."}

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowUserForm(false)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <div className="space-y-5 p-6">


              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Full Name

                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-50"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Email Address

                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@estatepro.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-50"
                />

              </div>


              {/* ROLE + STATUS */}

              <div className="grid gap-5 sm:grid-cols-2">


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Role

                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-50"
                  >

                    <option value="Administrator">
                      Administrator
                    </option>

                    <option value="Property Manager">
                      Property Manager
                    </option>

                    <option value="Analyst">
                      Analyst
                    </option>

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Status

                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-50"
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                  </select>

                </div>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false)
                    setEditingUser(null)
                    setForm(emptyForm)
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >

                  Cancel

                </button>


                <button
                  type="button"
                  onClick={handleSaveUser}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-700"
                >

                  <Save size={17} />

                  {editingUser
                    ? "Save Changes"
                    : "Add User"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


/* =========================================================
   USER STAT
========================================================= */

function UserStat({
  icon,
  title,
  value,
  description,
  change,
}) {

  return (

    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 transition duration-300 group-hover:bg-green-600 group-hover:text-white">

          {icon}

        </div>


        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">

          {change}

        </span>

      </div>


      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>


      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>


      <p className="mt-1 text-xs font-medium text-slate-400">
        {description}
      </p>

    </div>
  )
}


export default Users

