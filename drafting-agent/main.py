"""
IRONWORKS ado 図面エージェント API
JIS準拠の手すり図面PDFを生成するFastAPIサーバー
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from drawing.generator import generate_drawing_pdf
import base64

app = FastAPI(
    title="IRONWORKS ado Drafting Agent",
    description="JIS準拠の手すり図面PDFを生成するAPI",
    version="0.1.0",
)


class DrawingSpec(BaseModel):
    """図面生成リクエストのスキーマ"""
    drawing_title: str = "手すり図面"
    product: str = "antoine"
    material: str = "SS400 丸鋼"
    finish: str = "黒皮鉄仕上げ"
    scale: str = "1:10"
    dimensions: dict = {
        "length": 2000,
        "pipe_diameter": 25.4,
        "height": 800,
        "bracket_count": 2,
        "bracket_type": "A",
    }
    notes: list[str] = []


class DrawingResponse(BaseModel):
    pdf_base64: str
    message: str
    filename: str


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "drafting-agent"}


@app.post("/api/drafting2d", response_model=DrawingResponse)
def create_drawing(spec: DrawingSpec):
    """図面PDFを生成してbase64で返す"""
    try:
        drawing_spec = spec.model_dump()
        pdf_bytes = generate_drawing_pdf(drawing_spec)

        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

        # ファイル名生成
        product = spec.product
        length = spec.dimensions.get("length", "")
        filename = f"{product}_{length}mm_drawing.pdf"

        return DrawingResponse(
            pdf_base64=pdf_base64,
            message=f"PDF図面を生成しました: {spec.drawing_title}",
            filename=filename,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/drafting2d/download")
def create_drawing_download(spec: DrawingSpec):
    """図面PDFを直接ダウンロードレスポンスで返す"""
    try:
        drawing_spec = spec.model_dump()
        pdf_bytes = generate_drawing_pdf(drawing_spec)

        product = spec.product
        length = spec.dimensions.get("length", "")
        filename = f"{product}_{length}mm_drawing.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
