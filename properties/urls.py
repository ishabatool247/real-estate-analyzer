from django.urls import path

from . import views


app_name = "properties"


urlpatterns = [

    # =====================================================
    # DJANGO PAGES
    # =====================================================
    path(
    "",
    views.dashboard,
    name="home",
    ),

    path(
    "dashboard/",
    views.dashboard,
    name="dashboard",
    ),

    path(
        "properties/",
        views.property_list,
        name="property_list",
    ),

    path(
        "add/",
        views.add_property,
        name="add_property",
    ),

    path(
        "property/<int:pk>/",
        views.property_detail,
        name="property_detail",
    ),

    path(
        "property/<int:pk>/contact/",
        views.contact_agent,
        name="contact_agent",
    ),

    path(
        "property/<int:pk>/analysis/",
        views.property_analysis,
        name="property_analysis",
    ),

# =====================================================
# REACT APIs - PROPERTIES
# =====================================================

path(
    "api/properties/",
    views.properties_api,
    name="properties_api",
),

path(
    "api/properties/add/",
    views.add_property_api,
    name="add_property_api",
),

path(
    "api/properties/scrape/",
    views.scrape_property_api,
    name="scrape_property_api",
),

path(
    "api/properties/<int:pk>/",
    views.property_detail_api,
    name="property_detail_api",
),
path(
    "api/properties/<int:pk>/delete/",
    views.delete_property_api,
    name="delete_property_api",
),
    path(
        "api/properties/<int:pk>/analysis/",
        views.property_analysis_api,
        name="property_analysis_api",
    ),

    path(
        "api/properties/<int:pk>/contact/",
        views.contact_agent_api,
        name="contact_agent_api",
    ),
    path(
    "api/property/<int:pk>/contact/",
    views.contact_agent_api,
    name="contact_agent_api_singular",
),


    # =====================================================
    # REACT API - MARKET INSIGHTS
    # =====================================================

    path(
        "api/market-insights/",
        views.market_insights_api,
        name="market_insights_api",
    ),


    # =====================================================
    # REACT API - USER
    # =====================================================

    path(
        "api/user/",
        views.user_api,
        name="user_api",
    ),


    # =====================================================
    # REACT API - SETTINGS
    # =====================================================

    path(
        "api/settings/",
        views.settings_api,
        name="settings_api",
    ),
]