from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.catalog_parser import parse_catalog
from app.services.rag_service import rag_service
from app.models.schemas import CatalogParseResult

router = APIRouter(prefix="/catalog")


@router.post("/parse", response_model=CatalogParseResult)
async def parse_and_index_catalog(
    file: UploadFile = File(...),
    merchant_id: str = Form(...),
):
    allowed = {
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    }
    if file.content_type not in allowed and not (
        file.filename or ""
    ).endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=415,
            detail="Only CSV and Excel files are supported",
        )

    file_bytes = await file.read()
    result = parse_catalog(file_bytes, file.filename or "upload.csv", merchant_id)

    if result.rows:
        products = [row.model_dump() for row in result.rows]
        indexed = await rag_service.index_products(merchant_id, products)
        return CatalogParseResult(
            **result.model_dump(),
            total=indexed,
        )

    return result
