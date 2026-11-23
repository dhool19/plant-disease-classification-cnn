from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from io import BytesIO
from PIL import Image
import uvicorn

from .config import MODELS_PATH, CLASS_NAMES

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading models....")
MODELS = {
    plant_name: tf.keras.models.load_model(path, compile=False)
    for plant_name, path in MODELS_PATH.items()
}
print("Models loaded successfully!")


@app.get("/ping")
async def ping():
    return "Hello, I am alive!"


def read_file_as_image(data):
    image = np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(file: UploadFile = File(...), plant: str = "potato"):
    if plant not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Model for {plant} not found. Choose from {list(MODELS.keys())}",
        )

    model = MODELS[plant]

    image = read_file_as_image(await file.read())

    batch = np.expand_dims(image, axis=0)
    predictions = model.predict(batch)
    predicted_class_index = int(np.argmax(predictions[0]))
    predicted_class_name = CLASS_NAMES[plant][predicted_class_index]
    confidence = float(np.max(predictions[0]))

    return {
        "plant": plant,
        "disease": predicted_class_name,
        "confidence": round(confidence * 100, 2),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
