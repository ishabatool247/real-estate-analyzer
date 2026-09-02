import sqlite3
from datetime import datetime


DATABASE_NAME = "real_estate.db"



# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():
    return sqlite3.connect(DATABASE_NAME)


# =========================================================
# CREATE DATABASE
# =========================================================

def create_database():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS properties (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT NOT NULL,

            title TEXT,
            location TEXT,
            property_type TEXT,

            price REAL,
            sqft REAL,
            bedrooms INTEGER,
            bathrooms INTEGER,

            monthly_rent REAL,
            annual_rent REAL,

            price_per_sqft REAL,
            rental_yield REAL,

            annual_expenses REAL,
            net_annual_rent REAL,
            net_rental_yield REAL,

            gross_roi REAL,
            investment_score REAL,

            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()


# =========================================================
# SAVE PROPERTY
# =========================================================

def save_property(username, property_data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO properties (
            username,
            title,
            location,
            property_type,
            price,
            sqft,
            bedrooms,
            bathrooms,
            monthly_rent,
            annual_rent,
            price_per_sqft,
            rental_yield,
            annual_expenses,
            net_annual_rent,
            net_rental_yield,
            gross_roi,
            investment_score,
            created_at
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        username,

        property_data.get("Title"),
        property_data.get("Location"),
        property_data.get("Type"),

        property_data.get("Price"),
        property_data.get("Sqft"),
        property_data.get("Bedrooms"),
        property_data.get("Bathrooms"),

        property_data.get("Monthly Rent"),
        property_data.get("Annual Rent"),

        property_data.get("Price/Sqft"),
        property_data.get("Rental Yield"),

        property_data.get("Annual Expenses"),
        property_data.get("Net Annual Rent"),
        property_data.get("Net Rental Yield"),

        property_data.get("Gross ROI"),
        property_data.get("Investment Score"),

        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()


# =========================================================
# GET SAVED PROPERTIES
# =========================================================

def get_properties(username):

    conn = get_connection()

    query = """
        SELECT *
        FROM properties
        WHERE username = ?
        ORDER BY id DESC
    """

    properties = conn.execute(
        query,
        (username,)
    ).fetchall()

    conn.close()

    return properties


# =========================================================
# DELETE PROPERTY
# =========================================================

def delete_property(property_id, username):

    conn = get_connection()

    conn.execute("""
        DELETE FROM properties
        WHERE id = ?
        AND username = ?
    """, (
        property_id,
        username
    ))

    conn.commit()
    conn.close()


# =========================================================
# DELETE ALL USER PROPERTIES
# =========================================================

def delete_all_properties(username):

    conn = get_connection()

    conn.execute("""
        DELETE FROM properties
        WHERE username = ?
    """, (username,))

    conn.commit()
    conn.close()