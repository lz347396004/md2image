from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import markdown2
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/convert")
async def convert_markdown(file: UploadFile = File(...)):
    content = await file.read()
    markdown_text = content.decode()
    html = markdown2.markdown(markdown_text)
    
    # Convert HTML to image logic here
    # This is a placeholder for the actual image generation
    
    return {"html": html}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)