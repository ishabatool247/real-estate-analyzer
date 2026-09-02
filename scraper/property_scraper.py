
import re

from playwright.sync_api import sync_playwright


# =========================================================
# HELPERS
# =========================================================

def clean_text(value):
    if not value:
        return ""

    return " ".join(value.split())


def scrape_property(url):

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True
        )

        page = browser.new_page(
            viewport={
                "width": 1440,
                "height": 900,
            },
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
        )

        try:

            # =================================================
            # OPEN PAGE
            # =================================================

            page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=60000,
            )

            page.wait_for_timeout(5000)

            # =================================================
            # PAGE TEXT
            # =================================================

            body_text = page.locator("body").inner_text()

            body_lines = [
                clean_text(line)
                for line in body_text.splitlines()
                if clean_text(line)
            ]

            body_lower = body_text.lower()

            # =================================================
            # TITLE
            # =================================================

            title = ""

            try:
                title = clean_text(
                    page.locator("h1").first.inner_text()
                )
            except Exception:
                pass

            if not title:
                title = clean_text(page.title())

            # =================================================
            # PRICE
            # =================================================

            price_text = ""

            for index, line in enumerate(body_lines):

                if "PKR" not in line.upper():
                    continue

                line_lower = line.lower()

                if (
                    "crore" in line_lower
                    or "lakh" in line_lower
                ):
                    price_text = line
                    break

                if index + 1 < len(body_lines):

                    next_line = body_lines[index + 1]

                    next_lower = next_line.lower()

                    if (
                        "crore" in next_lower
                        or "lakh" in next_lower
                    ):
                        price_text = (
                            f"{line} {next_line}"
                        )
                        break

            # =================================================
            # BEDROOMS
            # =================================================

            bedrooms = 0

            bedroom_patterns = [
                r"(\d+)\s*beds?",
                r"(\d+)\s*bedrooms?",
            ]

            for pattern in bedroom_patterns:

                match = re.search(
                    pattern,
                    body_text,
                    re.IGNORECASE,
                )

                if match:

                    bedrooms = int(
                        match.group(1)
                    )

                    break

            # =================================================
            # BATHROOMS
            # =================================================

            bathrooms = 0

            bathroom_patterns = [
                r"(\d+)\s*baths?",
                r"(\d+)\s*bathrooms?",
            ]

            for pattern in bathroom_patterns:

                match = re.search(
                    pattern,
                    body_text,
                    re.IGNORECASE,
                )

                if match:

                    bathrooms = int(
                        match.group(1)
                    )

                    break

            # =================================================
            # AREA
            # =================================================

            area_text = ""

            area_patterns = [
                r"\d+(?:\.\d+)?\s*Marla",
                r"\d+(?:\.\d+)?\s*Kanal",
                r"\d+(?:,\d+)?(?:\.\d+)?\s*Sq\.?\s*Ft",
                r"\d+(?:,\d+)?(?:\.\d+)?\s*Square Feet",
            ]

            for pattern in area_patterns:

                match = re.search(
                    pattern,
                    body_text,
                    re.IGNORECASE,
                )

                if match:

                    area_text = clean_text(
                        match.group(0)
                    )

                    break

            # =================================================
            # CITY
            # =================================================

            city = ""

            cities = [
                "Islamabad",
                "Lahore",
                "Karachi",
                "Rawalpindi",
                "Faisalabad",
                "Multan",
                "Peshawar",
                "Gujranwala",
                "Sialkot",
                "Quetta",
            ]

            for city_name in cities:

                if city_name.lower() in body_lower:

                    city = city_name

                    break

            # =================================================
            # PROPERTY TYPE
            # IMPORTANT:
            # TITLE HAS PRIORITY
            # =================================================

            property_type = "House"

            title_lower = title.lower()

            if "farm house" in title_lower:

                property_type = "Farm House"

            elif "apartment" in title_lower:

                property_type = "Apartment"

            elif "flat" in title_lower:

                property_type = "Apartment"

            elif "plot" in title_lower:

                property_type = "Plot"

            elif "shop" in title_lower:

                property_type = "Shop"

            elif "office" in title_lower:

                property_type = "Office"

            elif "commercial" in title_lower:

                property_type = "Commercial"

            elif "house" in title_lower:

                property_type = "House"

            # =================================================
            # PURPOSE
            # =================================================

            if re.search(
                r"\bfor\s+rent\b|\brent\b",
                title_lower,
                re.IGNORECASE,
            ):

                purpose = "Rent"

            else:

                purpose = "Sale"

            # =================================================
            # ADDRESS
            # =================================================

            address = ""

            bad_address_terms = [
                "always meet",
                "safe, public location",
                "preferably during daylight",
                "commercial plazas",
                "outside bank branches",
                "real estate agency",
                "property blocks",
                "zameen",
                "property id",
                "property details",
            ]

            address_candidates = []

            location_terms = [
                "mpchs",
                "block",
                "sector",
                "dha",
                "bahria",
                "gulberg",
                "park view",
                "model town",
                "multi gardens",
                "phase",
            ]

            for line in body_lines:

                lower = line.lower()

                # Ignore unwanted text

                if any(
                    term in lower
                    for term in bad_address_terms
                ):
                    continue

                # Look for useful location information

                if any(
                    term in lower
                    for term in location_terms
                ):

                    if 5 <= len(line) <= 250:

                        address_candidates.append(
                            line
                        )

            # Prefer first useful candidate

            if address_candidates:

                address = address_candidates[0]

            # =================================================
            # DESCRIPTION
            # =================================================

            description = ""

            try:

                headings = page.locator("h2")

                for i in range(
                    headings.count()
                ):

                    heading = clean_text(
                        headings.nth(i).inner_text()
                    )

                    if (
                        heading.lower().strip()
                        == "description"
                    ):

                        parent = headings.nth(i).locator(
                            ".."
                        )

                        text = clean_text(
                            parent.inner_text()
                        )

                        # Remove heading

                        text = re.sub(
                            r"^description\s*",
                            "",
                            text,
                            flags=re.IGNORECASE,
                        )

                        # Remove Zameen navigation text

                        text = re.sub(
                            r"ZameenIslamabad.*?54666070",
                            "",
                            text,
                            flags=re.IGNORECASE,
                        )

                        text = clean_text(text)

                        if (
                            text
                            and len(text) > 20
                        ):

                            description = text

                        break

            except Exception:

                description = ""

            # =================================================
            # DESCRIPTION FALLBACK
            # =================================================

            if not description:

                description = title

                if (
                    bedrooms > 0
                    and bathrooms > 0
                ):

                    description = (
                        f"{title}. "
                        f"{bedrooms} bedrooms and "
                        f"{bathrooms} bathrooms."
                    )

                if area_text:

                    description += (
                        f" Area: {area_text}."
                    )

                if city:

                    description += (
                        f" Location: {city}."
                    )

            # =================================================
            # IMAGE
            # =================================================

            image_url = ""

            try:

                images = page.locator("img")

                for i in range(
                    min(images.count(), 100)
                ):

                    image = images.nth(i)

                    src = image.get_attribute(
                        "src"
                    )

                    if not src:

                        src = image.get_attribute(
                            "data-src"
                        )

                    if not src:

                        src = image.get_attribute(
                            "data-lazy-src"
                        )

                    if (
                        src
                        and "media.zameen.com"
                        in src
                    ):

                        image_url = src

                        break

            except Exception:

                image_url = ""

            # =================================================
            # RESULT
            # =================================================

            return {

                "source_url": url,

                "title": title,

                "property_type": property_type,

                "purpose": purpose,

                "city": city,

                "area_text": area_text,

                "price_text": price_text,

                "bedrooms": bedrooms,

                "bathrooms": bathrooms,

                "address": address,

                "description": description,

                "image_url": image_url,
            }

        finally:

            browser.close()

