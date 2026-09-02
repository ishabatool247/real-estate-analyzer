
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  CheckCircle2,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
  TrendingUp,
  Utensils,
  X,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"


/* =========================================================
   PROPERTY DETAILS PAGE
========================================================= */

function PropertyDetails() {

  const navigate = useNavigate()
  const { id } = useParams()

  const [property, setProperty] = useState(null)
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [propertyError, setPropertyError] = useState("")

  const [showContactForm, setShowContactForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")


  /* =========================================================
     LOAD SELECTED PROPERTY
  ========================================================= */

  useEffect(() => {

    if (!id) {
      setPropertyError("Property ID is missing.")
      setLoadingProperty(false)
      return
    }

    const loadProperty = async () => {

      try {

        setLoadingProperty(true)
        setPropertyError("")

        /*
         * We already have:
         *
         * GET /api/properties/
         *
         * So we use that API and find the selected
         * property by its ID.
         */

        const response = await fetch(
          "http://127.0.0.1:8000/api/properties/"
        )

        if (!response.ok) {
          throw new Error(
            "Unable to load property information."
          )
        }

        const data = await response.json()

        const allProperties =
          Array.isArray(data.properties)
            ? data.properties
            : []

        const selectedProperty =
          allProperties.find(
            (item) =>
              String(item.id) === String(id)
          )

        if (!selectedProperty) {
          throw new Error(
            "Selected property was not found."
          )
        }

        setProperty(selectedProperty)

      } catch (err) {

        console.error(
          "Property Details Error:",
          err
        )

        setPropertyError(
          err.message ||
          "Unable to load property."
        )

      } finally {

        setLoadingProperty(false)

      }

    }

    loadProperty()

  }, [id])


  /* =========================================================
     FORMAT PRICE
  ========================================================= */

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


  /* =========================================================
     FORMAT AREA
  ========================================================= */

  const formatArea = (area) => {

    const value = Number(area || 0)

    if (!value) {
      return "—"
    }

    return `${value.toLocaleString()} Sq Ft`
  }


  /* =========================================================
     IMAGE URL
  ========================================================= */

  const getImageUrl = (image) => {

    if (!image) {
      return null
    }

    /*
     * If Django already returns a complete URL,
     * use it directly.
     */

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image
    }

    /*
     * If Django returns:
     *
     * /media/properties/example.jpeg
     *
     * add Django server URL.
     */

    return `http://127.0.0.1:8000${
      image.startsWith("/")
        ? image
        : `/${image}`
    }`

  }


  /* =========================================================
     PROPERTY DATA
  ========================================================= */

  const propertyImage =
    getImageUrl(property?.image)

  const propertyName =
    property?.title ||
    "Property"

  const propertyLocation =
    property?.city ||
    "Location unavailable"

  const propertyType =
    property?.property_type ||
    "Property"

  const propertyStatus =
    property?.purpose === "Sale"
      ? "For Sale"
      : "For Rent"

  const propertyPrice =
    formatPrice(property?.price)

  const propertyArea =
    formatArea(property?.area)

  const propertyBedrooms =
    property?.bedrooms || "—"

  const propertyBathrooms =
    property?.bathrooms || "—"

  const propertyFloors =
    property?.floors || "—"

  const propertyParking =
    property?.parking_spaces || "—"

  const propertyDescription =
    property?.description ||
    "No property description is available."


  /* =========================================================
     MAP
  ========================================================= */

  const mapLocation =
    encodeURIComponent(
      propertyLocation
    )

  const mapUrl =
    `https://www.google.com/maps?q=${mapLocation}&output=embed`


  /* =========================================================
     FORM INPUT
  ========================================================= */

  const handleChange = (e) => {

    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

  }


  /* =========================================================
     CONTACT AGENT API
  ========================================================= */

  const handleContactSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)
    setSuccess("")
    setError("")

    try {

      if (!id) {
        throw new Error(
          "Property ID is missing."
        )
      }

      const apiUrl =
        `http://127.0.0.1:8000/api/property/${id}/contact/`

      const response = await fetch(
        apiUrl,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            ...formData,

            /*
             * Send selected property ID
             * with the inquiry.
             */

            property_id: id,
          }),
        }
      )


      /* =====================================================
         SAFE RESPONSE
      ===================================================== */

      const contentType =
        response.headers.get(
          "content-type"
        ) || ""

      let data = null

      if (
        contentType.includes(
          "application/json"
        )
      ) {

        data = await response.json()

      } else {

        const text =
          await response.text()

        console.error(
          "Django returned non-JSON:",
          text
        )

        throw new Error(
          `Server returned ${response.status}. Please check the Django API.`
        )

      }


      /* =====================================================
         API ERROR
      ===================================================== */

      if (!response.ok) {

        throw new Error(
          data?.message ||
          data?.error ||
          "Unable to submit inquiry."
        )

      }


      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccess(
        data?.message ||
        "Your inquiry has been submitted successfully."
      )

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      })

    } catch (err) {

      console.error(
        "Contact Agent Error:",
        err
      )

      setError(
        err.message ||
        "Something went wrong. Please try again."
      )

    } finally {

      setLoading(false)

    }

  }


  /* =========================================================
     OPEN CONTACT
  ========================================================= */

  const openContactForm = () => {

    setShowContactForm(true)
    setSuccess("")
    setError("")

  }


  /* =========================================================
     CLOSE CONTACT
  ========================================================= */

  const closeContactForm = () => {

    if (!loading) {
      setShowContactForm(false)
    }

  }


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loadingProperty) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading property...
          </p>

        </div>

      </div>

    )

  }


  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (propertyError || !property) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

            <Building2 size={26} />

          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Property Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {propertyError ||
              "Unable to find this property."}
          </p>

          <button
            onClick={() =>
              navigate("/properties")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >

            <ArrowLeft size={17} />

            Back to Properties

          </button>

        </div>

      </div>

    )

  }


  /* =========================================================
     FEATURES
  ========================================================= */

  const features = [

    {
      icon: <Building2 size={18} />,
      title: `${propertyType} Property`,
    },

    {
      icon: <Home size={18} />,
      title: "Residential Property",
    },

    {
      icon: <Utensils size={18} />,
      title: "Modern Kitchen",
    },

    {
      icon: <BedDouble size={18} />,
      title: `${propertyBedrooms} Bedrooms`,
    },

    {
      icon: <Car size={18} />,
      title: `${propertyParking} Parking Spaces`,
    },

    {
      icon: <ShieldCheck size={18} />,
      title: "Secure Location",
    },

    {
      icon: <Building2 size={18} />,
      title: `${propertyFloors} Floors`,
    },

    {
      icon: <CheckCircle2 size={18} />,
      title: "Excellent Location",
    },

  ]


  return (

    <div className="min-h-screen bg-slate-50 text-slate-800">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">

          <button
            onClick={() =>
              navigate("/properties")
            }
            className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-green-50 hover:text-green-700"
          >

            <ArrowLeft
              size={18}
              className="transition group-hover:-translate-x-1"
            />

            Back to Properties

          </button>


          <div className="hidden items-center gap-2 sm:flex">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">

              <Building2 size={18} />

            </div>

            <div>

              <p className="text-sm font-bold text-slate-900">
                EstatePro
              </p>

              <p className="text-[10px] font-medium text-slate-400">
                Real Estate Intelligence
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">

          <div className="relative h-[360px] md:h-[520px]">

            {propertyImage ? (

              <img
                src={propertyImage}
                alt={propertyName}
                className="h-full w-full object-cover transition duration-700 hover:scale-[1.01]"
              />

            ) : (

              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 via-white to-slate-100">

                <div className="text-center">

                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-green-600 shadow-lg">

                    <Home size={45} />

                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-400">
                    Property Image Not Available
                  </p>

                </div>

              </div>

            )}


            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />


            {/* TOP BADGES */}

            <div className="absolute left-5 right-5 top-5 flex items-start justify-between md:left-7 md:right-7 md:top-7">

              <span className="rounded-xl border border-white/20 bg-slate-950/50 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">

                {propertyType}

              </span>


              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/95 px-4 py-2 text-xs font-bold text-green-700 shadow-lg">

                <span className="h-2 w-2 rounded-full bg-green-500" />

                {propertyStatus}

              </span>

            </div>


            {/* HERO TEXT */}

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-9">

              <p className="text-sm font-semibold text-green-300">
                EstatePro Property
              </p>

              <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-tight text-white md:text-5xl">

                {propertyName}

              </h1>


              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-white/85 md:text-base">

                <MapPin
                  size={18}
                  className="shrink-0 text-green-400"
                />

                {propertyLocation}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            QUICK DETAILS
        ===================================================== */}

        <section className="relative z-10 -mt-8 px-3 md:px-8">

          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-4">

            <DetailItem
              icon={<BedDouble size={21} />}
              label="Bedrooms"
              value={propertyBedrooms}
            />

            <DetailItem
              icon={<Bath size={21} />}
              label="Bathrooms"
              value={propertyBathrooms}
            />

            <DetailItem
              icon={<Ruler size={21} />}
              label="Property Area"
              value={propertyArea}
            />

            <DetailItem
              icon={<Home size={21} />}
              label="Floors"
              value={propertyFloors}
            />

          </div>

        </section>


        {/* =====================================================
            CONTENT GRID
        ===================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-3">


          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="space-y-6 xl:col-span-2">


            {/* OVERVIEW */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5 md:px-7">

                <h2 className="text-lg font-bold text-slate-900">
                  Property Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete information about this property
                </p>

              </div>


              <div className="p-5 md:p-7">

                <p className="text-sm leading-7 text-slate-600 md:text-base">

                  {propertyDescription}

                </p>

              </div>

            </section>


            {/* FEATURES */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5 md:px-7">

                <h2 className="text-lg font-bold text-slate-900">
                  Property Features
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Property specifications and highlights
                </p>

              </div>


              <div className="grid gap-3 p-5 sm:grid-cols-2 md:p-7">

                {features.map((feature) => (

                  <div
                    key={feature.title}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition duration-200 hover:border-green-100 hover:bg-green-50"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm transition duration-200 group-hover:bg-green-600 group-hover:text-white">

                      {feature.icon}

                    </div>

                    <span className="text-sm font-semibold text-slate-700">

                      {feature.title}

                    </span>

                  </div>

                ))}

              </div>

            </section>


            {/* LOCATION */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5 md:px-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                    <MapPin size={19} />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Location
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {propertyLocation}
                    </p>

                  </div>

                </div>

              </div>


              <div className="relative h-[320px] bg-slate-100 md:h-[420px]">

                <iframe
                  title={`${propertyName} location`}
                  src={mapUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>


              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 md:px-7">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {propertyLocation}
                </p>

              </div>

            </section>

          </div>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6">


            {/* PRICE CARD */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Property Price
              </p>


              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">

                {propertyPrice}

              </p>


              <p className="mt-1 text-sm text-slate-500">
                {propertyStatus}
              </p>


              {/* MARKET TREND */}

              <div className="mt-6 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">

                    <TrendingUp size={19} />

                  </div>


                  <div>

                    <p className="text-sm font-bold text-slate-900">
                      Property Intelligence
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-green-600">
                      Ready for analysis
                    </p>

                  </div>

                </div>

              </div>


              {/* ANALYZE */}

              <button
                onClick={() =>
                  navigate(
                    `/analysis/${id}`
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-green-700"
              >

                Analyze Property

                <ArrowUpRight size={17} />

              </button>


              {/* AGENT */}

              <div className="mt-5 border-t border-slate-100 pt-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 font-bold text-green-700">
                    EP
                  </div>


                  <div>

                    <p className="text-sm font-bold text-slate-900">
                      EstatePro
                    </p>

                    <p className="text-xs text-slate-500">
                      Property Consultant
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={openContactForm}
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                >

                  Contact Agent

                </button>

              </div>

            </section>


            {/* PROPERTY SUMMARY */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-bold text-slate-900">
                Property Summary
              </h3>

              <div className="mt-5 space-y-4">

                <SummaryRow
                  label="Property Type"
                  value={propertyType}
                />

                <SummaryRow
                  label="Purpose"
                  value={propertyStatus}
                />

                <SummaryRow
                  label="Bedrooms"
                  value={propertyBedrooms}
                />

                <SummaryRow
                  label="Bathrooms"
                  value={propertyBathrooms}
                />

                <SummaryRow
                  label="Area"
                  value={propertyArea}
                />

                <SummaryRow
                  label="Parking"
                  value={propertyParking}
                />

              </div>

            </section>


            {/* INVESTMENT ANALYSIS */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 p-6 text-white shadow-xl shadow-green-900/10">

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

              <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full border border-white/10" />


              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">

                  <TrendingUp size={21} />

                </div>


                <h3 className="mt-5 text-lg font-bold">
                  Investment Analysis
                </h3>


                <p className="mt-2 text-sm leading-6 text-green-50/90">

                  Analyze the selected property using its
                  actual price, location, area and specifications.

                </p>


                <button
                  onClick={() =>
                    navigate(
                      `/analysis/${id}`
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50"
                >

                  View Analysis

                  <ArrowUpRight size={16} />

                </button>

              </div>

            </section>

          </aside>

        </div>

      </main>


      {/* =====================================================
          CONTACT AGENT MODAL
      ===================================================== */}

      {showContactForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              closeContactForm()
            }

          }}
        >

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                  Property Inquiry
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Contact Agent
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {propertyName}
                </p>

              </div>


              <button
                type="button"
                onClick={closeContactForm}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >

                <X size={19} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleContactSubmit
              }
              className="space-y-4 p-6"
            >


              {/* NAME */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />

              </div>


              {/* PHONE */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />

              </div>


              {/* MESSAGE */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder={`I am interested in "${propertyName}"...`}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />

              </div>


              {/* SUCCESS */}

              {success && (

                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">

                  {success}

                </div>

              )}


              {/* ERROR */}

              {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">

                  {error}

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Sending..."
                  : "Send Inquiry"}

              </button>


              <p className="text-center text-xs leading-5 text-slate-400">

                Your inquiry will be securely submitted
                for this property.

              </p>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}


/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon,
  label,
  value,
}) {

  return (

    <div className="flex items-center gap-3 border-b border-slate-100 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">

        {icon}

      </div>


      <div>

        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-base font-bold text-slate-900">
          {value}
        </p>

      </div>

    </div>

  )
}


/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}) {

  return (

    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">

      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-800">
        {value}
      </span>

    </div>

  )
}


export default PropertyDetails

