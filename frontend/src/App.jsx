
import {
  ArrowUpRight,
  Bell,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useEffect, useMemo, useState } from "react"

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"

import Properties from "./pages/Properties"
import AddProperty from "./pages/AddProperty"
import PropertyAnalysis from "./pages/PropertyAnalysis"
import MarketInsights from "./pages/MarketInsights"
import PropertyDetails from "./pages/PropertyDetails"
import SettingsPage from "./pages/Settings"
import UsersPage from "./pages/Users"

const API_BASE = "https://real-estate-analyzer-1-aoph.onrender.com"

/* =========================================================
   APP ROUTER
========================================================= */

function App() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />

      {/* Properties */}
      <Route path="/properties" element={<Properties />} />

      {/* Add Property */}
      <Route path="/add" element={<AddProperty />} />

      {/* Property Analysis
          /analysis = analysis landing/first property
          /analysis/:id = specific property analysis
      */}
      <Route
        path="/analysis"
        element={<AnalysisRedirect />}
      />

      <Route
        path="/analysis/:id"
        element={<PropertyAnalysis />}
      />

      {/* Market Insights */}
      <Route
        path="/market-insights"
        element={<MarketInsights />}
      />

      {/* Property Details */}
      <Route
        path="/properties/:id"
        element={<PropertyDetails />}
      />

      {/* System */}
      <Route
        path="/settings"
        element={<SettingsPage />}
      />

      <Route
        path="/users"
        element={<UsersPage />}
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

/* =========================================================
   ANALYSIS REDIRECT

   When user clicks "Property Analysis" from sidebar,
   first load the property list and then open the first
   property's analysis page.
========================================================= */

function AnalysisRedirect() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const loadFirstProperty = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `${API_BASE}/api/properties/`
        )

        if (!response.ok) {
          throw new Error(
            "Unable to load properties from Django."
          )
        }

        const data = await response.json()

        const list = Array.isArray(data.properties)
          ? data.properties
          : Array.isArray(data)
            ? data
            : []

        if (!mounted) return

        if (list.length === 0) {
          setError(
            "No properties available for analysis. Please add a property first."
          )
          setLoading(false)
          return
        }

        const firstProperty = list[0]

        const propertyId =
          firstProperty.id ??
          firstProperty.pk ??
          firstProperty.property_id

        if (!propertyId) {
          throw new Error(
            "Property ID was not returned by Django."
          )
        }

        navigate(`/analysis/${propertyId}`, {
          replace: true,
        })
      } catch (err) {
        console.error(
          "Analysis redirect error:",
          err
        )

        if (mounted) {
          setError(
            err.message ||
              "Unable to open property analysis."
          )
          setLoading(false)
        }
      }
    }

    loadFirstProperty()

    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {loading ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <ChartNoAxesCombined
                size={27}
                className="animate-pulse"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Opening Property Analysis
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Loading your property data...
            </p>

            <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <ChartNoAxesCombined size={27} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to Open Analysis
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [notificationsOpen, setNotificationsOpen] =
    useState(false)

  /* =======================================================
     LOAD PROPERTIES
  ======================================================= */

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `${API_BASE}/api/properties/`
        )

        if (!response.ok) {
          throw new Error(
            "Unable to load properties from Django."
          )
        }

        const data = await response.json()

        const list = Array.isArray(data.properties)
          ? data.properties
          : Array.isArray(data)
            ? data
            : []

        setProperties(list)
      } catch (err) {
        console.error(err)

        setError(
          err.message ||
            "Unable to load property data."
        )
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  /* =======================================================
     CLOSE MOBILE SIDEBAR
  ======================================================= */

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  /* =======================================================
     PRICE FORMAT
  ======================================================= */

  const formatPrice = (price) => {
    const value = Number(price || 0)

    if (!value) return "₨ 0"

    if (value >= 10000000) {
      return `₨ ${(value / 10000000).toFixed(2)} Cr`
    }

    if (value >= 1000000) {
      return `₨ ${(value / 1000000).toFixed(2)}M`
    }

    if (value >= 100000) {
      return `₨ ${(value / 100000).toFixed(2)}L`
    }

    return `₨ ${value.toLocaleString()}`
  }

  /* =======================================================
     STATS
  ======================================================= */

  const totalProperties = properties.length

  const averagePrice = useMemo(() => {
    if (!properties.length) return 0

    const total = properties.reduce(
      (sum, property) =>
        sum + Number(property.price || 0),
      0
    )

    return total / properties.length
  }, [properties])

  const activeListings = useMemo(() => {
    return properties.filter((property) => {
      const purpose = String(
        property.purpose || ""
      ).toLowerCase()

      const status = String(
        property.status || ""
      ).toLowerCase()

      return (
        purpose === "sale" ||
        purpose === "rent" ||
        status === "active"
      )
    }).length
  }, [properties])

  /* =======================================================
     PROPERTY TYPES
  ======================================================= */

  const propertyTypes = useMemo(() => {
    const counts = {
      Houses: 0,
      Apartments: 0,
      Commercial: 0,
      Plots: 0,
    }

    properties.forEach((property) => {
      const type = String(
        property.property_type || ""
      ).toLowerCase()

      if (type.includes("house")) {
        counts.Houses++
      } else if (
        type.includes("apartment") ||
        type.includes("flat")
      ) {
        counts.Apartments++
      } else if (
        type.includes("commercial") ||
        type.includes("plaza") ||
        type.includes("shop")
      ) {
        counts.Commercial++
      } else if (
        type.includes("plot") ||
        type.includes("land")
      ) {
        counts.Plots++
      }
    })

    const total = properties.length || 1

    return [
      {
        name: "Houses",
        count: counts.Houses,
        percent: Math.round(
          (counts.Houses / total) * 100
        ),
      },
      {
        name: "Apartments",
        count: counts.Apartments,
        percent: Math.round(
          (counts.Apartments / total) * 100
        ),
      },
      {
        name: "Commercial",
        count: counts.Commercial,
        percent: Math.round(
          (counts.Commercial / total) * 100
        ),
      },
      {
        name: "Plots",
        count: counts.Plots,
        percent: Math.round(
          (counts.Plots / total) * 100
        ),
      },
    ]
  }, [properties])

  /* =======================================================
     MARKET DATA
  ======================================================= */

  const marketData = useMemo(() => {
    const sorted = [...properties].sort(
      (a, b) =>
        new Date(a.created_at || 0) -
        new Date(b.created_at || 0)
    )

    if (!sorted.length) return []

    const groups = {}

    sorted.forEach((property) => {
      const date = property.created_at
        ? new Date(property.created_at)
        : new Date()

      const key = `${date.getFullYear()}-${date.getMonth()}`

      const month = date.toLocaleString("en-US", {
        month: "short",
      })

      if (!groups[key]) {
        groups[key] = {
          month,
          prices: [],
        }
      }

      groups[key].prices.push(
        Number(property.price || 0) / 1000000
      )
    })

    return Object.values(groups)
      .slice(-6)
      .map((group) => ({
        month: group.month,
        price: Number(
          (
            group.prices.reduce(
              (a, b) => a + b,
              0
            ) / group.prices.length
          ).toFixed(2)
        ),
      }))
  }, [properties])

  /* =======================================================
     MARKET GROWTH
  ======================================================= */

  const marketGrowth = useMemo(() => {
    if (marketData.length < 2) return 0

    const first = Number(
      marketData[0].price || 0
    )

    const last = Number(
      marketData[marketData.length - 1].price || 0
    )

    if (!first) return 0

    return Number(
      (((last - first) / first) * 100).toFixed(1)
    )
  }, [marketData])

  /* =======================================================
     RECENT PROPERTIES
  ======================================================= */

  const recentProperties = useMemo(() => {
    return [...properties]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      )
      .slice(0, 5)
  }, [properties])

  /* =======================================================
     TOP MARKET
  ======================================================= */

  const topMarket = useMemo(() => {
    if (!properties.length) return "—"

    const cities = {}

    properties.forEach((property) => {
      const city = property.city || "Unknown"
      cities[city] = (cities[city] || 0) + 1
    })

    return Object.entries(cities).sort(
      (a, b) => b[1] - a[1]
    )[0][0]
  }, [properties])

  /* =======================================================
     SEARCH
  ======================================================= */

  const searchResults = useMemo(() => {
    if (!search.trim()) return []

    const query = search.toLowerCase().trim()

    return properties
      .filter((property) => {
        const title = String(
          property.title || ""
        ).toLowerCase()

        const city = String(
          property.city || ""
        ).toLowerCase()

        const type = String(
          property.property_type || ""
        ).toLowerCase()

        return (
          title.includes(query) ||
          city.includes(query) ||
          type.includes(query)
        )
      })
      .slice(0, 6)
  }, [properties, search])

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goToProperties = () => {
    navigate("/properties")
  }

  const goToAddProperty = () => {
    navigate("/add")
  }

  const goToAnalysis = () => {
    navigate("/analysis")
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72
          flex-col bg-slate-950 text-white
          transition-transform duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >

        {/* BRAND */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 shadow-lg shadow-green-950/30">
              <Building2 size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                EstatePro
              </h1>

              <p className="text-xs text-slate-400">
                Real Estate Intelligence
              </p>
            </div>

          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 p-5">

          <NavItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active
            onClick={() => navigate("/")}
          />

          <NavItem
            icon={<Home size={19} />}
            label="Properties"
            onClick={goToProperties}
          />

          <NavItem
            icon={<Plus size={19} />}
            label="Add Property"
            onClick={goToAddProperty}
          />

          <p className="px-3 pb-2 pt-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Analysis
          </p>

          <NavItem
            icon={<ChartNoAxesCombined size={19} />}
            label="Property Analysis"
            onClick={goToAnalysis}
          />

          <NavItem
            icon={<TrendingUp size={19} />}
            label="Market Insights"
            onClick={() =>
              navigate("/market-insights")
            }
          />

          <p className="px-3 pb-2 pt-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            System
          </p>

          <NavItem
            icon={<Users size={19} />}
            label="Users"
            onClick={() => navigate("/users")}
          />

          <NavItem
            icon={<Settings size={19} />}
            label="Settings"
            onClick={() => navigate("/settings")}
          />

        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="border-t border-white/10 p-5">

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <p className="text-xs font-medium text-slate-300">
                EstatePro Platform
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Professional property intelligence
              and market analysis.
            </p>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="lg:ml-72">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                Dashboard
              </h2>

              <p className="hidden text-sm text-slate-500 sm:block">
                Real estate market overview
              </p>
            </div>

          </div>

          {/* HEADER ACTIONS */}
          <div className="relative flex items-center gap-3">

            {/* SEARCH */}
            <button
              onClick={() =>
                setSearchOpen(!searchOpen)
              }
              className={`
                hidden rounded-xl border p-2.5
                transition md:block
                ${
                  searchOpen
                    ? "border-green-300 bg-green-50 text-green-600"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-green-600"
                }
              `}
            >
              <Search size={19} />
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={() =>
                setNotificationsOpen(
                  !notificationsOpen
                )
              }
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-green-600"
            >
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-500" />
            </button>

            {/* PROFILE */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 font-bold text-green-700">
                EP
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  EstatePro
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-slate-400 sm:block"
              />

            </div>

            {/* SEARCH PANEL */}
            {searchOpen && (
              <div className="absolute right-20 top-14 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">

                  <Search
                    size={17}
                    className="text-slate-400"
                  />

                  <input
                    autoFocus
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search properties..."
                    className="w-full bg-transparent text-sm outline-none"
                  />

                </div>

                {search.trim() && (
                  <div className="mt-2 max-h-72 overflow-y-auto">

                    {searchResults.length > 0 ? (
                      searchResults.map(
                        (property) => (
                          <button
                            key={property.id}
                            onClick={() => {
                              setSearchOpen(false)
                              setSearch("")

                              navigate(
                                `/properties/${property.id}`
                              )
                            }}
                            className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-green-50"
                          >

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {property.title ||
                                "Untitled Property"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {property.city ||
                                "Unknown"}{" "}
                              •{" "}
                              {property.property_type ||
                                "Property"}
                            </p>

                          </button>
                        )
                      )
                    ) : (
                      <p className="px-3 py-5 text-center text-xs font-semibold text-slate-400">
                        No properties found
                      </p>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* NOTIFICATION PANEL */}
            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">

                <div className="flex items-center justify-between">

                  <h3 className="font-bold text-slate-900">
                    Notifications
                  </h3>

                  <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                    {totalProperties} listings
                  </span>

                </div>

                <div className="mt-4 rounded-xl bg-green-50 p-4">

                  <div className="flex gap-3">

                    <div className="rounded-lg bg-green-100 p-2 text-green-600">
                      <Building2 size={17} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Portfolio updated
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        EstatePro is tracking{" "}
                        {totalProperties}{" "}
                        properties.
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  onClick={() => {
                    setNotificationsOpen(false)
                    navigate("/properties")
                  }}
                  className="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  View Properties
                </button>

              </div>
            )}

          </div>

        </header>

        {/* CONTENT */}
        <section className="p-4 md:p-8">

          {/* HERO */}
          <div className="group relative min-h-[350px] overflow-hidden rounded-[30px] bg-slate-950 shadow-xl md:min-h-[390px]">

            <img
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop"
              alt="Premium modern house"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/10" />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            <div className="relative z-10 flex min-h-[350px] items-center p-6 md:min-h-[390px] md:p-10 lg:p-12">

              <div className="max-w-2xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-green-200 shadow-lg backdrop-blur-md">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

                  <TrendingUp size={14} />

                  Live property intelligence

                </div>

                <h3 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[54px] lg:leading-[1.04]">

                  Welcome to{" "}

                  <span className="text-green-400">
                    EstatePro
                  </span>

                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                  Analyze properties, monitor market
                  trends, and make smarter real estate
                  investment decisions with your live
                  property portfolio.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">

                  <button
                    onClick={goToAddProperty}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-950/40 transition hover:-translate-y-0.5 hover:bg-green-500"
                  >
                    <Plus size={17} />
                    Add Property
                  </button>

                  <button
                    onClick={goToProperties}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    View Properties
                    <ArrowUpRight size={17} />
                  </button>

                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5">

                  <div>
                    <p className="text-xl font-bold text-white">
                      {loading
                        ? "..."
                        : totalProperties}
                    </p>

                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Properties
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <p className="text-xl font-bold text-white">
                      {loading
                        ? "..."
                        : formatPrice(
                            averagePrice
                          )}
                    </p>

                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Avg. Price
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <p className="text-xl font-bold text-green-400">
                      {loading
                        ? "..."
                        : `${
                            marketGrowth >= 0
                              ? "+"
                              : ""
                          }${marketGrowth}%`}
                    </p>

                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Market Trend
                    </p>
                  </div>

                </div>

              </div>

            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-green-600 via-green-400 to-transparent" />

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* STAT CARDS */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<Building2 size={21} />}
              title="Total Properties"
              value={
                loading
                  ? "..."
                  : totalProperties
              }
              change="Live"
              description="from database"
            />

            <StatCard
              icon={<TrendingUp size={21} />}
              title="Average Price"
              value={
                loading
                  ? "..."
                  : formatPrice(averagePrice)
              }
              change="Live"
              description="portfolio average"
            />

            <StatCard
              icon={
                <ChartNoAxesCombined size={21} />
              }
              title="Market Growth"
              value={
                loading
                  ? "..."
                  : `${
                      marketGrowth >= 0
                        ? "+"
                        : ""
                    }${marketGrowth}%`
              }
              change="Trend"
              description="based on listings"
            />

            <StatCard
              icon={<Home size={21} />}
              title="Active Listings"
              value={
                loading
                  ? "..."
                  : activeListings
              }
              change="Live"
              description="current listings"
            />

          </div>

          {/* CHART + TYPES */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">

            {/* MARKET CHART */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <h3 className="font-bold text-slate-900">
                    Market Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Average property price trend
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">

                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  Live property data

                </span>

              </div>

              <div className="mt-6 h-72 w-full">

                {loading ? (
                  <LoadingChart />
                ) : marketData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart data={marketData}>

                      <defs>
                        <linearGradient
                          id="marketGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#16a34a"
                            stopOpacity={0.25}
                          />

                          <stop
                            offset="100%"
                            stopColor="#16a34a"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                        }}
                        tickFormatter={(value) =>
                          `${value}M`
                        }
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border:
                            "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 30px rgba(15,23,42,0.08)",
                        }}
                        formatter={(value) => [
                          `₨ ${value}M`,
                          "Average Price",
                        ]}
                      />

                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#16a34a"
                        fill="url(#marketGradient)"
                        strokeWidth={3}
                      />

                    </AreaChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">

                    <div className="text-center">

                      <ChartNoAxesCombined
                        size={40}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-400">
                        Not enough market data
                      </p>

                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* PROPERTY TYPES */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <h3 className="font-bold text-slate-900">
                Property Types
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Portfolio distribution
              </p>

              <div className="mt-7 space-y-6">

                {propertyTypes.map((item) => (
                  <Progress
                    key={item.name}
                    name={item.name}
                    percent={item.percent}
                    count={item.count}
                  />
                ))}

              </div>

              <button
                onClick={goToProperties}
                className="mt-7 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
              >
                View all properties
              </button>

            </div>

          </div>

          {/* RECENT PROPERTIES */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">

              <div>
                <h3 className="font-bold text-slate-900">
                  Recent Properties
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest properties added to your portfolio
                </p>
              </div>

              <button
                onClick={goToProperties}
                className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 transition hover:text-green-700"
              >
                View all
                <ArrowUpRight size={16} />
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">

                  <tr>
                    <th className="px-6 py-4">
                      Property
                    </th>

                    <th className="px-6 py-4">
                      Location
                    </th>

                    <th className="px-6 py-4">
                      Type
                    </th>

                    <th className="px-6 py-4">
                      Price
                    </th>

                    <th className="px-6 py-4 text-right">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center"
                      >

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

                        <p className="mt-3 text-xs font-semibold text-slate-400">
                          Loading properties...
                        </p>

                      </td>
                    </tr>
                  ) : recentProperties.length > 0 ? (
                    recentProperties.map(
                      (property) => (
                        <PropertyRow
                          key={
                            property.id ??
                            property.pk ??
                            property.property_id
                          }
                          property={property}
                          onView={(id) =>
                            navigate(
                              `/properties/${id}`
                            )
                          }
                        />
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center"
                      >

                        <Home
                          size={35}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-500">
                          No properties found
                        </p>

                        <button
                          onClick={goToAddProperty}
                          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
                        >
                          Add your first property
                        </button>

                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* INSIGHTS */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-green-100 p-3 text-green-600">
                  <TrendingUp size={22} />
                </div>

                <div>

                  <h3 className="font-bold text-slate-900">
                    Portfolio Insight
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">

                    EstatePro is currently tracking{" "}
                    <strong>
                      {totalProperties}
                    </strong>{" "}

                    {totalProperties === 1
                      ? "property"
                      : "properties"}{" "}

                    with an average portfolio price of{" "}

                    <strong>
                      {formatPrice(averagePrice)}
                    </strong>.

                  </p>

                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <MapPin size={22} />
                </div>

                <div>

                  <h3 className="font-bold text-slate-900">
                    Top Market
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {topMarket}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-600">
                    Highest property concentration
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center gap-3
        rounded-xl px-4 py-3
        text-sm font-medium transition
        ${
          active
            ? "bg-green-600 text-white shadow-lg shadow-green-950/30"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  change,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-100 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div className="rounded-xl bg-green-50 p-3 text-green-600 transition group-hover:bg-green-100">
          {icon}
        </div>

        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
          {change}
        </span>

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <div className="mt-1 flex items-end justify-between gap-2">

        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>

        <span className="mb-1 text-xs text-slate-400">
          {description}
        </span>

      </div>

    </div>
  )
}

/* =========================================================
   LOADING CHART
========================================================= */

function LoadingChart() {
  return (
    <div className="flex h-full items-center justify-center">

      <div className="text-center">

        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

        <p className="mt-3 text-xs font-semibold text-slate-400">
          Loading market data...
        </p>

      </div>

    </div>
  )
}

/* =========================================================
   PROGRESS
========================================================= */

function Progress({
  name,
  percent,
  count,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="text-sm font-semibold text-slate-700">
            {name}
          </span>

          <span className="text-xs text-slate-400">
            {count}
          </span>

        </div>

        <span className="text-sm font-bold text-slate-700">
          {percent}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  )
}

/* =========================================================
   PROPERTY ROW
========================================================= */

function PropertyRow({
  property,
  onView,
}) {
  const name =
    property.title || "Untitled Property"

  const location =
    property.city || "Location unavailable"

  const type =
    property.property_type || "Property"

  const price =
    Number(property.price || 0)

  const propertyId =
    property.id ??
    property.pk ??
    property.property_id

  const imageUrl = property.image
    ? property.image.startsWith("http")
      ? property.image
      : `${API_BASE}/${property.image.replace(
          /^\/+/,
          ""
        )}`
    : null

  return (
    <tr className="transition hover:bg-slate-50">

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-green-600">

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Home size={18} />
            )}

          </div>

          <span className="max-w-[280px] truncate font-semibold text-slate-900">
            {name}
          </span>

        </div>

      </td>

      <td className="px-6 py-4">

        <div className="flex items-center gap-2 text-slate-500">

          <MapPin
            size={15}
            className="shrink-0"
          />

          {location}

        </div>

      </td>

      <td className="px-6 py-4 text-slate-500">
        {type}
      </td>

      <td className="px-6 py-4 font-bold text-slate-900">
        {price
          ? formatDashboardPrice(price)
          : "₨ —"}
      </td>

      <td className="px-6 py-4 text-right">

        <button
          onClick={() => {
            if (!propertyId) {
              console.error(
                "Property ID missing:",
                property
              )
              return
            }

            onView(propertyId)
          }}
          disabled={!propertyId}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          View Details
          <ArrowUpRight size={15} />
        </button>

      </td>

    </tr>
  )
}

/* =========================================================
   DASHBOARD PRICE FORMAT
========================================================= */

function formatDashboardPrice(price) {
  const value = Number(price || 0)

  if (value >= 10000000) {
    return `₨ ${(value / 10000000).toFixed(2)} Cr`
  }

  if (value >= 1000000) {
    return `₨ ${(value / 1000000).toFixed(2)}M`
  }

  if (value >= 100000) {
    return `₨ ${(value / 100000).toFixed(2)}L`
  }

  return `₨ ${value.toLocaleString()}`
}

export default App


