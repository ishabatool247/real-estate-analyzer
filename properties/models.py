from decimal import Decimal

from django.db import models


class Property(models.Model):

    PROPERTY_TYPE_CHOICES = [
        ("House", "House"),
        ("Apartment", "Apartment"),
        ("Plot", "Plot"),
        ("Commercial", "Commercial"),
        ("Farm House", "Farm House"),
        ("Shop", "Shop"),
        ("Office", "Office"),
    ]

    PURPOSE_CHOICES = [
        ("Sale", "For Sale"),
        ("Rent", "For Rent"),
    ]

    title = models.CharField(max_length=200)

    property_type = models.CharField(
        max_length=30,
        choices=PROPERTY_TYPE_CHOICES,
        default="House",
    )

    purpose = models.CharField(
        max_length=10,
        choices=PURPOSE_CHOICES,
        default="Sale",
    )

    city = models.CharField(max_length=100)

    area = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Property area in square feet.",
    )

    price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
    )

    bedrooms = models.PositiveIntegerField(default=0)

    bathrooms = models.PositiveIntegerField(default=0)

    address = models.CharField(
        max_length=300,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    image = models.ImageField(
        upload_to="properties/",
        blank=True,
        null=True,
    )

    # Original listing URL
    source_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
        unique=True,
    )

    # Extra information useful for real listings
    floors = models.PositiveIntegerField(
        default=0,
        blank=True,
    )

    parking_spaces = models.PositiveIntegerField(
        default=0,
        blank=True,
    )

    furnishing_status = models.CharField(
        max_length=30,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def price_per_sqft(self):
        if self.area and self.area > 0:
            return self.price / self.area

        return Decimal("0")

    @property
    def annual_rent_estimate(self):
        if self.purpose == "Rent":
            return self.price * Decimal("12")

        return Decimal("0")

    @property
    def rental_yield(self):
        if (
            self.purpose == "Rent"
            and self.price
            and self.price > 0
            and self.annual_rent_estimate
        ):
            return (
                self.annual_rent_estimate / self.price
            ) * Decimal("100")

        return Decimal("0")


class AgentInquiry(models.Model):

    STATUS_CHOICES = [
        ("New", "New"),
        ("Contacted", "Contacted"),
        ("Closed", "Closed"),
    ]

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="agent_inquiries",
    )

    name = models.CharField(max_length=100)

    email = models.EmailField()

    phone = models.CharField(max_length=30)

    message = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="New",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.property.title}"