import io
import pytest
import pandas as pd
from app.services.catalog_parser import parse_catalog


def make_csv(data: list[dict]) -> bytes:
    df = pd.DataFrame(data)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    return buf.getvalue()


def test_parse_valid_csv():
    data = [
        {"name": "Pizza Margherita", "price": 9.99, "category": "Pizza", "stock": 10},
        {"name": "Cola 0.5L", "price": 2.50, "category": "Drinks", "stock": 50},
    ]
    result = parse_catalog(make_csv(data), "menu.csv", "merchant-1")
    assert result.total == 2
    assert result.rows[0].name == "Pizza Margherita"
    assert result.rows[0].price == 9.99
    assert result.rows[0].category == "Pizza"
    assert not result.errors


def test_parse_missing_name_column():
    data = [{"product_xyz": "Test", "price": 5.0}]
    result = parse_catalog(make_csv(data), "menu.csv", "merchant-1")
    assert result.total == 0
    assert any("name" in e.lower() for e in result.errors)


def test_parse_invalid_price():
    data = [
        {"name": "Good Item", "price": 5.0},
        {"name": "Bad Item", "price": "not-a-price"},
    ]
    result = parse_catalog(make_csv(data), "menu.csv", "merchant-1")
    assert result.total == 1
    assert len(result.errors) == 1
