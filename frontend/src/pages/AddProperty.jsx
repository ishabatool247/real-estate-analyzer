
import {
  ArrowLeft,
  Building2,
  Home,
  MapPin,
  Save,
  X,
  TrendingUp,
  Link2,
  BedDouble,
  Bath,
  Layers3,
  Car,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react"

import { useNavigate } from "react-router-dom"
import { useState } from "react"

function AddProperty() {
  const navigate = useNavigate()

  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "House",
    purpose: "Sale",
    price: "",
    bedrooms: "",
    bathrooms: "",
    floors: "",
    parking: "",
    area: "",
    areaUnit: "Sq Ft",
    listingUrl: "",
    image: "",
    furnishing: "Unfurnished",
    description: "",
  })

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError("")
    setMessage("")
  }

  // =========================================================
  // SCRAPE PROPERTY
  // =========================================================

  const handleScrape = async () => {
    if (!formData.listingUrl.trim()) {
      setError("Please enter a Property Listing URL.")
      return
    }

    setScraping(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch(
        "https://real-estate-analyzer-1-aoph.onrender.com/api/properties/scrape/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: formData.listingUrl.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to scrape property."
        )
      }

      const property = data.property

      setFormData((prev) => ({
        ...prev,

        name: property.title || "",
        location: property.city || "",
        type: property.property_type || "House",
        purpose: property.purpose || "Sale",

        price: property.price
          ? String(property.price)
          : "",

        area: property.area
          ? String(property.area)
          : "",

        areaUnit: "Sq Ft",

        bedrooms:
          property.bedrooms !== undefined
            ? String(property.bedrooms)
            : "",

        bathrooms:
          property.bathrooms !== undefined
            ? String(property.bathrooms)
            : "",

        image: property.image || "",

        description:
          property.description || "",
      }))

      setMessage(
        "Property scraped successfully. Please review the information below."
      )
    } catch (err) {
      console.error("Scrape Property Error:", err)

      setError(
        err.message ||
          "Something went wrong while scraping the property."
      )
    } finally {
      setScraping(false)
    }
  }

  // =========================================================
  // SAVE PROPERTY
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setMessage("")

    if (!formData.name.trim()) {
      setError("Property name is required.")
      return
    }

    if (!formData.location.trim()) {
      setError("Location is required.")
      return
    }

    if (!formData.price) {
      setError("Property price is required.")
      return
    }

    if (!formData.area) {
      setError("Property area is required.")
      return
    }

    setSaving(true)

    try {
      /*
        IMPORTANT:

        Scrape API already saves the property in Django.

        Therefore, if the property was scraped successfully,
        we simply return to Properties page.

        This prevents creating duplicate properties.
      */

      if (formData.listingUrl.trim()) {
        setMessage(
          "Property is already saved. Opening Properties..."
        )

        setTimeout(() => {
          navigate("/properties")
        }, 700)

        return
      }

      // Manual property creation
      const response = await fetch(
        "https://real-estate-analyzer-1-aoph.onrender.com/api/properties/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.name,

            property_type: formData.type,

            purpose: formData.purpose,

            city: formData.location,

            price: formData.price,

            area: formData.area,

            bedrooms: formData.bedrooms || 0,

            bathrooms: formData.bathrooms || 0,

            floors: formData.floors || 0,

            parking_spaces:
              formData.parking || 0,

            furnishing_status:
              formData.furnishing,

            address: formData.location,

            description:
              formData.description,

            source_url:
              formData.listingUrl || "",
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save property."
        )
      }

      setMessage(
        "Property saved successfully."
      )

      setTimeout(() => {
        navigate("/properties")
      }, 700)
    } catch (err) {
      console.error("Save Property Error:", err)

      setError(
        err.message ||
          "Something went wrong while saving the property."
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">

          <div className="flex items-center justify-between gap-4">

            <div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-green-600"
              >
                <ArrowLeft size={17} />

                Back to Dashboard
              </button>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Building2 size={21} />
                </div>

                <div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Add Property
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Add a new property to your EstatePro portfolio.
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600 sm:block"
            >
              <X size={20} />
            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              SCRAPER
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-sm">

            <div className="border-b border-green-100 px-5 py-5 md:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Search size={19} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Import Property from Listing
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Paste a real property listing URL and EstatePro will collect the available information automatically.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Property Listing URL
              </label>

              <div className="flex flex-col gap-3 md:flex-row">

                <div className="relative flex-1">

                  <Link2
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600"
                  />

                  <input
                    type="url"
                    name="listingUrl"
                    value={formData.listingUrl}
                    onChange={handleChange}
                    placeholder="https://www.zameen.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                  />

                </div>


                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scraping}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {scraping ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Scraping...
                    </>
                  ) : (
                    <>
                      <Search size={18} />

                      Scrape Property
                    </>
                  )}

                </button>

              </div>


              <p className="mt-2 text-xs text-slate-400">
                Paste the listing URL, then click “Scrape Property”. The available property information will be filled into the form below.
              </p>


              {/* SUCCESS */}

              {message && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {message}
                  </span>

                </div>
              )}


              {/* ERROR */}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

            </div>

          </section>


          {/* =================================================
              PROPERTY INFORMATION
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 md:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Home size={19} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Property Information
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Scraped property information.
                  </p>

                </div>

              </div>

            </div>


            <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">

              {/* NAME */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Modern Family House"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                />

              </div>


              {/* LOCATION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600"
                  />

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. DHA Lahore"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />

                </div>

              </div>


              {/* TYPE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                >

                  <option>House</option>
                  <option>Apartment</option>
                  <option>Commercial</option>
                  <option>Plot</option>
                  <option>Shop</option>
                  <option>Office</option>
                  <option>Farm House</option>

                </select>

              </div>


              {/* PURPOSE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Purpose
                </label>

                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                >

                  <option>Sale</option>
                  <option>Rent</option>

                </select>

              </div>


              {/* PRICE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Price
                </label>

                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 42500000"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                />

              </div>


              {/* AREA */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Area
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="2722.5"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />

                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  >

                    <option>Sq Ft</option>
                    <option>Marla</option>
                    <option>Kanal</option>
                    <option>Sq Yd</option>

                  </select>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              PROPERTY DETAILS
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 md:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Building2 size={19} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Property Details
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Property specifications.
                  </p>

                </div>

              </div>

            </div>


            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 md:p-6">

              {/* BEDROOMS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bedrooms
                </label>

                <div className="relative">

                  <BedDouble
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600"
                  />

                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    placeholder="5"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />

                </div>

              </div>


              {/* BATHROOMS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bathrooms
                </label>

                <div className="relative">

                  <Bath
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600"
                  />

                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    placeholder="4"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />

                </div>

              </div>


              {/* FLOORS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Floors
                </label>

                <div className="relative">

                  <Layers3
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600"
                  />

                  <input
                    type="number"
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                    min="0"
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />

                </div>

              </div>


              {/* PARKING */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Parking Spaces
                </label>

                <div className="relative">

                  <Car
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600"
                  />

                  <input
                    type="number"
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    min="0"
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />

                </div>

              </div>


              {/* FURNISHING */}

              <div className="sm:col-span-2 lg:col-span-4">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Furnishing Status
                </label>

                <div className="grid gap-3 sm:grid-cols-3">

                  {[
                    "Unfurnished",
                    "Semi Furnished",
                    "Fully Furnished",
                  ].map((option) => (

                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          furnishing: option,
                        }))
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        formData.furnishing === option
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-200 hover:bg-green-50/50"
                      }`}
                    >
                      {option}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              IMAGE
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 md:px-6">

              <h2 className="font-bold text-slate-900">
                Property Image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Image collected from the property listing.
              </p>

            </div>


            <div className="p-5 md:p-6">

              {formData.image ? (

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                  <img
                    src={formData.image}
                    alt={
                      formData.name ||
                      "Property"
                    }
                    className="h-72 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none"
                    }}
                  />

                </div>

              ) : (

                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">

                  Property image will appear here after scraping.

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5 md:px-6">

              <h2 className="font-bold text-slate-900">
                Property Description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Describe the property, features and location advantages.
              </p>

            </div>


            <div className="p-5 md:p-6">

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the property, architectural style, nearby facilities, location advantages, parking, rooms, kitchen, lawn and other important details..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                A detailed description helps generate better property analysis.
              </p>

            </div>

          </section>


          {/* =================================================
              ANALYSIS NOTICE
          ================================================= */}

          <section className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-5 md:p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <TrendingUp size={20} />
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  Ready for Property Intelligence
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Once this property is scraped and saved, EstatePro can use its information for market comparison, investment scoring, rental yield estimation and property analysis.
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving || scraping}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (

                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>

              ) : (

                <>
                  <Save size={18} />

                  Save Property
                </>

              )}

            </button>

          </div>

        </form>

      </main>

    </div>
  )
}

export default AddProperty


