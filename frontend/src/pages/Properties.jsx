
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bath,
  BedDouble,
  Building2,
  Heart,
  Home,
  MapPin,
  Maximize,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Trash2,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


/* =========================================================
   PROPERTIES PAGE
========================================================= */

function Properties() {
  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedType, setSelectedType] = useState("All Types")
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState([])


  /* =======================================================
     LOAD PROPERTIES
  ======================================================= */

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/properties/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load properties")
        }

        return response.json()
      })
      .then((data) => {
        setProperties(
          Array.isArray(data.properties)
            ? data.properties
            : []
        )
      })
      .catch((err) => {
        
        console.error(
          "Properties API Error:",
          err
        )

        setError(
          "Unable to load properties."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])


  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (price) => {
    const value = Number(price || 0)

    if (value >= 10000000) {
      return `₨ ${(value / 10000000).toFixed(2)} Crore`
    }

    if (value >= 100000) {
      return `₨ ${(value / 100000).toFixed(2)} Lakh`
    }

    return `₨ ${value.toLocaleString()}`
  }


  /* =======================================================
     FORMAT AREA
  ======================================================= */

  const formatArea = (area) => {
    const value = Number(area || 0)

    if (!value) {
      return "—"
    }

    return `${value.toLocaleString()} Sq Ft`
  }


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredProperties = properties.filter(
    (property) => {
      const searchValue =
        search.toLowerCase().trim()

      const title =
        property.title?.toLowerCase() || ""

      const city =
        property.city?.toLowerCase() || ""

      const type =
        property.property_type?.toLowerCase() || ""

      const matchesType =
        selectedType === "All Types" ||
        property.property_type === selectedType

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        city.includes(searchValue) ||
        type.includes(searchValue)

      return matchesType && matchesSearch
    }
  )


  /* =======================================================
     FAVORITES
  ======================================================= */

  const toggleFavorite = (id) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (item) => item !== id
        )
      }

      return [
        ...previous,
        id,
      ]
    })
  }


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("")
    setSelectedType("All Types")
  }


  /* =======================================================
     DELETE PROPERTY
  ======================================================= */
  /* =======================================================
     DELETE PROPERTY
  ======================================================= */

  const deleteProperty = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/properties/${id}/delete/`,
        {
          method: "POST",
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete property"
        )
      }

      setProperties((previous) =>
        previous.filter(
          (property) => property.id !== id
        )
      )
    } catch (err) {
      console.error(
        "Delete Property Error:",
        err
      )

      alert("Unable to delete property.")
    }
  }
  /* =======================================================
     STATS
  ======================================================= */

  const residentialCount =
    properties.filter(
      (property) =>
        [
          "House",
          "Apartment",
          "Farm House",
        ].includes(
          property.property_type
        )
    ).length

  const activeListings =
    properties.filter(
      (property) =>
        property.purpose === "Sale"
    ).length

  const portfolioValue =
    properties.reduce(
      (total, property) =>
        total +
        Number(property.price || 0),
      0
    )


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

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

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                  <Building2 size={23} />

                </div>


                <div>

                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Properties
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Explore and manage your real estate portfolio.
                  </p>

                </div>

              </div>

            </div>


            {/* ADD PROPERTY */}

            <button
              onClick={() =>
                navigate("/add-property")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition duration-300 hover:-translate-y-0.5 hover:bg-green-700"
            >

              <Plus size={18} />

              Add Property

            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-8">


        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<Building2 size={21} />}
            title="Total Properties"
            value={properties.length}
            text="Portfolio"
            change="+12.5%"
          />


          <StatCard
            icon={<Home size={21} />}
            title="Residential"
            value={residentialCount}
            text="Residential properties"
            change="+8.4%"
          />


          <StatCard
            icon={<TrendingUp size={21} />}
            title="Active Listings"
            value={activeListings}
            text="Currently listed"
            change="+6.7%"
          />


          <StatCard
            icon={<BarChart3 size={21} />}
            title="Portfolio Value"
            value={formatPrice(portfolioValue)}
            text="Total property value"
            change="+14.8%"
          />

        </div>


        {/* =====================================================
            SEARCH / FILTER
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


            {/* SEARCH */}

            <div className="relative w-full lg:max-w-lg">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search property, location or type..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-50"
              />

            </div>


            {/* FILTERS */}

            <div className="flex flex-wrap items-center gap-2">

              <div className="mr-1 hidden items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 sm:flex">

                <SlidersHorizontal size={14} />

                Filter

              </div>


              {[
                "All Types",
                "House",
                "Apartment",
                "Commercial",
                "Plot",
              ].map((type) => (

                <FilterButton
                  key={type}
                  label={type}
                  active={
                    selectedType === type
                  }
                  onClick={() =>
                    setSelectedType(type)
                  }
                />

              ))}

            </div>

          </div>

        </section>


        {/* =====================================================
            PORTFOLIO TITLE
        ===================================================== */}

        <div className="mt-8 flex items-end justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Property Portfolio
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Browse your latest real estate properties.
            </p>

          </div>


          <div className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">

            {filteredProperties.length} Properties

          </div>

        </div>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading properties...
            </p>

          </div>

        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (

          <div className="mt-5 rounded-3xl border border-red-100 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">

              <Building2 size={23} />

            </div>


            <h3 className="mt-4 font-bold text-slate-900">
              Unable to load properties
            </h3>


            <p className="mt-1 text-sm text-slate-500">
              Please make sure the Django server is running.
            </p>


            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
            >

              Try Again

            </button>

          </div>

        )}


        {/* =====================================================
            PROPERTY GRID
        ===================================================== */}

        {!loading &&
          !error &&
          filteredProperties.length > 0 && (

            <div className="mt-5 grid gap-6 lg:grid-cols-2">

              {filteredProperties.map(
                (property) => (

                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    name={property.title}
                    location={property.city}
                    type={property.property_type}
                    price={formatPrice(
                      property.price
                    )}
                    status={
                      property.purpose === "Sale"
                        ? "For Sale"
                        : "For Rent"
                    }
                    bedrooms={
                      property.bedrooms
                    }
                    bathrooms={
                      property.bathrooms
                    }
                    area={formatArea(
                      property.area
                    )}
                    image={property.image}
                    favorite={favorites.includes(
                      property.id
                    )}
                    onFavorite={() =>
                      toggleFavorite(
                        property.id
                      )
                    }
                    onDelete={() =>
                      deleteProperty(
                        property.id
                      )
                    }
                  />

                )
              )}

            </div>

          )}


        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          filteredProperties.length === 0 && (

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                <Search size={25} />

              </div>


              <h3 className="mt-5 font-bold text-slate-900">
                No properties found
              </h3>


              <p className="mt-1 text-sm text-slate-500">
                Try another search or property type.
              </p>


              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
              >

                Clear Filters

              </button>

            </div>

          )}


        {/* =====================================================
            PERFORMANCE
        ===================================================== */}

        <section className="relative mt-8 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-100/50" />

          <div className="absolute -bottom-28 right-32 h-72 w-72 rounded-full border border-green-100" />


          <div className="relative flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">

                <TrendingUp size={22} />

              </div>


              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="font-bold text-slate-900">
                    Portfolio Performance
                  </h3>


                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                    Positive
                  </span>

                </div>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">

                  Your property portfolio is showing positive
                  market performance. Analyze individual
                  properties to discover investment opportunities.

                </p>

              </div>

            </div>


            <button
              onClick={() =>
                navigate("/analysis")
              }
              className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-700"
            >

              Analyze Properties

              <ArrowUpRight size={16} />

            </button>

          </div>

        </section>

      </main>

    </div>
  )
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  text,
  change,
}) {
  return (

    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">

          {icon}

        </div>


        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">

          <ArrowUpRight size={12} />

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
        {text}
      </p>

    </div>
  )
}


/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  label,
  active,
  onClick,
}) {
  return (

    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-green-600 text-white shadow-md shadow-green-900/10"
          : "border border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
      }`}
    >

      {label}

    </button>
  )
}


/* =========================================================
   PROPERTY CARD
========================================================= */

function PropertyCard({
  id,
  name,
  location,
  type,
  price,
  status,
  bedrooms,
  bathrooms,
  area,
  image,
  favorite,
  onFavorite,
  onDelete,
}) {
  const navigate = useNavigate()

  return (

    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-xl">


      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="relative h-72 overflow-hidden bg-slate-100">

        {image ? (

          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none"
            }}
          />

        ) : (

          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 via-white to-slate-100">

            <div className="text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-green-600 shadow-sm">

                <Home size={38} />

              </div>


              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Property Image
              </p>

            </div>

          </div>

        )}


        {/* IMAGE OVERLAY */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />


        {/* TOP CONTROLS */}

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between">

          <span className="rounded-xl border border-white/20 bg-slate-950/45 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">

            {type}

          </span>


          <button
            type="button"
            onClick={onFavorite}
            aria-label="Add to favorites"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 shadow-lg backdrop-blur-md transition ${
              favorite
                ? "bg-white text-red-500"
                : "bg-slate-950/35 text-white hover:bg-white hover:text-red-500"
            }`}
          >

            <Heart
              size={18}
              fill={
                favorite
                  ? "currentColor"
                  : "none"
              }
            />

          </button>

        </div>


        {/* STATUS */}

        <span
          className={`absolute right-5 top-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3 py-1.5 text-xs font-bold shadow-lg ${
            status === "For Sale"
              ? "text-green-700"
              : "text-amber-700"
          }`}
        >

          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "For Sale"
                ? "bg-green-500"
                : "bg-amber-500"
            }`}
          />

          {status}

        </span>


        {/* IMAGE TEXT */}

        <div className="absolute bottom-5 left-5 right-5">

          <p className="text-xs font-medium text-white/70">
            EstatePro Property
          </p>


          <h3 className="mt-1 line-clamp-2 text-2xl font-bold tracking-tight text-white">
            {name}
          </h3>


          <div className="mt-2 flex items-center gap-2 text-sm text-white/85">

            <MapPin size={15} />

            <span>
              {location || "Location unavailable"}
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          DETAILS
      ===================================================== */}

      <div className="p-5 md:p-6">


        <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50">

          <Feature
            icon={<BedDouble size={16} />}
            label="Beds"
            value={
              bedrooms || "—"
            }
          />


          <Feature
            icon={<Bath size={16} />}
            label="Baths"
            value={
              bathrooms || "—"
            }
          />


          <Feature
            icon={<Maximize size={16} />}
            label="Area"
            value={area}
          />

        </div>


        {/* PRICE */}

        <div className="mt-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Property Value
            </p>


            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {price}
            </p>

          </div>


          {/* VIEW DETAILS */}

          <button
            type="button"
            onClick={() =>
              navigate(`/property/${id}`)
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
          >

            View Details

            <ArrowUpRight size={15} />

          </button>

        </div>


        {/* ANALYZE */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/property/${id}/analysis`
            )
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white shadow-md shadow-green-900/10 transition hover:bg-green-700"
        >

          <TrendingUp size={17} />

          Analyze Property

        </button>


        {/* DELETE */}

        <button
          type="button"
          onClick={onDelete}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-3 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50"
        >

          <Trash2 size={17} />

          Delete Property

        </button>

      </div>

    </article>

  )
}


/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  label,
  value,
}) {
  return (

    <div className="flex flex-col items-center justify-center px-2 py-3">

      <div className="flex items-center gap-1.5 text-green-600">

        {icon}

        <span className="text-[11px] font-semibold text-slate-400">
          {label}
        </span>

      </div>


      <span className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </span>

    </div>

  )
}


export default Properties

