
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Home,
  Lightbulb,
  MapPin,
  Plus,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"


/* =========================================================
   PROPERTY ANALYSIS PAGE
========================================================= */

function PropertyAnalysis() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [property, setProperty] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  /* =======================================================
     LOAD PROPERTY ANALYSIS
  ======================================================= */

  useEffect(() => {
    if (!id || id === "${id}") {
      setError("Property ID is missing.")
      setLoading(false)
      return
    }

    const apiUrl =
      `https://real-estate-analyzer-1-aoph.onrender.com/api/properties/${id}/analysis/`

    console.log("PROPERTY ID:", id)
    console.log("PROPERTY ANALYSIS URL:", apiUrl)

    const loadAnalysis = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(apiUrl)

        console.log("API STATUS:", response.status)

        if (!response.ok) {
          throw new Error(
            `Failed to load property analysis. Server returned ${response.status}.`
          )
        }

        const data = await response.json()

        console.log("ANALYSIS DATA:", data)

        if (!data.success) {
          throw new Error(
            data.message || "Property analysis was not returned."
          )
        }

        setProperty(data.property)
        setAnalysis(data.analysis)
      } catch (err) {
        console.error("PROPERTY ANALYSIS API ERROR:", err)

        setError(
          err.message || "Unable to load property analysis."
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [id])


  /* =======================================================
     FORMATTERS
  ======================================================= */

  const formatPrice = (price) => {
    const value = Number(price || 0)

    if (!value) {
      return "₨ 0"
    }

    if (value >= 10000000) {
      return `₨ ${(value / 10000000).toFixed(2)} Crore`
    }

    if (value >= 100000) {
      return `₨ ${(value / 100000).toFixed(2)} Lakh`
    }

    return `₨ ${value.toLocaleString()}`
  }


  const formatArea = (area) => {
    const value = Number(area || 0)

    if (!value) {
      return "—"
    }

    return `${value.toLocaleString()} Sq Ft`
  }


  const safeScore = (value) => {
    return Math.max(
      0,
      Math.min(100, Number(value) || 0)
    )
  }


  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

            </div>

            <p className="mt-5 text-sm font-bold text-slate-700">
              Loading property analysis...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Preparing investment insights
            </p>

          </div>

        </div>
      </div>
    )
  }


  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error || !property || !analysis) {
    return (
      <div className="min-h-screen bg-slate-50 px-4">

        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center">

          <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load property
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "Property information could not be found."}
            </p>

            <div className="mt-6 flex justify-center gap-3">

              <button
                onClick={() => navigate("/properties")}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                <ArrowLeft size={17} />
                Back to Properties
              </button>

              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Try Again
              </button>

            </div>

          </div>

        </div>
      </div>
    )
  }


  /* =======================================================
     PROPERTY DATA
  ======================================================= */

  const propertyName =
    property.title || "Property"

  const propertyLocation =
    property.city ||
    property.location ||
    "Location unavailable"

  const propertyType =
    property.property_type || "Property"

  const propertyPurpose =
    property.purpose || "Sale"

  const propertyPrice =
    formatPrice(property.price)

  const propertyArea =
    formatArea(property.area)


  /* =======================================================
     ANALYSIS DATA
  ======================================================= */

  const score =
    safeScore(analysis.investment_score)

  const priceScore =
    safeScore(analysis.price_score)

  const rentalScore =
    safeScore(analysis.rental_score)

  const profileScore =
    safeScore(analysis.profile_score)

  const rentalYield =
    Number(analysis.rental_yield || 0)

  const annualROI =
    Number(analysis.annual_roi || 0)

  const monthlyRent =
    Number(analysis.estimated_monthly_rent || 0)

  const annualRent =
    Number(analysis.estimated_annual_rent || 0)

  const breakEvenYears =
    Number(analysis.break_even_years || 0)

  const pricePerArea =
    Number(analysis.price_per_area || 0)

  const recommendation =
    analysis.recommendation ||
    "Review carefully before making an investment decision."

  const priceAssessment =
    analysis.price_assessment ||
    "Not Available"

  const rentalAssessment =
    analysis.rental_assessment ||
    "Not Available"


  /* =======================================================
     RECOMMENDATION
  ======================================================= */

  const recommendationLabel =
    score >= 85
      ? "Strong Investment"
      : score >= 75
        ? "Good Investment"
        : score >= 65
          ? "Moderate Investment"
          : "Review Carefully"


  const marketPosition =
    score >= 85
      ? "Excellent"
      : score >= 75
        ? "Above Average"
        : score >= 65
          ? "Average"
          : "Needs Review"


  /* =======================================================
     RISK
  ======================================================= */

  const riskExposure =
    Math.max(0, Math.min(100, 100 - score))

  const riskLevel =
    riskExposure <= 25
      ? "Low"
      : riskExposure <= 45
        ? "Moderate"
        : "High"


  const priceRisk =
    priceScore >= 75
      ? "Low"
      : priceScore >= 60
        ? "Moderate"
        : "High"


  const rentalRisk =
    rentalScore >= 75
      ? "Low"
      : rentalScore >= 60
        ? "Moderate"
        : "High"


  /* =======================================================
     LOCATION SCORE
  ======================================================= */

  const locationScore =
    Math.round(
      (priceScore + rentalScore) / 2
    )


  /* =======================================================
     VALUE CHART
  ======================================================= */
/* =======================================================
   VALUE CHART
======================================================= */

const currentPropertyPrice =
  Number(property.price || 0)

const marketData = [
  {
    period: "Current",
    value: currentPropertyPrice / 1000000,
  },
]

  /* =======================================================
     IMAGE FALLBACK
  ======================================================= */

  const handleImageError = (event) => {
    event.currentTarget.style.display = "none"
  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-4 md:px-8">

          <div className="flex min-h-[78px] items-center justify-between gap-4">

            <div className="flex min-w-0 items-center gap-4">

              <button
                onClick={() => navigate("/properties")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                title="Back to Properties"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/20">
                  <BarChart3 size={19} />
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-bold text-slate-900">
                    EstatePro
                  </p>

                  <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                    Property Intelligence
                  </p>

                </div>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <div className="hidden text-right md:block">

                <p className="text-xs font-bold text-slate-700">
                  Property Analysis
                </p>

                <p className="text-[11px] text-slate-400">
                  Investment Intelligence
                </p>

              </div>

              <button
                onClick={() => navigate("/add-property")}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-600/15 transition hover:-translate-y-0.5 hover:bg-green-700"
              >
                <Plus size={17} />

                <span className="hidden sm:inline">
                  Add Property
                </span>
              </button>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">


        {/* ===================================================
            INTRO
        =================================================== */}

        <section className="mb-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-green-600">
                Investment Intelligence
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Property Analysis
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Analyze property value, rental performance,
                market position and investment potential.
              </p>

            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3.5 py-2">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-bold text-green-700">
                Live Property Data
              </span>

            </div>

          </div>

        </section>


        {/* ===================================================
            PROPERTY HERO
        =================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">


            {/* IMAGE */}

            <div className="relative h-[310px] overflow-hidden bg-slate-100 lg:h-[390px]">

              {property.image ? (

                <img
                  src={property.image}
                  alt={propertyName}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  onError={handleImageError}
                />

              ) : (

                <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 via-white to-slate-100">

                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-green-600 shadow-lg">
                    <Home size={42} />
                  </div>

                </div>

              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

              <div className="absolute left-5 top-5">

                <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-green-700 shadow-lg backdrop-blur">

                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  {propertyPurpose.toLowerCase() === "rent"
                    ? "For Rent"
                    : "For Sale"}

                </span>

              </div>


              <div className="absolute bottom-5 left-5 right-5">

                <div className="flex items-end justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Selected Property
                    </p>

                    <p className="mt-1 truncate text-lg font-bold text-white">
                      {propertyName}
                    </p>

                  </div>

                  <span className="shrink-0 rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    {propertyType}
                  </span>

                </div>

              </div>

            </div>


            {/* DETAILS */}

            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">

              <div className="flex items-center gap-2 text-green-600">

                <MapPin size={16} />

                <span className="text-sm font-semibold">
                  {propertyLocation}
                </span>

              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                {propertyName}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Detailed financial and investment analysis
                for the selected property.
              </p>


              <div className="mt-7 grid gap-3 sm:grid-cols-3">

                <InfoBox
                  icon={<CircleDollarSign size={17} />}
                  title="Property Price"
                  value={propertyPrice}
                />

                <InfoBox
                  icon={<Building2 size={17} />}
                  title="Property Type"
                  value={propertyType}
                />

                <InfoBox
                  icon={<Home size={17} />}
                  title="Area"
                  value={propertyArea}
                />

              </div>


              <div className="mt-5 grid grid-cols-2 gap-3">

                <MiniPropertyStat
                  icon={<BedDouble size={16} />}
                  label="Bedrooms"
                  value={property.bedrooms || 0}
                />

                <MiniPropertyStat
                  icon={<Bath size={16} />}
                  label="Bathrooms"
                  value={property.bathrooms || 0}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            KEY METRICS
        =================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <AnalysisCard
            icon={<Target size={20} />}
            title="Investment Score"
            value={`${score}/100`}
            badge={recommendationLabel}
            description="Overall investment quality"
          />

          <AnalysisCard
            icon={<CircleDollarSign size={20} />}
            title="Price Assessment"
            value={priceAssessment}
            badge={`${priceScore}/100`}
            description={
              pricePerArea
                ? `₨ ${pricePerArea.toLocaleString()} per sq ft`
                : "Price analysis"
            }
          />

          <AnalysisCard
            icon={<TrendingUp size={20} />}
            title="Rental Yield"
            value={`${rentalYield.toFixed(2)}%`}
            badge={rentalAssessment}
            description={`${formatPrice(monthlyRent)} estimated monthly`}
          />

          <AnalysisCard
            icon={<ShieldCheck size={20} />}
            title="Risk Level"
            value={riskLevel}
            badge={`${Math.round(riskExposure)}%`}
            description="Calculated risk exposure"
          />

        </div>


        {/* ===================================================
            VALUE + SCORE
        =================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-3">


          {/* VALUE CHART */}

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <TrendingUp size={20} />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Property Value
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Current recorded value
                    </p>

                  </div>

                </div>

              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">

                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                Current Value

              </span>

            </div>


            <div className="mt-7 h-72 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={marketData}
                  margin={{
                    top: 20,
                    right: 15,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="propertyGradient"
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
                        stopOpacity={0.02}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e2e8f0"
                  />


                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />


                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `${Number(value).toFixed(1)}M`
                    }
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />


                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      boxShadow:
                        "0 12px 30px rgba(15,23,42,0.10)",
                    }}
                    formatter={(value) => [
                      `₨ ${Number(value).toFixed(2)}M`,
                      "Property Value",
                    ]}
                  />


                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#16a34a"
                    fill="url(#propertyGradient)"
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: "#16a34a",
                      strokeWidth: 2,
                      stroke: "#ffffff",
                    }}
                    activeDot={{
                      r: 8,
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>


            <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3">

              <p className="text-xs leading-5 text-slate-500">

                This chart represents the property's
                <span className="font-bold text-slate-700">
                  {" "}current recorded value
                </span>
                . Historical market prices are not fabricated
                when historical data is unavailable.

              </p>

            </div>

          </section>


          {/* SCORE */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 p-6 text-white shadow-xl shadow-green-900/10">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 right-4 h-64 w-64 rounded-full border border-white/10" />


            <div className="relative z-10">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-green-100">
                    Investment Score
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {recommendationLabel}
                  </h2>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">

                  <Star
                    size={23}
                    className="fill-current"
                  />

                </div>

              </div>


              <div className="mt-8 flex justify-center">

                <div className="flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-white/20 bg-white/10">

                  <div className="text-center">

                    <p className="text-4xl font-bold">
                      {score}
                    </p>

                    <p className="text-xs font-semibold text-green-100">
                      out of 100
                    </p>

                  </div>

                </div>

              </div>


              <div className="mt-8">

                <div className="mb-2 flex justify-between text-xs text-green-100">

                  <span>
                    Investment Quality
                  </span>

                  <span>
                    {score}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/15">

                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{
                      width: `${score}%`,
                    }}
                  />

                </div>

              </div>


              <p className="mt-6 text-sm leading-6 text-green-50/90">
                {recommendation}
              </p>

            </div>

          </section>

        </div>


        {/* ===================================================
            FINANCIAL ANALYSIS
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5 md:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Wallet size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Investment Analysis
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Calculated financial indicators for this property
                </p>

              </div>

            </div>

          </div>


          <div className="grid sm:grid-cols-2 lg:grid-cols-5">

            <FinancialMetric
              title="Rental Yield"
              value={`${rentalYield.toFixed(2)}%`}
              description="Estimated annual rental return"
              positive={rentalYield >= 4}
            />

            <FinancialMetric
              title="Monthly Rent"
              value={formatPrice(monthlyRent)}
              description="Estimated monthly rental income"
              positive={monthlyRent > 0}
            />

            <FinancialMetric
              title="Annual Rent"
              value={formatPrice(annualRent)}
              description="Estimated annual rental income"
              positive={annualRent > 0}
            />

            <FinancialMetric
              title="Annual ROI"
              value={`${annualROI.toFixed(2)}%`}
              description="Estimated annual return on investment"
              positive={annualROI > 0}
            />

            <FinancialMetric
              title="Break-even"
              value={
                breakEvenYears > 0
                  ? `${breakEvenYears.toFixed(1)} yrs`
                  : "—"
              }
              description="Estimated rental payback period"
              positive={breakEvenYears > 0}
            />

          </div>

        </section>


        {/* ===================================================
            MARKET + PROFILE
        =================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">


          {/* MARKET */}

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                  Market Intelligence
                </p>

                <h2 className="mt-2 font-bold text-slate-900">
                  Market Position
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Property performance based on available analysis
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <BarChart3 size={20} />
              </div>

            </div>


            <div className="mt-8 flex items-end justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Property Performance
                </p>

                <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
                  {score}%
                </p>

              </div>

              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                {marketPosition}
              </span>

            </div>


            <div className="mt-6">

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-green-600 transition-all duration-700"
                  style={{
                    width: `${score}%`,
                  }}
                />

              </div>

              <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">

                <span>Low</span>
                <span>Average</span>
                <span>Excellent</span>

              </div>

            </div>


            <div className="mt-7 rounded-2xl bg-green-50 p-4">

              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-sm leading-6 text-slate-600">

                  The property received a calculated investment
                  score of{" "}
                  <strong>
                    {score}/100
                  </strong>
                  {" "}based on its price, rental performance
                  and property profile.

                </p>

              </div>

            </div>

          </section>


          {/* PROFILE */}

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                  Property Information
                </p>

                <h2 className="mt-2 font-bold text-slate-900">
                  Property Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Key characteristics of the selected property
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Home size={20} />
              </div>

            </div>


            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <ProfileMetric
                title="Bedrooms"
                value={property.bedrooms || 0}
                icon={<BedDouble size={17} />}
              />

              <ProfileMetric
                title="Bathrooms"
                value={property.bathrooms || 0}
                icon={<Bath size={17} />}
              />

              <ProfileMetric
                title="Property Area"
                value={propertyArea}
                icon={<Building2 size={17} />}
              />

              <ProfileMetric
                title="Profile Score"
                value={`${profileScore}/100`}
                icon={<Target size={17} />}
              />

            </div>

          </section>

        </div>


        {/* ===================================================
            LOCATION
        =================================================== */}

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                Location Intelligence
              </p>

              <h2 className="mt-2 font-bold text-slate-900">
                Location Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Analysis based on the selected property's available data
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <MapPin size={20} />
            </div>

          </div>


          <div className="mt-7">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <p className="text-xl font-bold text-slate-900">
                  {propertyLocation}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {propertyType} market
                </p>

              </div>

              <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">

                {locationScore >= 80
                  ? "Strong"
                  : locationScore >= 65
                    ? "Moderate"
                    : "Needs Review"}

              </span>

            </div>


            <div className="mt-7 grid gap-5 md:grid-cols-3">

              <LocationMetric
                title="Price Assessment"
                value={priceScore}
              />

              <LocationMetric
                title="Rental Performance"
                value={rentalScore}
              />

              <LocationMetric
                title="Overall Location Signal"
                value={locationScore}
              />

            </div>

          </div>

        </section>


        {/* ===================================================
            RISK
        =================================================== */}

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                Risk Management
              </p>

              <h2 className="mt-2 font-bold text-slate-900">
                Risk Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Risk exposure calculated from the investment indicators
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ShieldCheck size={20} />
            </div>

          </div>


          <div className="mt-7 grid gap-4 md:grid-cols-3">

            <RiskCard
              title="Investment Risk"
              value={riskLevel}
              percentage={riskExposure}
              description="Overall calculated investment risk exposure"
            />

            <RiskCard
              title="Price Risk"
              value={priceRisk}
              percentage={100 - priceScore}
              description={`Price assessment: ${priceAssessment}`}
            />

            <RiskCard
              title="Rental Risk"
              value={rentalRisk}
              percentage={100 - rentalScore}
              description={`Rental assessment: ${rentalAssessment}`}
            />

          </div>

        </section>


        {/* ===================================================
            SMART INSIGHTS
        =================================================== */}

        <section className="mt-6 rounded-[28px] border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 md:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <Lightbulb size={22} />
            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                AI-Powered Insights
              </p>

              <h2 className="mt-1 font-bold text-slate-900">
                Smart Investment Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Insights generated from this property's actual analysis
              </p>

            </div>

          </div>


          <div className="mt-7 grid gap-4 md:grid-cols-2">

            <Insight
              title="Investment Score"
              description={`This property received an investment score of ${score}/100.`}
              icon={<Target size={18} />}
            />

            <Insight
              title="Price Assessment"
              description={`The calculated price assessment is ${priceAssessment}, with a price score of ${priceScore}/100.`}
              icon={<CircleDollarSign size={18} />}
            />

            <Insight
              title="Rental Potential"
              description={`Estimated rental income is ${formatPrice(monthlyRent)} per month, with a ${rentalYield.toFixed(2)}% rental yield.`}
              icon={<Wallet size={18} />}
            />

            <Insight
              title="Investment Recommendation"
              description={recommendation}
              icon={<TrendingUp size={18} />}
            />

          </div>

        </section>


        {/* ===================================================
            FINAL RECOMMENDATION
        =================================================== */}

        <section className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 p-6 text-white shadow-xl shadow-green-900/10 md:p-8">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute -bottom-40 right-24 h-96 w-96 rounded-full border border-white/10" />


          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <Star
                  size={19}
                  className="fill-current"
                />

                <span className="text-xs font-bold uppercase tracking-wider text-green-100">
                  Final Investment Recommendation
                </span>

              </div>


              <h2 className="mt-3 text-3xl font-bold">
                {recommendationLabel}
              </h2>


              <p className="mt-4 max-w-3xl text-sm leading-7 text-green-50/90">

                {recommendation}

                {" "}This recommendation is generated from
                the property's actual price, rental performance
                and profile indicators.

              </p>


              <div className="mt-6 flex flex-wrap gap-2.5">

                <RecommendationBadge>
                  Score: {score}/100
                </RecommendationBadge>

                <RecommendationBadge>
                  {rentalYield.toFixed(2)}% Rental Yield
                </RecommendationBadge>

                <RecommendationBadge>
                  {riskLevel} Risk
                </RecommendationBadge>

                <RecommendationBadge>
                  {priceAssessment}
                </RecommendationBadge>

              </div>

            </div>


            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">

              <button
                onClick={() => navigate("/properties")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50"
              >
                <ArrowLeft size={16} />
                View Properties
              </button>

              <button
                onClick={() => navigate("/add-property")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Plus size={16} />
                Add Property
              </button>

            </div>

          </div>

        </section>


        {/* ===================================================
            DISCLAIMER
        =================================================== */}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">

          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-xs leading-5 text-slate-500">

            Analysis indicators are estimates generated from
            the available property data and the project's
            analysis methodology. Actual investment performance
            may vary depending on market conditions.

          </p>

        </div>

      </main>

    </div>
  )
}


/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-green-600">

        {icon}

        <span className="text-xs font-semibold text-slate-400">
          {title}
        </span>

      </div>

      <p className="mt-2 truncate font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}


/* =========================================================
   MINI PROPERTY STAT
========================================================= */

function MiniPropertyStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
        {icon}
      </div>

      <div>

        <p className="text-[11px] font-semibold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-bold text-slate-900">
          {value}
        </p>

      </div>

    </div>
  )
}


/* =========================================================
   ANALYSIS CARD
========================================================= */

function AnalysisCard({
  icon,
  title,
  value,
  badge,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg">

      <div className="flex items-start justify-between gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
          {icon}
        </div>

        <span className="max-w-[150px] rounded-full bg-green-50 px-2.5 py-1 text-center text-xs font-bold text-green-600">
          {badge}
        </span>

      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   FINANCIAL METRIC
========================================================= */

function FinancialMetric({
  title,
  value,
  description,
  positive,
}) {
  return (
    <div className="border-b border-slate-100 p-5 sm:border-r sm:p-6 lg:border-b-0 lg:last:border-r-0">

      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-3 flex items-center gap-2">

        <p className="truncate text-xl font-bold text-slate-900">
          {value}
        </p>

        {positive && (
          <ArrowUpRight
            size={16}
            className="shrink-0 text-green-600"
          />
        )}

      </div>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   LOCATION METRIC
========================================================= */

function LocationMetric({
  title,
  value,
}) {
  const numericValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  )

  return (
    <div>

      <div className="mb-2 flex items-center justify-between gap-3">

        <span className="text-sm font-semibold text-slate-600">
          {title}
        </span>

        <span className="text-sm font-bold text-slate-900">
          {numericValue}%
        </span>

      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-green-600 transition-all duration-700"
          style={{
            width: `${numericValue}%`,
          }}
        />

      </div>

    </div>
  )
}


/* =========================================================
   PROFILE METRIC
========================================================= */

function ProfileMetric({
  title,
  value,
  icon,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
          {icon}
        </div>

        <span className="text-sm font-semibold text-slate-500">
          {title}
        </span>

      </div>

      <span className="font-bold text-slate-900">
        {value}
      </span>

    </div>
  )
}


/* =========================================================
   RISK CARD
========================================================= */

function RiskCard({
  title,
  value,
  percentage,
  description,
}) {
  const numericPercentage = Math.max(
    0,
    Math.min(100, Number(percentage) || 0)
  )

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <ShieldCheck size={17} />
          </div>

          <p className="text-sm font-bold text-slate-800">
            {title}
          </p>

        </div>

        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
          {value}
        </span>

      </div>


      <div className="mt-5">

        <div className="flex items-center justify-between">

          <span className="text-xs text-slate-400">
            Risk exposure
          </span>

          <span className="text-xs font-bold text-slate-600">
            {Math.round(numericPercentage)}%
          </span>

        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{
              width: `${numericPercentage}%`,
            }}
          />

        </div>

      </div>


      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   INSIGHT
========================================================= */

function Insight({
  title,
  description,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
          {icon}
        </div>

        <div>

          <h3 className="font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   RECOMMENDATION BADGE
========================================================= */

function RecommendationBadge({
  children,
}) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
      {children}
    </span>
  )
}


export default PropertyAnalysis


