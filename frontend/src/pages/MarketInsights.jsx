import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  MapPin,
  TrendingUp,
  Activity,
  Target,
  Home,
  LineChart,
  Landmark,
  RefreshCw,
  Database,
  AlertCircle,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


function MarketInsights() {

  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  /* =========================================================
     FETCH MARKET INSIGHTS
  ========================================================= */

  const fetchMarketInsights = async () => {

    setLoading(true)
    setError("")

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/market-insights/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Django API Error: ${response.status}`
        )
      }

      const result = await response.json()

      console.log("MARKET API DATA:", result)

      if (!result.success) {
        throw new Error(
          "Market API returned unsuccessful response."
        )
      }

      setData(result)

    } catch (err) {

      console.error("Market Insights Error:", err)

      setError(
        err.message ||
        "Unable to load market insights."
      )

    } finally {

      setLoading(false)

    }
  }


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchMarketInsights()
  }, [])


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">

            <RefreshCw
              size={28}
              className="animate-spin"
            />

          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Loading Market Insights
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Analyzing your property database...
          </p>

        </div>

      </div>
    )
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">

            <AlertCircle size={28} />

          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Market Data Unavailable
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchMarketInsights}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    )
  }


  /* =========================================================
     SAFE DATA
  ========================================================= */

  const market = data?.market || {}

  const priceTrend = data?.price_trend || []

  const demandByArea = data?.demand_by_area || []

  const propertySegments = data?.property_segments || []

  const opportunities =
    data?.investment_opportunities || []


  /* =========================================================
     VALUES
  ========================================================= */

  const totalProperties =
    Number(market.total_properties) || 0

  const averagePrice =
    Number(market.average_price) || 0

  const averageArea =
    Number(market.average_area) || 0

  const averagePricePerArea =
    Number(market.average_price_per_area) || 0


  /* =========================================================
     FORMATTERS
  ========================================================= */

  const formatPKR = (value) => {

    const number = Number(value) || 0

    if (number >= 10000000) {
      return `₨ ${(number / 10000000).toFixed(2)} Cr`
    }

    if (number >= 1000000) {
      return `₨ ${(number / 1000000).toFixed(2)}M`
    }

    if (number >= 1000) {
      return `₨ ${(number / 1000).toFixed(0)}K`
    }

    return `₨ ${number.toLocaleString()}`
  }


  const formatNumber = (value) => {

    return Number(value || 0).toLocaleString()
  }


  /* =========================================================
     STATUS
  ========================================================= */

  const getMarketStatusClass = () => {

    const status =
      String(market.status || "")
        .toLowerCase()

    if (
      status === "positive" ||
      status === "growing"
    ) {
      return "bg-green-100 text-green-700"
    }

    if (status === "stable") {
      return "bg-amber-100 text-amber-700"
    }

    if (status === "developing") {
      return "bg-blue-100 text-blue-700"
    }

    return "bg-slate-100 text-slate-600"
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="min-h-screen bg-slate-50 text-slate-800">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">

          <div>

            <button
              onClick={() => navigate("/")}
              className="group mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-green-600"
            >

              <ArrowLeft
                size={17}
                className="transition group-hover:-translate-x-1"
              />

              Back to Dashboard

            </button>


            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">

                <LineChart size={22} />

              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Market Insights
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Real estate intelligence generated from your property database.
                </p>

              </div>

            </div>

          </div>


          <div className="hidden items-center gap-3 sm:flex">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">

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

      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-8">


        {/* =====================================================
            MARKET OVERVIEW
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-sm">

          <div className="p-6 md:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">

                  <TrendingUp size={24} />

                </div>


                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-xl font-bold text-slate-900">
                      Real Estate Market Overview
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getMarketStatusClass()}`}
                    >
                      {market.status || "No Data"}
                    </span>

                  </div>


                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">

                    Market intelligence calculated from{" "}

                    <strong className="font-bold text-slate-900">
                      {formatNumber(totalProperties)}
                    </strong>{" "}

                    property listings in your database.

                  </p>

                </div>

              </div>


              <div className="rounded-2xl border border-green-100 bg-white px-5 py-4 shadow-sm">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Market Outlook
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <TrendingUp
                    size={18}
                    className="text-green-600"
                  />

                  <span className="text-lg font-bold text-green-700">
                    {market.outlook || "Insufficient Data"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">


          <MarketCard
            icon={<Database size={21} />}
            title="Properties"
            value={formatNumber(totalProperties)}
            badge="Live"
            description="Database listings"
          />


          <MarketCard
            icon={<Building2 size={21} />}
            title="Average Price"
            value={formatPKR(averagePrice)}
            badge="Current"
            description="Across all listings"
          />


          <MarketCard
            icon={<RulerIcon />}
            title="Average Area"
            value={`${formatNumber(averageArea)} sq ft`}
            badge="Current"
            description="Average property size"
          />


          <MarketCard
            icon={<Target size={21} />}
            title="Price / Area"
            value={`₨ ${formatNumber(averagePricePerArea)}`}
            badge="Calculated"
            description="Average price per sq ft"
          />

        </div>


        {/* =====================================================
            PRICE + DEMAND
        ===================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">


          {/* PRICE TREND */}

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                  <BarChart3 size={20} />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Recent Property Prices
                  </h2>

                  <p className="text-sm text-slate-500">
                    Latest listings added to the database
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6">

              {priceTrend.length === 0 ? (

                <EmptyState text="No price data available yet." />

              ) : (

                <div className="space-y-6">

                  {priceTrend.map((item, index) => (

                    <GrowthRow
                      key={item.id || index}
                      title={item.title || `Property ${item.id}`}
                      date={item.date}
                      value={formatPKR(item.price)}
                      percent={getTrendPercent(
                        item.price,
                        priceTrend
                      )}
                    />

                  ))}

                </div>

              )}

            </div>

          </section>


          {/* DEMAND */}

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                  <MapPin size={20} />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Demand by Area
                  </h2>

                  <p className="text-sm text-slate-500">
                    Property listing activity by city
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6">

              {demandByArea.length === 0 ? (

                <EmptyState text="No city data available yet." />

              ) : (

                <div className="space-y-7">

                  {demandByArea.map((item, index) => (

                    <DemandRow
                      key={`${item.area}-${index}`}
                      area={item.area}
                      demand={item.demand}
                      status={item.status}
                      count={item.property_count}
                    />

                  ))}

                </div>

              )}

            </div>

          </section>

        </div>


        {/* =====================================================
            MARKET SEGMENTS
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">

                <Landmark size={20} />

              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Market Segments
                </h2>

                <p className="text-sm text-slate-500">
                  Distribution of properties by category.
                </p>

              </div>

            </div>

          </div>


          <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">

            {propertySegments.length === 0 ? (

              <div className="md:col-span-2 lg:col-span-4">

                <EmptyState text="No property categories available yet." />

              </div>

            ) : (

              propertySegments.slice(0, 8).map((item, index) => (

                <SegmentCard
                  key={`${item.title}-${index}`}
                  icon={getSegmentIcon(item.title)}
                  title={item.title}
                  value={item.value}
                  count={item.count}
                />

              ))

            )}

          </div>

        </section>


        {/* =====================================================
            INVESTMENT OPPORTUNITIES
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <h2 className="font-bold text-slate-900">
              Investment Opportunities
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Areas ranked by current property listing activity.
            </p>

          </div>


          <div className="grid gap-5 p-6 md:grid-cols-3">

            {opportunities.length === 0 ? (

              <div className="md:col-span-3">

                <EmptyState
                  text="Add more property listings to identify investment opportunities."
                />

              </div>

            ) : (

              opportunities.slice(0, 3).map((item, index) => (

                <Opportunity
                  key={`${item.title}-${index}`}
                  title={item.title}
                  demand={item.demand}
                  status={item.status}
                  description={item.description}
                  averagePrice={item.average_price}
                  propertyCount={item.property_count}
                />

              ))

            )}

          </div>

        </section>


        {/* =====================================================
            DATABASE SUMMARY
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">

                  <Activity size={21} />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Market Data Summary
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Statistics calculated directly from EstatePro property records.
                  </p>

                </div>

              </div>


              <div className="flex gap-3">

                <SummaryBadge
                  label="Avg. Bedrooms"
                  value={Number(
                    market.average_bedrooms || 0
                  ).toFixed(1)}
                />

                <SummaryBadge
                  label="Avg. Bathrooms"
                  value={Number(
                    market.average_bathrooms || 0
                  ).toFixed(1)}
                />

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            RECOMMENDATION
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50">

          <div className="flex items-start gap-4 p-6 md:p-8">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">

              <TrendingUp size={23} />

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Market Recommendation
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">

                {data?.recommendation ||
                  "Add property listings to generate market recommendations."}

              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-700">

                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                {market.status === "Positive"
                  ? "Positive Market Outlook"
                  : market.status === "Stable"
                    ? "Stable Market Outlook"
                    : "Developing Market"}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            REFRESH
        ===================================================== */}

        <div className="mt-5 flex justify-end">

          <button
            onClick={fetchMarketInsights}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-green-200 hover:text-green-600"
          >

            <RefreshCw size={14} />

            Refresh Market Data

          </button>

        </div>

      </main>

    </div>
  )
}


/* =========================================================
   MARKET CARD
========================================================= */

function MarketCard({
  icon,
  title,
  value,
  badge,
  description,
}) {

  return (

    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">

          {icon}

        </div>

        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
          {badge}
        </span>

      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  )
}


/* =========================================================
   GROWTH ROW
========================================================= */

function GrowthRow({
  title,
  date,
  value,
  percent,
}) {

  return (

    <div>

      <div className="mb-2 flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-slate-700">
            {title}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {date || "Recent listing"}
          </p>

        </div>

        <span className="shrink-0 text-sm font-bold text-slate-900">
          {value}
        </span>

      </div>


      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-green-500 transition-all duration-700"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  )
}


/* =========================================================
   DEMAND ROW
========================================================= */

function DemandRow({
  area,
  demand,
  status,
  count,
}) {

  const percentage =
    Math.min(
      Math.max(Number(demand) || 0, 0),
      100
    )

  return (

    <div>

      <div className="mb-2 flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {area}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {status} activity
            {" • "}
            {count} properties
          </p>

        </div>

        <span className="text-sm font-bold text-green-700">
          {percentage}%
        </span>

      </div>


      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-green-500 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  )
}


/* =========================================================
   SEGMENT CARD
========================================================= */

function SegmentCard({
  icon,
  title,
  value,
  count,
}) {

  return (

    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-green-100 hover:bg-green-50">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">

          {icon}

        </div>

        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
          {count} listings
        </span>

      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {Number(value || 0).toFixed(1)}%
      </p>

    </div>
  )
}


/* =========================================================
   OPPORTUNITY
========================================================= */

function Opportunity({
  title,
  demand,
  status,
  description,
  averagePrice,
  propertyCount,
}) {

  return (

    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-green-100 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">

          <TrendingUp size={18} />

        </div>

      </div>


      <p className="mt-5 text-2xl font-bold text-green-600">
        {Number(demand || 0)}%
      </p>

      <p className="mt-1 text-xs font-bold text-green-700">
        {status || "Market"} activity
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>


      <div className="mt-4 flex flex-wrap gap-2">

        <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
          {propertyCount} properties
        </span>

        <span className="rounded-lg bg-green-50 px-2.5 py-1.5 text-[11px] font-semibold text-green-700">
          Avg. {formatOpportunityPrice(averagePrice)}
        </span>

      </div>


      <div className="mt-5 flex items-center gap-1 text-xs font-bold text-green-700">

        High listing activity

        <ArrowUpRight size={13} />

      </div>

    </div>
  )
}


/* =========================================================
   OPPORTUNITY PRICE FORMAT
========================================================= */

function formatOpportunityPrice(value) {

  const number = Number(value) || 0

  if (number >= 10000000) {
    return `₨ ${(number / 10000000).toFixed(2)} Cr`
  }

  if (number >= 1000000) {
    return `₨ ${(number / 1000000).toFixed(2)}M`
  }

  if (number >= 1000) {
    return `₨ ${(number / 1000).toFixed(0)}K`
  }

  return `₨ ${number.toLocaleString()}`
}


/* =========================================================
   SUMMARY BADGE
========================================================= */

function SummaryBadge({
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  text,
}) {

  return (

    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">

        <Database size={20} />

      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {text}
      </p>

    </div>
  )
}


/* =========================================================
   TREND PERCENT
========================================================= */

function getTrendPercent(
  price,
  trend
) {

  const prices = trend
    .map(item => Number(item.price) || 0)
    .filter(value => value > 0)

  if (!prices.length) {
    return 10
  }

  const maxPrice = Math.max(...prices)

  if (!maxPrice) {
    return 10
  }

  return Math.max(
    8,
    Math.min(
      100,
      (Number(price || 0) / maxPrice) * 100
    )
  )
}


/* =========================================================
   SEGMENT ICON
========================================================= */

function getSegmentIcon(title) {

  const value =
    String(title || "").toLowerCase()

  if (value.includes("commercial")) {
    return <Building2 size={19} />
  }

  if (
    value.includes("plot") ||
    value.includes("land")
  ) {
    return <MapPin size={19} />
  }

  if (value.includes("luxury")) {
    return <Landmark size={19} />
  }

  return <Home size={19} />
}


/* =========================================================
   RULER ICON
========================================================= */

function RulerIcon() {

  return (

    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M21.3 8.7 8.7 21.3" />

      <path d="m14 7 3 3" />

      <path d="m11 10 3 3" />

      <path d="m8 13 3 3" />

      <path d="m5 16 3 3" />

      <path d="M4 20 20 4" />

    </svg>
  )
}


export default MarketInsights