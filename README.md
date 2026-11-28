# Plant Disease Classification with CNNs

A full-stack computer vision project that classifies potato and bell pepper leaf images using CNNs. The repository includes training notebooks, saved TensorFlow/Keras models, a FastAPI prediction API, and a React frontend.

## Supported Crops

| Crop | Model classes |
| --- | --- |
| Potato | Early Blight, Late Blight, Healthy |
| Bell pepper | Bacterial Spot, Healthy |

Potato early blight and late blight can reduce crop yield. Early blight is caused by fungi such as Alternaria solani, while late blight is caused by Phytophthora infestans, an oomycete. Because the diseases require different management approaches, identifying which symptoms are present early can help guide further assessment.

Similarly, Bacterial spot is a disease of bell pepper that can also reduce crop yield. It is caused by bacteria in the genus Xanthomonas and often appears as small, angular spots on the leaves. Severe infections can cause leaves to drop, exposing fruit to sunburn. Recognizing these symptoms early can help guide further assessment and disease management.


## Dataset and Data Split

The potato and bell-pepper training workflow uses the [PlantVillage dataset on Kaggle](https://www.kaggle.com/datasets/arjuntejaswi/plant-village4).

| Split | Share | Purpose |
| --- | ---: | --- |
| Training | 80% | Fit the CNN |
| Validation | 10% | Monitor training and guide model selection |
| Test | 10% | Evaluate the selected model on held-out images |

To retrain a model, download the dataset, open the notebook for the crop you want to train, and update its dataset path before running the cells.

## Architecture

1. **Data preparation** builds a `tf.data` pipeline for loading and batching labeled leaf images. Data augmentation introduces variation during training.
2. **Model training** fits a separate CNN to the classes for each crop.
3. **Model export** saves the trained models in `.keras` format.
4. **Inference** loads the saved models in FastAPI. The API selects the model for the requested crop and returns the predicted class and confidence score.
5. **Web interface** lets users select a crop, upload a leaf image, and view the prediction.


## Installation and Local Setup

### 1. Clone the repository

Install Git, Python, and Node.js with npm. Use a Python version compatible with the TensorFlow dependency in `backend/requirements.txt`.

```bash
git clone https://github.com/dhool19/plant-disease-classification-cnn.git
cd plant-disease-classification-cnn
```

### 2. Start the backend

In the first terminal, from the repository root, create and activate a virtual environment.

**Windows PowerShell**

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS or Linux**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Then install the dependencies and start the API:

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API loads `potato_disease_cnn.keras` and `bell_pepper_disease_cnn.keras` from `backend/models/` on startup. If startup reports a missing model file, check that both files are present in that directory.

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to view the API documentation. Use `GET /ping` to confirm that the backend is running.

### 3. Start the frontend

Keep the backend running. Open a second terminal from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite, usually [http://localhost:5173](http://localhost:5173). Select **Potato** or **Bell Pepper**, upload a leaf image, and submit it for prediction.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
