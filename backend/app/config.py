from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BACKEND_DIR / "models"

MODELS_PATH = {
    "potato": MODELS_DIR / "potato_disease_cnn.keras",
    "bell-pepper": MODELS_DIR / "bell_pepper_disease_cnn.keras",
}

CLASS_NAMES = {
    "potato": ["Early Blight", "Late Blight", "Healthy"],
    "bell-pepper": ["Bacterial Spot", "Healthy"],
}
