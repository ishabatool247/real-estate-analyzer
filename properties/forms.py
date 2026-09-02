from django import forms

from .models import Property


class PropertyForm(forms.ModelForm):

    class Meta:
        model = Property

        fields = [
            "title",
            "property_type",
            "purpose",
            "city",
            "area",
            "price",
            "bedrooms",
            "bathrooms",
            "address",
            "description",
            "image",
        ]

        widgets = {
            "title": forms.TextInput(
                attrs={
                    "placeholder": "Property title",
                    "class": "form-control",
                }
            ),

            "property_type": forms.Select(
                attrs={
                    "class": "form-control",
                }
            ),

            "purpose": forms.Select(
                attrs={
                    "class": "form-control",
                }
            ),

            "city": forms.TextInput(
                attrs={
                    "placeholder": "City",
                    "class": "form-control",
                }
            ),

            "area": forms.NumberInput(
                attrs={
                    "placeholder": "Area in square feet",
                    "step": "0.01",
                    "min": "0",
                    "class": "form-control",
                }
            ),

            "price": forms.NumberInput(
                attrs={
                    "placeholder": "Price",
                    "step": "0.01",
                    "min": "0",
                    "class": "form-control",
                }
            ),

            "bedrooms": forms.NumberInput(
                attrs={
                    "placeholder": "Number of bedrooms",
                    "min": "0",
                    "class": "form-control",
                }
            ),

            "bathrooms": forms.NumberInput(
                attrs={
                    "placeholder": "Number of bathrooms",
                    "min": "0",
                    "class": "form-control",
                }
            ),

            "address": forms.TextInput(
                attrs={
                    "placeholder": "Full address",
                    "class": "form-control",
                }
            ),

            "description": forms.Textarea(
                attrs={
                    "placeholder": "Property description",
                    "rows": 5,
                    "class": "form-control",
                }
            ),

            "image": forms.ClearableFileInput(
                attrs={
                    "accept": "image/*",
                    "class": "form-control",
                }
            ),
        }

    def clean_area(self):
        area = self.cleaned_data.get("area")

        if area is not None and area <= 0:
            raise forms.ValidationError(
                "Property area must be greater than 0."
            )

        return area

    def clean_price(self):
        price = self.cleaned_data.get("price")

        if price is not None and price <= 0:
            raise forms.ValidationError(
                "Property price must be greater than 0."
            )

        return price