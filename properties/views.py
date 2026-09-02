import os
from urllib.parse import urlparse
from django.core.files.base import ContentFile
import re
import requests

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg, Count
from django.utils import timezone

from datetime import timedelta
import json

from .models import Property, AgentInquiry
from .forms import PropertyForm


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_property_image_url(request, property_obj):
    """
    Return absolute property image URL.
    """

    if not property_obj.image:
        return ""

    try:
        return request.build_absolute_uri(
            property_obj.image.url
        )
    except ValueError:
        return ""

def calculate_property_analysis(property_obj):
    """
    Dynamic property analysis.

    Every property is analyzed using its own:
    - price
    - area
    - bedrooms
    - bathrooms
    - purpose
    - property type

    No property-specific values are hardcoded.
    """

    price = float(property_obj.price or 0)
    area = float(property_obj.area or 0)

    bedrooms = int(property_obj.bedrooms or 0)
    bathrooms = int(property_obj.bathrooms or 0)

    purpose = (property_obj.purpose or "Sale").strip()
    property_type = (
        property_obj.property_type or "Property"
    ).strip()

    # =====================================================
    # PRICE PER SQ FT
    # =====================================================

    price_per_area = (
        price / area
        if area > 0
        else 0
    )

    # =====================================================
    # RENTAL CALCULATION
    # =====================================================
    #
    # For rental listings:
    # the entered price is treated as MONTHLY RENT.
    #
    # For sale listings:
    # estimated monthly rent is calculated from
    # property value using a conservative 0.5% estimate.
    # =====================================================

    if purpose.lower() == "rent":

        estimated_monthly_rent = price

    else:

        estimated_monthly_rent = (
            price * 0.005
        )

    estimated_annual_rent = (
        estimated_monthly_rent * 12
    )

    # =====================================================
    # RENTAL YIELD
    # =====================================================

    if price > 0:

        if purpose.lower() == "rent":

            # Rental listing:
            # annual rent compared with property value
            #
            # If no separate property value exists,
            # yield cannot be accurately calculated.

            rental_yield = 0

        else:

            rental_yield = (
                estimated_annual_rent
                / price
            ) * 100

    else:

        rental_yield = 0

    # =====================================================
    # PRICE ASSESSMENT
    # =====================================================

    if price_per_area <= 5000:

        price_assessment = "Low Price"
        price_score = 90

    elif price_per_area <= 10000:

        price_assessment = "Reasonable Price"
        price_score = 80

    elif price_per_area <= 15000:

        price_assessment = "Moderate Price"
        price_score = 70

    else:

        price_assessment = "High Price"
        price_score = 55

    # =====================================================
    # RENTAL ASSESSMENT
    # =====================================================

    if purpose.lower() == "rent":

        # Rental listing does not have a separate
        # property-value field, so assessment is based
        # on monthly rent relative to area.

        rent_per_sqft = (
            price / area
            if area > 0
            else 0
        )

        if rent_per_sqft <= 20:

            rental_assessment = "Excellent"
            rental_score = 95

        elif rent_per_sqft <= 35:

            rental_assessment = "Good"
            rental_score = 85

        elif rent_per_sqft <= 50:

            rental_assessment = "Moderate"
            rental_score = 75

        else:

            rental_assessment = "High Rent"
            rental_score = 60

    else:

        if rental_yield >= 6:

            rental_assessment = "Excellent"
            rental_score = 95

        elif rental_yield >= 5:

            rental_assessment = "Good"
            rental_score = 85

        elif rental_yield >= 4:

            rental_assessment = "Moderate"
            rental_score = 75

        else:

            rental_assessment = "Low"
            rental_score = 60

    # =====================================================
    # PROPERTY PROFILE SCORE
    # =====================================================

    profile_score = 60

    if bedrooms >= 1:
        profile_score += 5

    if bedrooms >= 3:
        profile_score += 10

    if bedrooms >= 5:
        profile_score += 5

    if bathrooms >= 1:
        profile_score += 5

    if bathrooms >= 2:
        profile_score += 5

    if area >= 1000:
        profile_score += 5

    if area >= 1500:
        profile_score += 5

    if area >= 2500:
        profile_score += 5

    profile_score = min(
        profile_score,
        100,
    )

    # =====================================================
    # PROPERTY TYPE ADJUSTMENT
    # =====================================================

    type_bonus = {

        "House": 3,
        "Apartment": 2,
        "Commercial": 4,
        "Shop": 3,
        "Office": 2,
        "Farm House": 3,
        "Plot": 2,

    }.get(
        property_type,
        0,
    )

    profile_score = min(
        profile_score + type_bonus,
        100,
    )

    # =====================================================
    # INVESTMENT SCORE
    # =====================================================

    investment_score = round(
        (
            price_score
            + rental_score
            + profile_score
        ) / 3
    )

    # =====================================================
    # MARKET POSITION
    # =====================================================

    if investment_score >= 85:

        market_position = "Excellent"
        market_performance = investment_score

    elif investment_score >= 75:

        market_position = "Above Average"
        market_performance = investment_score

    elif investment_score >= 65:

        market_position = "Average"
        market_performance = investment_score

    else:

        market_position = "Below Average"
        market_performance = investment_score

    # =====================================================
    # MARKET DEMAND
    # =====================================================

    if investment_score >= 85:

        market_demand = "High"
        demand_score = 90

    elif investment_score >= 75:

        market_demand = "Good"
        demand_score = 75

    elif investment_score >= 65:

        market_demand = "Moderate"
        demand_score = 60

    else:

        market_demand = "Low"
        demand_score = 40

    # =====================================================
    # RISK
    # =====================================================

    if investment_score >= 85:

        risk_level = "Low"
        risk_score = 20

    elif investment_score >= 75:

        risk_level = "Moderate"
        risk_score = 35

    elif investment_score >= 65:

        risk_level = "Medium"
        risk_score = 50

    else:

        risk_level = "High"
        risk_score = 70

    # =====================================================
    # EXPECTED GROWTH
    # =====================================================

    if investment_score >= 85:

        annual_growth = 14.8

    elif investment_score >= 75:

        annual_growth = 10.5

    elif investment_score >= 65:

        annual_growth = 7.5

    else:

        annual_growth = 4.5

    # =====================================================
    # EXPECTED ANNUAL RETURN
    # =====================================================

    if purpose.lower() == "rent":

        expected_annual_return = (
            estimated_annual_rent
        )

    else:

        expected_annual_return = (
            price
            * annual_growth
            / 100
        )

    # =====================================================
    # BREAK EVEN
    # =====================================================

    break_even_years = (
        price / estimated_annual_rent
        if (
            purpose.lower() != "rent"
            and estimated_annual_rent > 0
        )
        else 0
    )

    # =====================================================
    # RECOMMENDATION
    # =====================================================

    if investment_score >= 85:

        recommendation = "Strong Buy"

    elif investment_score >= 75:

        recommendation = "Good Investment"

    elif investment_score >= 65:

        recommendation = "Moderate Investment"

    else:

        recommendation = "Review Carefully"

    # =====================================================
    # LOCATION METRICS
    # =====================================================

    location_demand = min(
        demand_score + 2,
        100,
    )

    price_stability = max(
        100 - risk_score,
        0,
    )

    growth_potential = min(
        investment_score + 1,
        100,
    )

    # =====================================================
    # RETURN
    # =====================================================

    return {

        "price": price,

        "area": area,

        "bedrooms": bedrooms,

        "bathrooms": bathrooms,

        "purpose": purpose,

        "property_type": property_type,

        "price_per_area":
            price_per_area,

        "estimated_monthly_rent":
            estimated_monthly_rent,

        "estimated_annual_rent":
            estimated_annual_rent,

        "rental_yield":
            rental_yield,

        "price_assessment":
            price_assessment,

        "rental_assessment":
            rental_assessment,

        "price_score":
            price_score,

        "rental_score":
            rental_score,

        "profile_score":
            profile_score,

        "investment_score":
            investment_score,

        "market_position":
            market_position,

        "market_performance":
            market_performance,

        "market_demand":
            market_demand,

        "demand_score":
            demand_score,

        "risk_level":
            risk_level,

        "risk_score":
            risk_score,

        "annual_growth":
            annual_growth,

        "expected_annual_return":
            expected_annual_return,

        "annual_roi":
            rental_yield,

        "break_even_years":
            break_even_years,

        "recommendation":
            recommendation,

        "location_demand":
            location_demand,

        "price_stability":
            price_stability,

        "growth_potential":
            growth_potential,
    }


# =========================================================
# DASHBOARD
# =========================================================

def dashboard(request):

    properties = (
        Property.objects
        .all()
        .order_by("-created_at")
    )

    return render(
        request,
        "properties/dashboard.html",
        {
            "properties": properties,
        },
    )
# =========================================================
# ADD PROPERTY - REACT API
# =========================================================

@csrf_exempt
@require_POST
def add_property_api(request):

    try:
        title = request.POST.get("title", "").strip()
        property_type = request.POST.get(
            "property_type",
            "House",
        ).strip()
        purpose = request.POST.get(
            "purpose",
            "Sale",
        ).strip()
        city = request.POST.get("city", "").strip()

        area = request.POST.get(
            "area",
            "0",
        ).strip()

        price = request.POST.get(
            "price",
            "0",
        ).strip()

        bedrooms = request.POST.get(
            "bedrooms",
            "0",
        ).strip()

        bathrooms = request.POST.get(
            "bathrooms",
            "0",
        ).strip()

        address = request.POST.get(
            "address",
            "",
        ).strip()

        description = request.POST.get(
            "description",
            "",
        ).strip()

        source_url = request.POST.get(
            "source_url",
            "",
        ).strip()

        floors = request.POST.get(
            "floors",
            "0",
        ).strip()

        parking_spaces = request.POST.get(
            "parking_spaces",
            "0",
        ).strip()

        furnishing_status = request.POST.get(
            "furnishing_status",
            "",
        ).strip()

        # -------------------------------------------------
        # REQUIRED FIELDS
        # -------------------------------------------------

        if not title:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Property title is required.",
                },
                status=400,
            )

        if not city:
            return JsonResponse(
                {
                    "success": False,
                    "message": "City is required.",
                },
                status=400,
            )

        if not area:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Area is required.",
                },
                status=400,
            )

        if not price:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Price is required.",
                },
                status=400,
            )

        # -------------------------------------------------
        # CREATE PROPERTY
        # -------------------------------------------------

        property_obj = Property.objects.create(
            title=title,
            property_type=property_type,
            purpose=purpose,
            city=city,
            area=area,
            price=price,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            address=address,
            description=description,
            source_url=source_url or None,
            floors=floors,
            parking_spaces=parking_spaces,
            furnishing_status=furnishing_status,
        )

        # -------------------------------------------------
        # IMAGE
        # -------------------------------------------------

        image = request.FILES.get("image")

        if image:
            property_obj.image = image
            property_obj.save()

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return JsonResponse(
            {
                "success": True,
                "message": "Property added successfully.",
                "property": {
                    "id": property_obj.id,
                    "title": property_obj.title,
                    "property_type": property_obj.property_type,
                    "purpose": property_obj.purpose,
                    "city": property_obj.city,
                    "area": float(property_obj.area),
                    "price": float(property_obj.price),
                    "bedrooms": property_obj.bedrooms,
                    "bathrooms": property_obj.bathrooms,
                    "address": property_obj.address,
                    "description": property_obj.description,
                    "floors": property_obj.floors,
                    "parking_spaces": property_obj.parking_spaces,
                    "furnishing_status":
                        property_obj.furnishing_status,
                    "image":
                        get_property_image_url(
                            request,
                            property_obj,
                        ),
                },
            },
            status=201,
        )

    except (
        ValueError,
        TypeError,
    ):

        return JsonResponse(
            {
                "success": False,
                "message": "Please enter valid property values.",
            },
            status=400,
        )

    except Exception as e:

        return JsonResponse(
            {
                "success": False,
                "message": str(e),
            },
            status=400,
        )

# =========================================================
# PROPERTY LIST - DJANGO
# =========================================================

def property_list(request):

    properties = (
        Property.objects
        .all()
        .order_by("-created_at")
    )

    city = request.GET.get(
        "city",
        "",
    ).strip()

    property_type = request.GET.get(
        "property_type",
        "",
    ).strip()

    min_price = request.GET.get(
        "min_price",
        "",
    ).strip()

    max_price = request.GET.get(
        "max_price",
        "",
    ).strip()

    min_area = request.GET.get(
        "min_area",
        "",
    ).strip()

    max_area = request.GET.get(
        "max_area",
        "",
    ).strip()

    if city:

        properties = properties.filter(
            city__iexact=city
        )

    if property_type:

        properties = properties.filter(
            property_type=property_type
        )

    if min_price:

        properties = properties.filter(
            price__gte=min_price
        )

    if max_price:

        properties = properties.filter(
            price__lte=max_price
        )

    if min_area:

        properties = properties.filter(
            area__gte=min_area
        )

    if max_area:

        properties = properties.filter(
            area__lte=max_area
        )

    return render(
        request,
        "properties/property_list.html",
        {
            "properties": properties,
            "city": city,
            "property_type": property_type,
            "min_price": min_price,
            "max_price": max_price,
            "min_area": min_area,
            "max_area": max_area,
        },
    )


# =========================================================
# ADD PROPERTY - DJANGO
# =========================================================

def add_property(request):

    if request.method == "POST":

        form = PropertyForm(
            request.POST,
            request.FILES,
        )

        if form.is_valid():

            form.save()

            return redirect(
                "properties:property_list"
            )

    else:

        form = PropertyForm()

    return render(
        request,
        "properties/add_property.html",
        {
            "form": form,
        },
    )


# =========================================================
# PROPERTY DETAIL - DJANGO
# =========================================================

def property_detail(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    return render(
        request,
        "properties/property_detail.html",
        {
            "property": property_obj,
        },
    )


# =========================================================
# CONTACT AGENT - DJANGO
# =========================================================

def contact_agent(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    if request.method == "POST":

        name = request.POST.get(
            "name",
            "",
        ).strip()

        email = request.POST.get(
            "email",
            "",
        ).strip()

        phone = request.POST.get(
            "phone",
            "",
        ).strip()

        message = request.POST.get(
            "message",
            "",
        ).strip()

        if name and email and phone:

            AgentInquiry.objects.create(
                property=property_obj,
                name=name,
                email=email,
                phone=phone,
                message=message,
            )

            return redirect(
                "properties:property_detail",
                pk=property_obj.pk,
            )

    return render(
        request,
        "properties/contact_agent.html",
        {
            "property": property_obj,
        },
    )


# =========================================================
# PROPERTIES - REACT API
# =========================================================

def properties_api(request):

    properties = (
        Property.objects
        .all()
        .order_by("-created_at")
    )

    data = []

    for property_obj in properties:

        data.append(
            {
                "id": property_obj.id,

                "title":
                    property_obj.title or "",

                "property_type":
                    property_obj.property_type or "",

                "purpose":
                    property_obj.purpose or "",

                "city":
                    property_obj.city or "",

                "price":
                    float(
                        property_obj.price or 0
                    ),

                "area":
                    float(
                        property_obj.area or 0
                    ),

                "bedrooms":
                    int(
                        property_obj.bedrooms or 0
                    ),

                "bathrooms":
                    int(
                        property_obj.bathrooms or 0
                    ),

                "address":
                    property_obj.address or "",

                "description":
                    property_obj.description or "",

                "image":
                    get_property_image_url(
                        request,
                        property_obj,
                    ),
            }
        )

    return JsonResponse(
        {
            "success": True,
            "count": len(data),
            "properties": data,
        }
    )


# =========================================================
# PROPERTY DETAIL - REACT API
# =========================================================

def property_detail_api(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    return JsonResponse(
        {
            "success": True,

            "property": {

                "id":
                    property_obj.id,

                "title":
                    property_obj.title or "",

                "property_type":
                    property_obj.property_type or "",

                "purpose":
                    property_obj.purpose or "",

                "city":
                    property_obj.city or "",

                "price":
                    float(
                        property_obj.price or 0
                    ),

                "area":
                    float(
                        property_obj.area or 0
                    ),

                "bedrooms":
                    int(
                        property_obj.bedrooms or 0
                    ),

                "bathrooms":
                    int(
                        property_obj.bathrooms or 0
                    ),

                "floors":
                    int(
                        property_obj.floors or 0
                    ),

                "parking_spaces":
                    int(
                        property_obj.parking_spaces or 0
                    ),

                "furnishing_status":
                    property_obj.furnishing_status or "",

                "address":
                    property_obj.address or "",

                "description":
                    property_obj.description or "",

                "image":
                    get_property_image_url(
                        request,
                        property_obj,
                    ),
            },
        }
    )

# =========================================================
# DELETE PROPERTY - REACT API
# =========================================================

@csrf_exempt
@require_POST
def delete_property_api(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    property_obj.delete()

    return JsonResponse(
        {
            "success": True,
            "message": "Property deleted successfully.",
            "property_id": pk,
        },
        status=200,
    )
# =========================================================
# PROPERTY ANALYSIS - DJANGO PAGE
# =========================================================

def property_analysis(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    analysis = calculate_property_analysis(
        property_obj
    )

    context = {
        "property": property_obj,
        **analysis,
    }

    return render(
        request,
        "properties/property_analysis.html",
        context,
    )


# =========================================================
# PROPERTY ANALYSIS - REACT API
# =========================================================

def property_analysis_api(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    analysis = calculate_property_analysis(
        property_obj
    )

    return JsonResponse(
        {
            "success": True,

            "property": {

                "id":
                    property_obj.id,

                "title":
                    property_obj.title or "",

                "property_type":
                    property_obj.property_type or "",

                "purpose":
                    property_obj.purpose or "",

                "city":
                    property_obj.city or "",

                "price":
                    analysis["price"],

                "area":
                    analysis["area"],

                "bedrooms":
                    analysis["bedrooms"],

                "bathrooms":
                    analysis["bathrooms"],

                "address":
                    property_obj.address or "",

                "description":
                    property_obj.description or "",

                "image":
                    get_property_image_url(
                        request,
                        property_obj,
                    ),
            },

            "analysis": {

                "price_per_area":
                    round(
                        analysis["price_per_area"],
                        2,
                    ),

                "estimated_monthly_rent":
                    round(
                        analysis[
                            "estimated_monthly_rent"
                        ],
                        2,
                    ),

                "estimated_annual_rent":
                    round(
                        analysis[
                            "estimated_annual_rent"
                        ],
                        2,
                    ),

                "rental_yield":
                    round(
                        analysis["rental_yield"],
                        2,
                    ),

                "price_assessment":
                    analysis[
                        "price_assessment"
                    ],

                "rental_assessment":
                    analysis[
                        "rental_assessment"
                    ],

                "price_score":
                    analysis["price_score"],

                "rental_score":
                    analysis["rental_score"],

                "profile_score":
                    analysis["profile_score"],

                "investment_score":
                    analysis[
                        "investment_score"
                    ],

                "recommendation":
                    analysis[
                        "recommendation"
                    ],

                "annual_roi":
                    round(
                        analysis["annual_roi"],
                        2,
                    ),

                "break_even_years":
                    round(
                        analysis[
                            "break_even_years"
                        ],
                        2,
                    ),
            },
        }
    )


# =========================================================
# CONTACT AGENT - REACT API
# =========================================================

@csrf_exempt
@require_POST
def contact_agent_api(request, pk):

    property_obj = get_object_or_404(
        Property,
        pk=pk,
    )

    try:

        data = json.loads(
            request.body.decode("utf-8")
        )

    except (
        json.JSONDecodeError,
        UnicodeDecodeError,
    ):

        return JsonResponse(
            {
                "success": False,
                "message": "Invalid JSON data.",
            },
            status=400,
        )

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip()

    phone = str(
        data.get("phone", "")
    ).strip()

    message = str(
        data.get("message", "")
    ).strip()

    if not name:

        return JsonResponse(
            {
                "success": False,
                "message": "Name is required.",
            },
            status=400,
        )

    if not email:

        return JsonResponse(
            {
                "success": False,
                "message": "Email is required.",
            },
            status=400,
        )

    if not phone:

        return JsonResponse(
            {
                "success": False,
                "message": "Phone is required.",
            },
            status=400,
        )

    inquiry = AgentInquiry.objects.create(
        property=property_obj,
        name=name,
        email=email,
        phone=phone,
        message=message,
    )

    return JsonResponse(
        {
            "success": True,

            "message":
                "Your inquiry has been submitted successfully.",

            "inquiry_id":
                inquiry.id,
        },

        status=201,
    )


# =========================================================
# MARKET INSIGHTS - REACT API
# =========================================================

def market_insights_api(request):

    properties = Property.objects.all()

    total_properties = properties.count()

    # =====================================================
    # EMPTY DATABASE
    # =====================================================

    if total_properties == 0:

        return JsonResponse(
            {
                "success": True,

                "market": {

                    "status": "No Data",

                    "outlook":
                        "Insufficient Data",

                    "total_properties": 0,

                    "average_price": 0,

                    "average_area": 0,

                    "average_price_per_area": 0,

                    "average_bedrooms": 0,

                    "average_bathrooms": 0,

                    "market_growth": 0,

                },

                "price_trend": [],

                "demand_by_area": [],

                "property_segments": [],

                "investment_opportunities": [],

                "recommendation":
                    "Add real property listings to generate market insights.",
            }
        )

    # =====================================================
    # BASIC MARKET METRICS
    # =====================================================

    aggregates = properties.aggregate(

        average_price=Avg(
            "price"
        ),

        average_area=Avg(
            "area"
        ),

        average_bedrooms=Avg(
            "bedrooms"
        ),

        average_bathrooms=Avg(
            "bathrooms"
        ),
    )

    average_price = float(
        aggregates["average_price"] or 0
    )

    average_area = float(
        aggregates["average_area"] or 0
    )

    average_bedrooms = float(
        aggregates["average_bedrooms"] or 0
    )

    average_bathrooms = float(
        aggregates["average_bathrooms"] or 0
    )

    # =====================================================
    # AVERAGE PRICE PER AREA
    # =====================================================

    valid_area_properties = (
        properties
        .exclude(area__isnull=True)
        .exclude(area=0)
        .exclude(price__isnull=True)
    )

    price_per_area_values = []

    for property_obj in valid_area_properties:

        price = float(
            property_obj.price or 0
        )

        area = float(
            property_obj.area or 0
        )

        if area > 0:

            price_per_area_values.append(
                price / area
            )

    average_price_per_area = (
        sum(price_per_area_values)
        / len(price_per_area_values)
        if price_per_area_values
        else 0
    )

    # =====================================================
    # PRICE TREND
    # =====================================================

    recent_properties = list(
        properties
        .exclude(price__isnull=True)
        .order_by("-created_at")[:12]
    )

    recent_properties.reverse()

    price_trend = []

    for property_obj in recent_properties:

        price_trend.append(
            {
                "id":
                    property_obj.id,

                "title":
                    property_obj.title or "",

                "price":
                    float(
                        property_obj.price or 0
                    ),

                "date":
                    (
                        property_obj.created_at.strftime(
                            "%Y-%m-%d"
                        )
                        if property_obj.created_at
                        else ""
                    ),
            }
        )

    # =====================================================
    # MARKET GROWTH
    # =====================================================
    #
    # This is based on the average listing price in:
    #
    # current 30 days
    # versus
    # previous 30 days
    #
    # If there is not enough historical data,
    # we return 0 instead of inventing a percentage.
    # =====================================================

    now = timezone.now()

    current_start = (
        now - timedelta(days=30)
    )

    previous_start = (
        now - timedelta(days=60)
    )

    current_properties = properties.filter(
        created_at__gte=current_start
    )

    previous_properties = properties.filter(
        created_at__gte=previous_start,
        created_at__lt=current_start,
    )

    current_average = (
        current_properties.aggregate(
            avg=Avg("price")
        )["avg"]
    )

    previous_average = (
        previous_properties.aggregate(
            avg=Avg("price")
        )["avg"]
    )

    if (
        current_average is not None
        and previous_average is not None
        and float(previous_average) > 0
    ):

        market_growth = (
            (
                float(current_average)
                - float(previous_average)
            )
            / float(previous_average)
        ) * 100

    else:

        market_growth = 0

    # =====================================================
    # DEMAND BY AREA
    # =====================================================
    #
    # Important:
    # This represents LISTING CONCENTRATION,
    # not actual buyer demand.
    #
    # Without inquiry/search/view data we should
    # not claim that an area has 92% buyer demand.
    # =====================================================

    city_data = (
        properties
        .exclude(
            city__isnull=True
        )
        .exclude(
            city=""
        )
        .values("city")
        .annotate(
            count=Count("id"),
            average_price=Avg("price"),
        )
        .order_by("-count")
    )

    demand_by_area = []

    for item in city_data[:6]:

        listing_share = (
            item["count"]
            / total_properties
        ) * 100

        if listing_share >= 40:

            status = "Very High"

        elif listing_share >= 25:

            status = "High"

        elif listing_share >= 10:

            status = "Good"

        else:

            status = "Moderate"

        demand_by_area.append(
            {
                "area":
                    item["city"],

                "demand":
                    round(
                        listing_share,
                        1,
                    ),

                "status":
                    status,

                "property_count":
                    item["count"],

                "average_price":
                    float(
                        item[
                            "average_price"
                        ] or 0
                    ),
            }
        )

    # =====================================================
    # PROPERTY SEGMENTS
    # =====================================================

    type_data = (
        properties
        .values("property_type")
        .annotate(
            count=Count("id")
        )
        .order_by("-count")
    )

    property_segments = []

    for item in type_data:

        percentage = (
            item["count"]
            / total_properties
        ) * 100

        property_segments.append(
            {
                "title":
                    item[
                        "property_type"
                    ] or "Other",

                "value":
                    round(
                        percentage,
                        1,
                    ),

                "count":
                    item["count"],
            }
        )

    # =====================================================
    # INVESTMENT OPPORTUNITIES
    # =====================================================

    investment_opportunities = []

    for item in demand_by_area[:3]:

        city = item["area"]

        city_properties = properties.filter(
            city__iexact=city
        )

        city_average = (
            city_properties.aggregate(
                avg=Avg("price")
            )["avg"]
            or 0
        )

        investment_opportunities.append(
            {
                "title":
                    city,

                "demand":
                    item["demand"],

                "status":
                    item["status"],

                "property_count":
                    item["property_count"],

                "average_price":
                    float(
                        city_average
                    ),

                "description":
                    (
                        f"{city} currently has "
                        f"{item['property_count']} "
                        "properties in the dataset. "
                        "This indicates strong listing activity "
                        "relative to other areas in the dataset."
                    ),
            }
        )

    # =====================================================
    # MARKET STATUS
    # =====================================================

    if total_properties >= 20:

        status = "Positive"
        outlook = "Strong Data Coverage"

    elif total_properties >= 10:

        status = "Stable"
        outlook = "Moderate Data Coverage"

    elif total_properties >= 5:

        status = "Developing"
        outlook = "Limited Data"

    else:

        status = "Developing"
        outlook = "Very Limited Data"

    # =====================================================
    # MARKET RECOMMENDATION
    # =====================================================

    if total_properties >= 20:

        recommendation = (
            "The current property dataset provides "
            "reasonable coverage for identifying "
            "pricing patterns, listing concentration "
            "and property segment trends."
        )

    elif total_properties >= 10:

        recommendation = (
            "The dataset contains useful market signals, "
            "but additional real listings will improve "
            "the reliability of comparisons."
        )

    else:

        recommendation = (
            "The current dataset is limited. "
            "Add more real property listings before "
            "making strong market conclusions."
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return JsonResponse(
        {
            "success": True,

            "market": {

                "status":
                    status,

                "outlook":
                    outlook,

                "total_properties":
                    total_properties,

                "average_price":
                    round(
                        average_price,
                        2,
                    ),

                "average_area":
                    round(
                        average_area,
                        2,
                    ),

                "average_price_per_area":
                    round(
                        average_price_per_area,
                        2,
                    ),

                "average_bedrooms":
                    round(
                        average_bedrooms,
                        1,
                    ),

                "average_bathrooms":
                    round(
                        average_bathrooms,
                        1,
                    ),

                "market_growth":
                    round(
                        market_growth,
                        2,
                    ),
            },

            "price_trend":
                price_trend,

            "demand_by_area":
                demand_by_area,

            "property_segments":
                property_segments,

            "investment_opportunities":
                investment_opportunities,

            "recommendation":
                recommendation,
        }
    )


# =========================================================
# USER - REACT API
# =========================================================

def user_api(request):

    user = request.user

    # -----------------------------------------------------
    # NOT LOGGED IN
    # -----------------------------------------------------

    if not user.is_authenticated:

        return JsonResponse(
            {
                "success": True,

                "authenticated":
                    False,

                "user":
                    None,
            }
        )

    # -----------------------------------------------------
    # LOGGED IN
    # -----------------------------------------------------

    full_name = (
        user.get_full_name()
        or user.username
    )

    return JsonResponse(
        {
            "success": True,

            "authenticated":
                True,

            "user": {

                "id":
                    user.id,

                "username":
                    user.username,

                "email":
                    user.email,

                "first_name":
                    user.first_name,

                "last_name":
                    user.last_name,

                "full_name":
                    full_name,

                "is_staff":
                    user.is_staff,

                "is_superuser":
                    user.is_superuser,
            },
        }
    )


# =========================================================
# SETTINGS - REACT API
# =========================================================

def settings_api(request):

    # -----------------------------------------------------
    # DEFAULT APPLICATION SETTINGS
    # -----------------------------------------------------

    settings = {

        "theme":
            "light",

        "accent_color":
            "green",

        "currency":
            "PKR",

        "language":
            "en",

        "notifications":
            True,
    }

    return JsonResponse(
        {
            "success": True,

            "settings":
                settings,
        }
    )
# =========================================================
# GENERIC PROPERTY SCRAPER - REACT API
# =========================================================

@csrf_exempt
@require_POST
def scrape_property_api(request):

    try:
        data = json.loads(
            request.body.decode("utf-8")
        )

    except (
        json.JSONDecodeError,
        UnicodeDecodeError,
    ):

        return JsonResponse(
            {
                "success": False,
                "message": "Invalid JSON data.",
            },
            status=400,
        )

    url = str(
        data.get("url", "")
    ).strip()

    if not url:

        return JsonResponse(
            {
                "success": False,
                "message": "Property listing URL is required.",
            },
            status=400,
        )

    # -----------------------------------------------------
    # URL VALIDATION
    # -----------------------------------------------------

    if not url.startswith(
        ("http://", "https://")
    ):

        return JsonResponse(
            {
                "success": False,
                "message": "Please enter a valid property listing URL.",
            },
            status=400,
        )

    # -----------------------------------------------------
    # REQUEST WEBSITE
    # -----------------------------------------------------

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/139.0.0.0 Safari/537.36"
        ),

        "Accept": (
            "text/html,application/xhtml+xml,"
            "application/xml;q=0.9,image/avif,image/webp,"
            "*/*;q=0.8"
        ),

        "Accept-Language":
            "en-US,en;q=0.9",

        "Connection":
            "keep-alive",
    }

    try:

        response = requests.get(
            url,
            headers=headers,
            timeout=20,
            allow_redirects=True,
        )

        response.raise_for_status()

    except requests.exceptions.Timeout:

        return JsonResponse(
            {
                "success": False,
                "message": (
                    "The property website took too long to respond."
                ),
            },
            status=400,
        )

    except requests.exceptions.RequestException as e:

        return JsonResponse(
            {
                "success": False,
                "message": (
                    "Unable to access this property website. "
                    f"{str(e)}"
                ),
            },
            status=400,
        )

    # -----------------------------------------------------
    # PARSE HTML
    # -----------------------------------------------------

    soup = BeautifulSoup(
        response.text,
        "lxml",
    )

    # -----------------------------------------------------
    # HELPER FUNCTIONS
    # -----------------------------------------------------

    def clean_text(value):

        if value is None:
            return ""

        value = str(value)

        value = re.sub(
            r"\s+",
            " ",
            value,
        )

        return value.strip()

    def first_non_empty(*values):

        for value in values:

            value = clean_text(value)

            if value:
                return value

        return ""

    def parse_number(value):

        if value is None:
            return 0

        value = str(value)

        # Remove commas and currency symbols
        cleaned = re.sub(
            r"[^\d.]",
            "",
            value,
        )

        try:
            return float(cleaned)

        except (
            ValueError,
            TypeError,
        ):
            return 0

    def find_meta(*names):

        for name in names:

            tag = soup.find(
                "meta",
                attrs={
                    "name": name
                },
            )

            if not tag:

                tag = soup.find(
                    "meta",
                    attrs={
                        "property": name
                    },
                )

            if tag:

                content = tag.get(
                    "content",
                    "",
                )

                if content:
                    return clean_text(content)

        return ""

    # -----------------------------------------------------
    # JSON-LD EXTRACTION
    # -----------------------------------------------------

    json_ld_objects = []

    scripts = soup.find_all(
        "script",
        attrs={
            "type": "application/ld+json"
        },
    )

    for script in scripts:

        try:

            raw = script.string

            if not raw:
                continue

            parsed = json.loads(raw)

            if isinstance(parsed, list):

                json_ld_objects.extend(
                    parsed
                )

            elif isinstance(parsed, dict):

                json_ld_objects.append(
                    parsed
                )

        except Exception:
            continue

    # -----------------------------------------------------
    # FIND BEST JSON-LD PROPERTY OBJECT
    # -----------------------------------------------------

    property_data = {}

    def search_json_ld(objects):

        for obj in objects:

            if not isinstance(
                obj,
                dict,
            ):
                continue

            obj_type = obj.get(
                "@type",
                "",
            )

            if isinstance(
                obj_type,
                list,
            ):

                obj_type = " ".join(
                    str(x)
                    for x in obj_type
                )

            obj_type = str(
                obj_type
            ).lower()

            text_blob = json.dumps(
                obj
            ).lower()

            property_keywords = [
                "house",
                "apartment",
                "residence",
                "realestate",
                "singlefamily",
                "product",
                "offer",
                "place",
                "property",
            ]

            if (
                any(
                    keyword in obj_type
                    for keyword in property_keywords
                )
                or
                any(
                    keyword in text_blob
                    for keyword in [
                        "bedroom",
                        "bathroom",
                        "floor",
                        "sqft",
                        "square feet",
                    ]
                )
            ):

                return obj

        return {}

    property_data = search_json_ld(
        json_ld_objects
    )

    # -----------------------------------------------------
    # TITLE
    # -----------------------------------------------------

    title = first_non_empty(

        property_data.get(
            "name"
        ),

        find_meta(
            "og:title",
            "twitter:title",
        ),

        (
            soup.title.get_text(
                strip=True
            )
            if soup.title
            else ""
        ),
    )

    # Remove common website suffixes
    title = re.sub(
        r"\s*[-|]\s*(Zameen|Graana|Lamudi|Property.*)$",
        "",
        title,
        flags=re.IGNORECASE,
    ).strip()

    # -----------------------------------------------------
    # DESCRIPTION
    # -----------------------------------------------------

    description = first_non_empty(

        property_data.get(
            "description"
        ),

        find_meta(
            "description",
            "og:description",
            "twitter:description",
        ),
    )

    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    image = ""

    image_value = property_data.get(
        "image"
    )

    if isinstance(
        image_value,
        list,
    ):

        if image_value:
            image = image_value[0]

    elif isinstance(
        image_value,
        dict,
    ):

        image = image_value.get(
            "url",
            "",
        )

    elif image_value:

        image = str(
            image_value
        )

    if not image:

        image = find_meta(
            "og:image",
            "twitter:image",
        )

    if image:

        image = urljoin(
            response.url,
            image,
        )

    # -----------------------------------------------------
    # PRICE
    # -----------------------------------------------------

    price = 0

    offers = property_data.get(
        "offers"
    )

    if isinstance(
        offers,
        dict,
    ):

        price = parse_number(
            offers.get(
                "price"
            )
        )

    if not price:

        price = parse_number(
            find_meta(
                "price",
                "product:price:amount",
            )
        )

    if not price:

        page_text = clean_text(
            soup.get_text(
                " ",
                strip=True,
            )
        )

        price_patterns = [

            r"(?:PKR|Rs\.?|₨)\s*"
            r"([\d,]+(?:\.\d+)?)",

            r"([\d,]+(?:\.\d+)?)\s*"
            r"(?:PKR|Rs\.?|₨)",

        ]

        for pattern in price_patterns:

            match = re.search(
                pattern,
                page_text,
                re.IGNORECASE,
            )

            if match:

                price = parse_number(
                    match.group(1)
                )

                break

    # -----------------------------------------------------
    # AREA
    # -----------------------------------------------------

    area = 0

    floor_size = property_data.get(
        "floorSize"
    )

    if isinstance(
        floor_size,
        dict,
    ):

        area = parse_number(
            floor_size.get(
                "value"
            )
        )

    if not area:

        page_text = clean_text(
            soup.get_text(
                " ",
                strip=True,
            )
        )

        area_patterns = [

            r"([\d,]+(?:\.\d+)?)\s*"
            r"(?:sq\.?\s*ft|sqft|square feet)",

            r"([\d,]+(?:\.\d+)?)\s*"
            r"(?:sq\.?\s*yd|sqyd|square yards)",

            r"([\d,]+(?:\.\d+)?)\s*"
            r"(?:marla|kanal)",

        ]

        for pattern in area_patterns:

            match = re.search(
                pattern,
                page_text,
                re.IGNORECASE,
            )

            if match:

                area = parse_number(
                    match.group(1)
                )

                unit = match.group(
                    0
                ).lower()

                # Convert common units to square feet
                if "marla" in unit:

                    area *= 272.25

                elif (
                    "kanal" in unit
                ):

                    area *= 5445

                elif (
                    "sq. yd" in unit
                    or "sqyd" in unit
                    or "square yards" in unit
                ):

                    area *= 9

                break

    # -----------------------------------------------------
    # BEDROOMS
    # -----------------------------------------------------

    bedrooms = 0

    bedroom_value = property_data.get(
        "numberOfBedrooms"
    )

    if bedroom_value:

        bedrooms = int(
            parse_number(
                bedroom_value
            )
        )

    if not bedrooms:

        page_text = clean_text(
            soup.get_text(
                " ",
                strip=True,
            )
        )

        match = re.search(
            r"(\d+)\s*"
            r"(?:bed(?:room)?s?)",
            page_text,
            re.IGNORECASE,
        )

        if match:

            bedrooms = int(
                match.group(1)
            )

    # -----------------------------------------------------
    # BATHROOMS
    # -----------------------------------------------------

    bathrooms = 0

    bathroom_value = property_data.get(
        "numberOfBathroomsTotal"
    )

    if bathroom_value:

        bathrooms = int(
            parse_number(
                bathroom_value
            )
        )

    if not bathrooms:

        page_text = clean_text(
            soup.get_text(
                " ",
                strip=True,
            )
        )

        match = re.search(
            r"(\d+)\s*"
            r"(?:bath(?:room)?s?)",
            page_text,
            re.IGNORECASE,
        )

        if match:

            bathrooms = int(
                match.group(1)
            )

    # -----------------------------------------------------
    # ADDRESS / CITY
    # -----------------------------------------------------

    address = ""

    address_data = property_data.get(
        "address"
    )

    if isinstance(
        address_data,
        dict,
    ):

        address = first_non_empty(

            address_data.get(
                "streetAddress"
            ),

            address_data.get(
                "addressLocality"
            ),

            address_data.get(
                "addressRegion"
            ),
        )

    elif address_data:

        address = clean_text(
            address_data
        )

    if not address:

        address = first_non_empty(
            find_meta(
                "og:locality",
                "geo.placename",
            ),
        )

    # -----------------------------------------------------
    # CITY
    # -----------------------------------------------------

    city = ""

    if isinstance(
        address_data,
        dict,
    ):

        city = first_non_empty(

            address_data.get(
                "addressLocality"
            ),

            address_data.get(
                "addressRegion"
            ),
        )

    if not city:

        # Try common Pakistani cities
        page_text = clean_text(
            soup.get_text(
                " ",
                strip=True,
            )
        )

        common_cities = [
            "Islamabad",
            "Rawalpindi",
            "Lahore",
            "Karachi",
            "Faisalabad",
            "Multan",
            "Gujranwala",
            "Peshawar",
            "Quetta",
            "Sialkot",
            "Gujrat",
            "Bahawalpur",
            "Abbottabad",
            "Murree",
        ]

        for city_name in common_cities:

            if re.search(
                rf"\b{re.escape(city_name)}\b",
                page_text,
                re.IGNORECASE,
            ):

                city = city_name
                break

    if not city:

        city = address

    # -----------------------------------------------------
    # PROPERTY TYPE
    # -----------------------------------------------------

    property_type = "House"

    text_for_type = (
        f"{title} "
        f"{description}"
    ).lower()

    if "apartment" in text_for_type:

        property_type = "Apartment"

    elif (
        "flat" in text_for_type
    ):

        property_type = "Apartment"

    elif (
        "farm house" in text_for_type
        or "farmhouse" in text_for_type
    ):

        property_type = "Farm House"

    elif "shop" in text_for_type:

        property_type = "Shop"

    elif "office" in text_for_type:

        property_type = "Office"

    elif (
        "commercial" in text_for_type
    ):

        property_type = "Commercial"

    elif (
        "plot" in text_for_type
        or "land" in text_for_type
    ):

        property_type = "Plot"

    elif "house" in text_for_type:

        property_type = "House"

    # -----------------------------------------------------
    # PURPOSE
    # -----------------------------------------------------

    purpose = "Sale"

    purpose_text = (
        f"{title} "
        f"{description}"
    ).lower()

    if any(
        word in purpose_text
        for word in [
            "for rent",
            "rent",
            "rental",
            "monthly rent",
        ]
    ):

        purpose = "Rent"

    elif any(
        word in purpose_text
        for word in [
            "for sale",
            "sale",
            "sell",
        ]
    ):

        purpose = "Sale"

    # -----------------------------------------------------
    # FLOORS
    # -----------------------------------------------------

    floors = 0

    page_text = clean_text(
        soup.get_text(
            " ",
            strip=True,
        )
    )

    match = re.search(
        r"(\d+)\s*"
        r"(?:floor|floors|storey|stories)",
        page_text,
        re.IGNORECASE,
    )

    if match:

        floors = int(
            match.group(1)
        )

    # -----------------------------------------------------
    # PARKING
    # -----------------------------------------------------

    parking_spaces = 0

    match = re.search(
        r"(\d+)\s*"
        r"(?:car\s*)?"
        r"parking",
        page_text,
        re.IGNORECASE,
    )

    if match:

        parking_spaces = int(
            match.group(1)
        )

    # -----------------------------------------------------
    # FURNISHING
    # -----------------------------------------------------

    furnishing_status = ""

    if "fully furnished" in page_text.lower():

        furnishing_status = "Fully Furnished"

    elif "semi furnished" in page_text.lower():

        furnishing_status = "Semi Furnished"

    elif "unfurnished" in page_text.lower():

        furnishing_status = "Unfurnished"

    # -----------------------------------------------------
    # FALLBACK TITLE
    # -----------------------------------------------------

    if not title:

        parsed_url = urlparse(
            response.url
        )

        path_text = (
            parsed_url.path
            .replace("-", " ")
            .replace("_", " ")
            .strip("/")
        )

        title = clean_text(
            path_text
        )

    # -----------------------------------------------------
    # REQUIRED DATA CHECK
    # -----------------------------------------------------

    if not title:

        return JsonResponse(
            {
                "success": False,
                "message": (
                    "The website was accessed, "
                    "but no property title could be extracted."
                ),
            },
            status=400,
        )

    if not city:

        city = "Unknown"

    if not area:

        area = 0

    if not price:

        price = 0

    # -----------------------------------------------------
    # SAVE PROPERTY
    # -----------------------------------------------------

    try:

        property_obj, created = (
            Property.objects.update_or_create(
                source_url=url,
                defaults={
                    "title": title[:200],

                    "property_type":
                        property_type,

                    "purpose":
                        purpose,

                    "city":
                        city[:100],

                    "area":
                        area,

                    "price":
                        price,

                    "bedrooms":
                        bedrooms,

                    "bathrooms":
                        bathrooms,

                    "address":
                        address[:300],

                    "description":
                        description,

                    "floors":
                        floors,

                    "parking_spaces":
                        parking_spaces,

                    "furnishing_status":
                        furnishing_status[:30],
                },
            )
        )

    except Exception as e:

        return JsonResponse(
            {
                "success": False,
                "message": (
                    "Property data was extracted, "
                    "but could not be saved. "
                    f"{str(e)}"
                ),
            },
            status=400,
        )
        # -----------------------------------------------------
    # SAVE SCRAPED IMAGE
    # -----------------------------------------------------

    if image:
        try:
            image_response = requests.get(
                image,
                headers=headers,
                timeout=20,
            )

            image_response.raise_for_status()

            content_type = image_response.headers.get(
                "Content-Type",
                "",
            )

            if content_type.startswith("image/"):

                extension = os.path.splitext(
                    urlparse(image).path
                )[1].lower()

                if extension not in [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".webp",
                    ".gif",
                ]:
                    extension = ".jpg"

                filename = (
                    f"property_{property_obj.id}"
                    f"{extension}"
                )

                property_obj.image.save(
                    filename,
                    ContentFile(
                        image_response.content
                    ),
                    save=False,
                )

                property_obj.save()

        except Exception as e:
            print(
                "Property image download failed:",
                e,
            )

    
    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return JsonResponse(
        {
            "success": True,

            "message": (
                "Property scraped and saved successfully."
                if created
                else
                "Property information updated successfully."
            ),

            "property": {

                "id":
                    property_obj.id,

                "title":
                    property_obj.title,

                "property_type":
                    property_obj.property_type,

                "purpose":
                    property_obj.purpose,

                "city":
                    property_obj.city,

                "price":
                    float(
                        property_obj.price or 0
                    ),

                "area":
                    float(
                        property_obj.area or 0
                    ),

                "bedrooms":
                    property_obj.bedrooms,

                "bathrooms":
                    property_obj.bathrooms,

                "address":
                    property_obj.address,

                "description":
                    property_obj.description,

                "floors":
                    property_obj.floors,

                "parking_spaces":
                    property_obj.parking_spaces,

                "furnishing_status":
                    property_obj.furnishing_status,

                "image":
                    image,

                "source_url":
                    property_obj.source_url,
            },
        },

        status=200,
    )
    # -----------------------------------------------------
    # TEMPORARY SAFE RESPONSE
    # -----------------------------------------------------
    #
    # This endpoint now correctly receives the URL.
    #
    # The actual website scraping logic should be placed
    # here instead of pretending that title/city/price
    # were supplied by React.
    #
    # -----------------------------------------------------

    return JsonResponse(
        {
            "success": False,
            "message": (
                "Scraper endpoint is connected, "
                "but no scraping data was extracted from this URL."
            ),
        },
        status=400,
    )