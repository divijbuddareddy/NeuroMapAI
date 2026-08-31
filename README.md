# NeuroMap AI — Explainable MRI Brain Connectivity & Abnormality Analysis Platform

[![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20Vite%20%2B%20React%20%2B%20Three.js-00f2fe.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-Research%20Prototype-purple.svg)](DATASET.md)
[![Gemini](https://img.shields.io/badge/Gemini%20API-Live%20Reasoning%20Engine-ff007a.svg)](https://aistudio.google.com/)
[![Alignment](https://img.shields.io/badge/Target%20Alignment-BrainSightAI%20Blueprint-10b981.svg)](#)

> **⚠️ RESEARCH PROTOTYPE DISCLAIMER**  
> *NeuroMap AI is an investigative research platform designed for computational neuroscience, machine learning benchmark evaluation, and hypothesis generation. It is NOT a clinical diagnostic device. Model outputs and feature attributions must not be interpreted as definitive clinical diagnoses or treatment recommendations.*

---

## 1. Executive Summary & Pitch

> *"I built an end-to-end neuroimaging ML research platform that converts MRI/dMRI data into quantitative brain features and connectivity maps, evaluates multiple ML approaches, explains model decisions, and visualizes findings in an interactive 3D brain with a Gemini reasoning layer."*

NeuroMap AI is an end-to-end neuroimaging machine learning platform built in alignment with **BrainSightAI**'s research blueprint. It bridges the gap between raw volumetric neuroimaging (T1w MRI, diffusion MRI / DTI), automated preprocessing & atlas morphometry, structural connectome graph theory, multi-model machine learning, and explainable AI (SHAP & Grad-CAM). 

A secondary **Google Gemini Reasoning Layer** converts complex high-dimensional biomarker findings into publication-grade structured research reports and interactive conversational insights.

---

## 2. End-to-End Architecture

```
                                  NEUROMAP AI PIPELINE
                                  
  [ MRI / dMRI Scan ] ──► [ Automated Quality Control ] ──► [ Skull-Stripping (BET) & Registration ]
         │                            │                                      │
         ▼                            ▼                                      ▼
  [ NIfTI / DICOM ]          [ SNR, CNR, Motion ]                 [ MNI152 Normalization ]
                                                                             │
                                                                             ▼
  ┌──────────────────────────────────────────────────────────────────────────┴──────────────────────────┐
  │                                                                                                     │
  ▼                                                                                                     ▼
[ Brain Morphometry (DK68 Atlas) ]                                                   [ Structural Connectome Graph ]
• 68 Cortical/Subcortical Volumes                                                    • N × N Correlation Matrix
• Cortical Thickness & Asymmetry                                                     • Global Efficiency (E_glob)
• Normative Z-Score Deviations                                                       • Modularity Index (Q) & Rich-Club
  │                                                                                                     │
  └───────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                             [ Machine Learning Model Suite ]
                             • XGBoost Baseline (Tabular + Graph)
                             • Random Forest & Logistic Regression
                             • 3D ResNet-50 Volumetric CNN
                             • Multimodal Fusion Ensemble
                                              │
                                              ▼
                             [ Explainable AI (XAI) Engine ]
                             • SHAP Regional Feature Waterfall
                             • 3D Grad-CAM Saliency Slice Maps
                             • Influential Pathway Attribution
                                              │
                         ┌────────────────────┴────────────────────┐
                         │                                         │
                         ▼                                         ▼
           [ Interactive 3D WebGL Brain ]            [ Gemini AI Reasoning Assistant ]
           • Three.js Anatomical Meshes              • Plain-Language Explainability
           • Glowing Fiber Tractography Arcs         • Structured Neuro Research Reports
           • Real-time Node HUD Inspection           • Multi-turn Interactive Inquiries
```

---

## 3. Key Feature Modules

### 🧠 1. Interactive 3D WebGL Connectome Viewer
- **Three.js Powered Mesh**: High-performance dual-hemisphere translucent holographic cortex with ambient synaptic particle field.
- **Desikan-Killiany Atlas Nodes**: Positioned at exact 3D MNI anatomical coordinates with real-time Raycasting HUD tooltips.
- **Dynamic Fiber Tractography**: Arched Bezier curves representing structural streamline density, colored by functional integrity (Cyan = Intact, Crimson = Hypoconnected).
- **Color Modalities**: Switch dynamically between *Atrophy Z-Scores*, *Anatomical Lobes*, and *Modularity Clusters*.

### 🔬 2. Orthogonal Multi-Slice MRI Viewer
- **3-Plane Synchronized Navigation**: Axial ($Z$), Coronal ($Y$), and Sagittal ($X$) planes.
- **Radiological Controls**: Window Level (Brightness) and Window Width (Contrast) adjustments.
- **3D Grad-CAM Overlays**: Saliency heatmaps highlighting 3D deep learning convolutional attention.
- **Atlas Mask Overlays**: Color-coded Desikan-Killiany lobe overlays directly on slice parenchyma.

### 📊 3. Quantitative Morphometry & Graph Theory
- **Desikan-Killiany 68 Table**: Filterable by lobe (Frontal, Temporal, Parietal, Occipital, Subcortical), volumetric $\text{mm}^3$, cortical thickness, bilateral asymmetry index, and normative Z-scores.
- **Connectome $N \times N$ Heatmap**: Adjacency correlation matrix with live cell inspection and edge thresholding.
- **Graph Theory Telemetry**: Global Efficiency ($E_{glob}$), Modularity Index ($Q$), Small-Worldness Index ($\sigma$), and Rich-Club Hubs.

### 🤖 4. ML Benchmark Lab & Explainable AI (XAI)
- **Multi-Model Suite**: Side-by-side evaluation of XGBoost, Random Forest, Logistic Regression, 3D ResNet-50 CNN, and Fusion Ensemble.
- **Leakage-Safe Metrics**: Stratified 5-fold subject-independent validation (ROC-AUC, Precision, Recall, Specificity, F1-Score, Confusion Matrices).
- **SHAP Attribution**: Regional waterfall plots ranking top positive/negative phenotypic drivers.

### ✨ 5. Live Google Gemini AI Reasoning
- **Direct User API Key Input**: Connect your personal Google Gemini API key (`gemini-2.5-flash`, `gemini-1.5-pro`) directly in the app.
- **Publication-Grade Reports**: One-click synthesis of structured neuro-reports with Markdown export and print capability.
- **Interactive Neuro Assistant**: Multi-turn conversational research chat answering queries about connectome biomarkers, hippocampal Z-scores, and differential findings.

---

## 4. Public Benchmark Cohorts

| Cohort ID | Diagnosis / Phenotype | Modality | Primary Findings | Ground Truth |
|---|---|---|---|---|
| **OASIS3_0012_AD** | Alzheimer Phenotype | T1w MRI (3.0T) | Bilateral Hippocampal Atrophy ($Z = -2.88$), DMN Hypoconnectivity | Alzheimer Disease (CDR 1.0) |
| **HCP_9921_HC** | Healthy Adult Control | dMRI / DTI (3.0T) | Intact Small-World Topology ($\sigma = 2.45$), Preserved Asymmetry | Healthy Control (CDR 0.0) |
| **SZ_0448_DYSCONN** | Frontotemporal Alteration | dMRI + rs-fMRI | Prefrontal-Thalamic Hypoconnectivity, STG Volume Deficit | Schizophrenia Dysconnectivity |

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (optional, for backend scripts)

### Installation & Launch

```bash
# 1. Clone the repository
git clone https://github.com/your-username/neuromap-ai.git
cd neuromap-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 6. One-Click Deployment Guide

### Deploy to Vercel
```bash
npm run build
npx vercel deploy --prod
```

### Deploy to Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Docker Deployment
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 7. Connecting Your Gemini API Key

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **"Set Gemini Key"** in the top navigation bar of NeuroMap AI.
3. Paste your key, select `Gemini 2.5 Flash` or `Gemini 1.5 Pro`, and click **"Save & Activate"**.
4. Generate publication reports and chat interactively with the AI!

---

## 8. Alignment with BrainSightAI Principles
- **End-to-End Automated Pipeline**: Raw scan ingestion $\to$ QC $\to$ BET skull-stripping $\to$ DK68 parcellation $\to$ Graph metrics $\to$ ML inference $\to$ XAI $\to$ 3D visualization $\to$ Gemini report.
- **Multimodal Relevance**: Seamless handling of T1-weighted structural MRI and diffusion MRI (dMRI/DTI).
- **Disciplined GenAI Integration**: Gemini is used exclusively as an analytical research-explanation layer on top of structured ML outputs, strictly upholding scientific boundaries.
- **Transparent Benchmarking**: Real metric reporting without fabricated benchmark numbers.
