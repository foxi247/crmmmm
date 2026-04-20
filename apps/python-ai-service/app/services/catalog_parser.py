import io
import pandas as pd
from app.models.schemas import CatalogParseResult, CatalogRow

COLUMN_ALIASES: dict[str, list[str]] = {
    "name": ["name", "product", "item", "product name", "назва", "товар"],
    "price": ["price", "cost", "ціна", "price (usd)", "вартість"],
    "category": ["category", "cat", "group", "категорія", "група"],
    "description": ["description", "desc", "опис", "details"],
    "stock": ["stock", "qty", "quantity", "available", "залишок", "кількість"],
    "unit": ["unit", "units", "од.", "одиниця"],
}


def _normalize_columns(df: pd.DataFrame) -> dict[str, str]:
    """Return mapping from canonical field → actual column name."""
    mapping: dict[str, str] = {}
    lower_cols = {c.lower().strip(): c for c in df.columns}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in lower_cols:
                mapping[canonical] = lower_cols[alias]
                break
    return mapping


def parse_catalog(file_bytes: bytes, filename: str, merchant_id: str) -> CatalogParseResult:
    errors: list[str] = []
    rows: list[CatalogRow] = []

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))
    except Exception as e:
        return CatalogParseResult(merchant_id=merchant_id, rows=[], total=0, errors=[str(e)])

    df.columns = [str(c).strip() for c in df.columns]
    col_map = _normalize_columns(df)

    if "name" not in col_map:
        return CatalogParseResult(
            merchant_id=merchant_id,
            rows=[],
            total=0,
            errors=["Could not find a 'name' column in the file"],
        )

    if "price" not in col_map:
        return CatalogParseResult(
            merchant_id=merchant_id,
            rows=[],
            total=0,
            errors=["Could not find a 'price' column in the file"],
        )

    for idx, row in df.iterrows():
        row_num = int(idx) + 2  # 1-based + header
        try:
            name = str(row[col_map["name"]]).strip()
            if not name or name == "nan":
                errors.append(f"Row {row_num}: empty name, skipped")
                continue

            raw_price = row[col_map["price"]]
            try:
                price = float(str(raw_price).replace(",", ".").strip())
            except ValueError:
                errors.append(f"Row {row_num}: invalid price '{raw_price}', skipped")
                continue

            category = None
            if "category" in col_map:
                cat = str(row[col_map["category"]]).strip()
                category = cat if cat != "nan" else None

            description = None
            if "description" in col_map:
                desc = str(row[col_map["description"]]).strip()
                description = desc if desc != "nan" else None

            stock = 0
            if "stock" in col_map:
                try:
                    stock = int(float(str(row[col_map["stock"]]).strip()))
                except ValueError:
                    stock = 0

            unit = None
            if "unit" in col_map:
                u = str(row[col_map["unit"]]).strip()
                unit = u if u != "nan" else None

            rows.append(
                CatalogRow(
                    name=name,
                    price=price,
                    category=category,
                    description=description,
                    stock=stock,
                    unit=unit,
                )
            )
        except Exception as e:
            errors.append(f"Row {row_num}: unexpected error — {e}")

    return CatalogParseResult(
        merchant_id=merchant_id,
        rows=rows,
        total=len(rows),
        errors=errors,
    )
