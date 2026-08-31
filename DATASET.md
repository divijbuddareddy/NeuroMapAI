# NeuroMap AI — Dataset Strategy & Provenance

NeuroMap AI relies on established, peer-reviewed public neuroimaging cohorts with open research licenses and documented ethical compliance.

---

## 1. Curated Benchmark Cohorts

### A. OASIS-3: Longitudinal Neuroimaging in Normal Aging & Dementia
- **Source**: Washington University Knight ADRC / Open Access Series of Imaging Studies (OASIS)
- **Subjects**: 1,098 participants (Ages 42–95)
- **Modalities**: T1-weighted Structural MRI (MPRAGE), T2-FLAIR, PET (PIB, AV45)
- **Phenotypes**: Cognitively Normal (CN), Mild Cognitive Impairment (MCI), Alzheimer’s Disease (AD)
- **Citation**: LaMontagne, P. J., et al. (2019). *OASIS-3: Longitudinal Multimodal Neuroimaging: Normal Aging & Alzheimer's Disease*.

### B. ADNI-3: Alzheimer’s Disease Neuroimaging Initiative
- **Source**: Alzheimer’s Disease Neuroimaging Initiative (ADNI)
- **Modalities**: 3.0T Structural MRI, High-Angular Resolution Diffusion Imaging (HARDI)
- **Processing**: Cortical thickness, hippocampal subfields, DTI fractional anisotropy (FA)
- **Citation**: Mueller, S. G., et al. (2005). *The Alzheimer's Disease Neuroimaging Initiative*. Neuroimaging Clinics of North America.

### C. Human Connectome Project (HCP Young Adult)
- **Source**: Washington University–Minnesota Consortium (HCP)
- **Subjects**: 1,200 healthy adult subjects (Ages 22–35)
- **Modalities**: High-resolution 0.7mm isotropic T1w/T2w, 1.25mm Multishell Diffusion MRI (dMRI), resting-state fMRI
- **Usage**: Used as the pristine structural connectivity and small-world topology baseline ($E_{glob} \approx 0.62$, $Q \approx 0.58$).

### D. UK Biobank Neuroimaging Cohort
- **Source**: UK Biobank Resource
- **Usage**: Connectome network-level disruption and psychiatric spectrum dysconnectivity phenotyping.

---

## 2. Preprocessing & Quality Control Standardization
1. **DICOM to NIfTI Conversion**: `dcm2niix` with BIDS compliance.
2. **Reorientation**: Standard MNI152 orientation (`RAS+`).
3. **Intensity Normalization**: N4 bias field correction and white-stripe intensity scaling.
4. **Brain Extraction (BET)**: Deep-learning skull-stripping (HD-BET / SynthStrip) with visual QC mask inspection.
5. **Parcellation Atlas**: Desikan-Killiany 68-region cortical atlas + ASEG subcortical segmentation.
