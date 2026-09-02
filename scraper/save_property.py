
import re
from decimal import Decimal

import requests
from django.core.files.base import ContentFile

from properties.models import Property

from .property_scraper import scrape_property


def parse_price(price_text):
    """
    Convert Pakistani property price text into a numeric Decimal.

    Examples:
        PKR 2.6 Crore -> 26000000
        PKR 85 Lakh   -> 8500000
    """

    if not price_text:
        return Decimal("0")

    text = price_text.lower().replace(",", "").strip()

    match = re.search(r"([\d.]+)\s*(crore|lakh)", text)

    if not match:
        return Decimal("0")

    value = Decimal(match.group(1))
    unit = match.group(2)

    if unit == "crore":
        return value * Decimal("10000000")

    if unit == "lakh":
        return value * Decimal("100000")

    return Decimal("0")


def parse_area(area_text):
    """
    Convert property area into square feet.

    1 Marla = 272.25 sq ft
    1 Kanal = 20 Marla
    """

    if not area_text:
        return Decimal("0")

    text = area_text.lower().replace(",", "").strip()

    match = re.search(r"([\d.]+)\s*(marla|kanal|sq\.?\s*ft|square feet)", text)

    if not match:
        return Decimal("0")

    value = Decimal(match.group(1))
    unit = match.group(2)

    if "marla" in unit:
        return value * Decimal("272.25")

    if "kanal" in unit:
        return value * Decimal("5445")

    if "sq" in unit or "square" in unit:
        return value

    return Decimal("0")


def download_image(image_url):
    """
    Download property image and return Django ContentFile.
    """

    if not image_url:
        return None

    try:
        response = requests.get(
            image_url,
            timeout=30,
            headers={
                "User-Agent": "Mozilla/5.0",
            },
        )

        response.raise_for_status()

        filename = image_url.split("/")[-1].split("?")[0]

        if not filename:
            filename = "property.jpg"

        return filename, ContentFile(response.content)

    except requests.RequestException:
        return None


def save_scraped_property(url):
    """
    Scrape a property URL and save it into the Django database.
    """

    data = scrape_property(url)

    price = parse_price(
        data.get("price_text", "")
    )

    area = parse_area(
        data.get("area_text", "")
    )

    property_obj = Property.objects.filter(
        source_url=url
    ).first()

    if property_obj:
        created = False
    else:
        property_obj = Property()
        created = True

    property_obj.title = data.get(
        "title",
        "Untitled Property",
    )

    property_obj.property_type = data.get(
        "property_type",
        "House",
    )

    property_obj.purpose = data.get(
        "purpose",
        "Sale",
    )

    property_obj.city = data.get(
        "city",
        "",
    )

    property_obj.area = area

    property_obj.price = price

    property_obj.bedrooms = data.get(
        "bedrooms",
        0,
    )

    property_obj.bathrooms = data.get(
        "bathrooms",
        0,
    )

    property_obj.address = data.get(
        "address",
        "",
    )

    property_obj.description = data.get(
        "description",
        "",
    )

    property_obj.source_url = url

    property_obj.save()

    # =====================================================
    # IMAGE
    # =====================================================

    image_url = data.get(
        "image_url",
        "",
    )

    if image_url and not property_obj.image:

        image_data = download_image(
            image_url
        )

        if image_data:

            filename, image_file = image_data

            property_obj.image.save(
                filename,
                image_file,
                save=True,
            )

    print()
    print("========================================")
    print("PROPERTY SAVED SUCCESSFULLY")
    print("========================================")
    print(f"Created : {created}")
    print(f"ID      : {property_obj.id}")
    print(f"Title   : {property_obj.title}")
    print(f"Type    : {property_obj.property_type}")
    print(f"Purpose : {property_obj.purpose}")
    print(f"City    : {property_obj.city}")
    print(f"Area    : {property_obj.area} sq ft")
    print(f"Price   : {property_obj.price}")
    print(f"Beds    : {property_obj.bedrooms}")
    print(f"Baths   : {property_obj.bathrooms}")
    print(f"Image   : {bool(property_obj.image)}")
    print("========================================")

    return property_obj