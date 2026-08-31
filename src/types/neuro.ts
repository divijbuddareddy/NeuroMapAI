export type NeuroModality = 'T1w MRI' | 'dMRI (DTI)' | 'T2-FLAIR' | 'rs-fMRI';

export interface SubjectMetadata {
  subjectId: string;
  cohort: 'OASIS-3' | 'ADNI-3' | 'HCP (Human Connectome)' | 'UK Biobank' | 'Custom Upload';
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  modality: NeuroModality;
  scanner: string;
  fieldStrength: '1.5T' | '3.0T' | '7.0T';
  dimensions: [number, number, number];
  voxelSpacing: [number, number, number];
  orientation: string;
  acquisitionDate: string;
}

export interface QualityControlMetrics {
  snr: number; // Signal-to-Noise Ratio (dB)
  cnr: number; // Contrast-to-Noise Ratio (dB)
  motionScore: number; // 0 (no motion) to 1.0 (severe motion artifact)
  entropy: number;
  skullStrippingScore: number; // 0 to 100%
  intensityMean: number;
  intensityStd: number;
  qcStatus: 'PASS' | 'WARNING' | 'FAIL';
  warnings: string[];
  recommendations: string[];
}

export type BrainLobe = 'Frontal' | 'Temporal' | 'Parietal' | 'Occipital' | 'Subcortical' | 'Limbic' | 'Cerebellar' | 'Brainstem';

export interface BrainRegion {
  id: string;
  name: string;
  code: string;
  lobe: BrainLobe;
  hemisphere: 'Left' | 'Right' | 'Bilateral';
  volume_mm3: number;
  reference_volume_range: [number, number]; // [min_normal, max_normal]
  cortical_thickness_mm: number;
  intensity_mean: number;
  intensity_std: number;
  asymmetry_index: number; // -1.0 (Left dominant) to +1.0 (Right dominant)
  // 3D MNI Coordinates for Three.js rendering
  coords3d: [number, number, number];
  zScore: number; // standard deviations from normative cohort
  status: 'Normal' | 'Hypertrophy' | 'Atrophy' | 'Hypointensity';
}

export interface ConnectomeNode {
  id: string;
  name: string;
  lobe: BrainLobe;
  coords3d: [number, number, number];
  hemisphere: 'Left' | 'Right' | 'Bilateral';
  degree: number;
  clusteringCoeff: number;
  betweenness: number;
  community: number;
}

export interface ConnectomeEdge {
  source: string;
  target: string;
  weight: number; // Functional/structural correlation -1.0 to 1.0 or tract count
  fiberStreamlines: number;
  pValue: number;
  isSignificant: boolean;
  isAltered: boolean; // highlighted in abnormality analysis
  alterationType?: 'Hypoconnectivity' | 'Hyperconnectivity' | 'Intact';
}

export interface GraphTheoryMetrics {
  globalEfficiency: number;
  modularityIndex: number;
  meanClusteringCoefficient: number;
  characteristicPathLength: number;
  smallWorldnessIndex: number;
  totalEdges: number;
  activeNodes: number;
  richClubHubs: string[];
}

export interface ModelPrediction {
  modelId: 'xgboost' | 'random_forest' | 'logistic_regression' | 'resnet3d_cnn' | 'neuro_ensemble';
  modelName: string;
  modelType: 'Tabular ML' | 'Volumetric 3D Deep Learning' | 'Multimodal Ensemble';
  predictedClass: string;
  predictedClassId: 'CN' | 'MCI' | 'AD' | 'SZ_DISCONNECT' | 'GLIOMA_SUSPECT';
  confidence: number;
  probabilities: { [className: string]: number };
  latencyMs: number;
  benchmarks: {
    accuracy: number;
    precision: number;
    recall: number;
    specificity: number;
    f1Score: number;
    rocAuc: number;
  };
  topContributingRegions: Array<{
    regionId: string;
    regionName: string;
    shapValue: number;
    contributionType: 'positive' | 'negative';
    evidence: string;
  }>;
  topContributingEdges: Array<{
    source: string;
    target: string;
    weight: number;
    impact: number;
  }>;
  confusionMatrix: number[][]; // 2x2 or 3x3
  classes: string[];
}

export interface PresetResearchScan {
  id: string;
  title: string;
  category: string;
  cohort: 'OASIS-3' | 'ADNI-3' | 'HCP' | 'UK Biobank' | 'Custom Upload';
  summary: string;
  groundTruth: string;
  metadata: SubjectMetadata;
  qc: QualityControlMetrics;
  regions: BrainRegion[];
  nodes: ConnectomeNode[];
  edges: ConnectomeEdge[];
  graphMetrics: GraphTheoryMetrics;
  predictions: ModelPrediction[];
  sliceData: {
    axialSlices: number;
    coronalSlices: number;
    sagittalSlices: number;
    defaultAxial: number;
    defaultCoronal: number;
    defaultSagittal: number;
  };
}
