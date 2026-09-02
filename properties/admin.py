from django.contrib import admin

from .models import AgentInquiry, Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "property_type",
        "purpose",
        "city",
        "price",
        "area",
        "bedrooms",
        "bathrooms",
        "created_at",
    )

    list_filter = (
        "property_type",
        "purpose",
        "city",
    )

    search_fields = (
        "title",
        "city",
        "address",
    )


@admin.register(AgentInquiry)
class AgentInquiryAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "email",
        "phone",
        "property",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "name",
        "email",
        "phone",
        "property__title",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "-created_at",
    )