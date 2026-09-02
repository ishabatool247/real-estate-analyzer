
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  Globe,
  Lock,
  Save,
  User,
  ShieldCheck,
  Settings as SettingsIcon,
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


/* =========================================================
   SETTINGS PAGE
========================================================= */

function Settings() {

  const navigate = useNavigate()

  /* =======================================================
     DEFAULT SETTINGS
  ======================================================= */

  const defaultSettings = {
    name: "EstatePro",
    platformName: "EstatePro",
    currency: "PKR",
    location: "Pakistan",
    marketUpdates: true,
    propertyAlerts: true,
    investmentInsights: true,
  }


  /* =======================================================
     STATE
  ======================================================= */

  const [settings, setSettings] = useState(defaultSettings)

  const [saved, setSaved] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const [passwordMessage, setPasswordMessage] = useState("")

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  })


  /* =======================================================
     LOAD SETTINGS
  ======================================================= */

  useEffect(() => {

    const savedSettings =
      localStorage.getItem("estatepro_settings")

    if (savedSettings) {

      try {

        const parsed =
          JSON.parse(savedSettings)

        setSettings({
          ...defaultSettings,
          ...parsed,
        })

      } catch (error) {

        console.error(
          "Unable to load settings:",
          error
        )

      }
    }

  }, [])


  /* =======================================================
     UPDATE SETTING
  ======================================================= */

  const updateSetting = (
    key,
    value
  ) => {

    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }))

    setSaved(false)
  }


  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

  const handleSave = () => {

    localStorage.setItem(
      "estatepro_settings",
      JSON.stringify(settings)
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }


  /* =======================================================
     RESET SETTINGS
  ======================================================= */

  const handleReset = () => {

    const confirmReset =
      window.confirm(
        "Are you sure you want to reset all settings to default?"
      )

    if (!confirmReset) {
      return
    }

    setSettings(defaultSettings)

    localStorage.setItem(
      "estatepro_settings",
      JSON.stringify(defaultSettings)
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }


  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  const handlePasswordChange = () => {

    setPasswordMessage("")

    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirm
    ) {

      setPasswordMessage(
        "Please fill in all password fields."
      )

      return
    }


    if (passwords.newPassword.length < 6) {

      setPasswordMessage(
        "New password must contain at least 6 characters."
      )

      return
    }


    if (
      passwords.newPassword !==
      passwords.confirm
    ) {

      setPasswordMessage(
        "New password and confirmation do not match."
      )

      return
    }


    /*
      Frontend demo password handling.

      This stores the password locally only.
      For a production application, password
      changes should be handled by Django authentication.
    */

    localStorage.setItem(
      "estatepro_password",
      passwords.newPassword
    )

    setPasswords({
      current: "",
      newPassword: "",
      confirm: "",
    })

    setPasswordMessage(
      "Password changed successfully."
    )
  }


  /* =======================================================
     CURRENCY SYMBOL
  ======================================================= */

  const getCurrencySymbol = () => {

    if (settings.currency === "USD") {
      return "$"
    }

    if (settings.currency === "AED") {
      return "د.إ"
    }

    return "₨"
  }


  return (

    <div className="min-h-screen bg-slate-50 text-slate-800">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


            {/* LEFT */}

            <div>

              <button
                onClick={() => navigate("/")}
                className="group mb-3 inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-500 transition hover:bg-green-50 hover:text-green-700"
              >

                <ArrowLeft
                  size={17}
                  className="transition group-hover:-translate-x-1"
                />

                Back to Dashboard

              </button>


              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-900/10">

                  <SettingsIcon size={20} />

                </div>


                <div>

                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">

                    Settings

                  </h1>

                  <p className="mt-1 text-sm text-slate-500">

                    Manage your EstatePro platform settings and preferences.

                  </p>

                </div>

              </div>

            </div>


            {/* STATUS */}

            {saved && (

              <div className="inline-flex items-center gap-2 self-start rounded-xl bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 sm:self-auto">

                <CheckCircle2 size={17} />

                Settings Saved

              </div>

            )}

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-7 md:px-8 md:py-8">

        <div className="space-y-6">


          {/* =================================================
              ADMINISTRATOR PROFILE
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              icon={<User size={21} />}
              title="Administrator Profile"
              description="Manage your administrator account information."
            />


            <div className="p-5 md:p-7">

              <div className="grid gap-5 md:grid-cols-2">


                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Name

                  </label>


                  <input
                    type="text"
                    value={settings.name}
                    onChange={(event) =>
                      updateSetting(
                        "name",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:ring-4 focus:ring-green-50"
                  />

                </div>


                {/* ROLE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Role

                  </label>


                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 outline-none"
                  />

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              PLATFORM SETTINGS
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              icon={<Building2 size={21} />}
              title="Platform Settings"
              description="Configure your EstatePro platform preferences."
            />


            <div className="p-5 md:p-7">

              <div className="grid gap-5 md:grid-cols-2">


                {/* PLATFORM NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Platform Name

                  </label>


                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(event) =>
                      updateSetting(
                        "platformName",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-50"
                  />

                </div>


                {/* CURRENCY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Currency

                  </label>


                  <select
                    value={settings.currency}
                    onChange={(event) =>
                      updateSetting(
                        "currency",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-50"
                  >

                    <option value="PKR">
                      ₨ Pakistani Rupee (PKR)
                    </option>

                    <option value="USD">
                      $ US Dollar (USD)
                    </option>

                    <option value="AED">
                      د.إ UAE Dirham (AED)
                    </option>

                  </select>

                </div>


                {/* LOCATION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Location

                  </label>


                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-green-400 focus-within:ring-4 focus-within:ring-green-50">

                    <Globe
                      size={17}
                      className="shrink-0 text-green-600"
                    />


                    <input
                      type="text"
                      value={settings.location}
                      onChange={(event) =>
                        updateSetting(
                          "location",
                          event.target.value
                        )
                      }
                      className="w-full text-sm font-medium text-slate-700 outline-none"
                    />

                  </div>

                </div>


                {/* CURRENCY PREVIEW */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Currency Preview

                  </label>


                  <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">

                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-bold text-green-600 shadow-sm">

                      {getCurrencySymbol()}

                    </span>


                    <div>

                      <p className="text-xs font-semibold text-slate-400">

                        Selected Currency

                      </p>

                      <p className="text-sm font-bold text-slate-800">

                        {settings.currency}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              icon={<Bell size={21} />}
              title="Notifications"
              description="Control your EstatePro notifications."
            />


            <div className="space-y-3 p-5 md:p-7">

              <SettingToggle
                title="Market Updates"
                description="Receive updates about property market trends."
                checked={settings.marketUpdates}
                onChange={(value) =>
                  updateSetting(
                    "marketUpdates",
                    value
                  )
                }
              />


              <SettingToggle
                title="Property Alerts"
                description="Get notified when new properties are added."
                checked={settings.propertyAlerts}
                onChange={(value) =>
                  updateSetting(
                    "propertyAlerts",
                    value
                  )
                }
              />


              <SettingToggle
                title="Investment Insights"
                description="Receive investment opportunities and analysis."
                checked={settings.investmentInsights}
                onChange={(value) =>
                  updateSetting(
                    "investmentInsights",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              icon={<Lock size={21} />}
              title="Security"
              description="Manage account security preferences."
            />


            <div className="p-5 md:p-7">

              <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50/50 p-5">


                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">

                      <ShieldCheck size={21} />

                    </div>


                    <div>

                      <p className="font-bold text-slate-900">

                        Account Security

                      </p>

                      <p className="mt-1 text-sm text-slate-500">

                        Keep your administrator account secure.

                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                  >

                    {showPassword
                      ? "Hide Password Form"
                      : "Change Password"}

                  </button>

                </div>


                {/* PASSWORD FORM */}

                {showPassword && (

                  <div className="mt-6 border-t border-green-100 pt-6">

                    <div className="grid gap-5 md:grid-cols-3">


                      <PasswordInput
                        label="Current Password"
                        value={passwords.current}
                        onChange={(value) =>
                          setPasswords(
                            (previous) => ({
                              ...previous,
                              current: value,
                            })
                          )
                        }
                      />


                      <PasswordInput
                        label="New Password"
                        value={passwords.newPassword}
                        onChange={(value) =>
                          setPasswords(
                            (previous) => ({
                              ...previous,
                              newPassword: value,
                            })
                          )
                        }
                      />


                      <PasswordInput
                        label="Confirm Password"
                        value={passwords.confirm}
                        onChange={(value) =>
                          setPasswords(
                            (previous) => ({
                              ...previous,
                              confirm: value,
                            })
                          )
                        }
                      />

                    </div>


                    {passwordMessage && (

                      <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                        passwordMessage.includes(
                          "successfully"
                        )
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}>

                        {passwordMessage}

                      </div>

                    )}


                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-700"
                    >

                      <Lock size={17} />

                      Update Password

                    </button>

                  </div>

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              SAVE SETTINGS
          ================================================= */}

          <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50/40 p-5 md:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


              <div>

                <p className="font-bold text-slate-900">

                  Save your changes

                </p>

                <p className="mt-1 text-sm text-slate-500">

                  Your settings will be saved and restored automatically.

                </p>

              </div>


              <div className="flex flex-col-reverse gap-3 sm:flex-row">


                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >

                  <RotateCcw size={16} />

                  Reset

                </button>


                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >

                  Cancel

                </button>


                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-green-700"
                >

                  <Save size={18} />

                  Save Settings

                </button>

              </div>

            </div>

          </section>


        </div>

      </main>

    </div>
  )
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}) {

  return (

    <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 md:px-7">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">

        {icon}

      </div>


      <div>

        <h2 className="font-bold text-slate-900">

          {title}

        </h2>


        <p className="mt-1 text-sm text-slate-500">

          {description}

        </p>

      </div>

    </div>
  )
}


/* =========================================================
   SETTING TOGGLE
========================================================= */

function SettingToggle({
  title,
  description,
  checked = false,
  onChange,
}) {

  return (

    <label className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition duration-200 hover:border-green-100 hover:bg-green-50/50">


      <div className="pr-4">

        <p className="text-sm font-bold text-slate-800">

          {title}

        </p>


        <p className="mt-1 text-xs leading-5 text-slate-500">

          {description}

        </p>

      </div>


      <div className="relative shrink-0">

        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="peer sr-only"
        />


        <div className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-green-600" />


        <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition peer-checked:translate-x-5">

          <Check
            size={11}
            strokeWidth={3}
            className="text-green-600 opacity-0 transition peer-checked:opacity-100"
          />

        </div>

      </div>

    </label>
  )
}


/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  onChange,
}) {

  const [visible, setVisible] =
    useState(false)

  return (

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

      </label>


      <div className="relative">

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm font-medium text-slate-700 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-50"
        />


        <button
          type="button"
          onClick={() =>
            setVisible(!visible)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-green-600"
        >

          {visible
            ? <EyeOff size={17} />
            : <Eye size={17} />
          }

        </button>

      </div>

    </div>
  )
}


export default Settings


