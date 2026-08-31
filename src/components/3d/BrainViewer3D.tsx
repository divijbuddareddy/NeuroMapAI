import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { BrainRegion, ConnectomeNode, ConnectomeEdge } from '../../types/neuro';
import { 
  RotateCcw, 
  Layers, 
  Activity, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface BrainViewer3DProps {
  regions: BrainRegion[];
  nodes: ConnectomeNode[];
  edges: ConnectomeEdge[];
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string | null) => void;
  colorMode?: 'lobe' | 'zScore' | 'community';
}

export const BrainViewer3D: React.FC<BrainViewer3DProps> = ({
  regions,
  nodes,
  edges,
  selectedRegionId,
  onSelectRegion,
  colorMode: initialColorMode = 'zScore'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [colorMode, setColorMode] = useState<'lobe' | 'zScore' | 'community'>(initialColorMode);
  const [showEdges, setShowEdges] = useState(true);
  const [showBrainMesh, setShowBrainMesh] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [edgeThreshold, setEdgeThreshold] = useState(0.2);
  const [hoveredNode, setHoveredNode] = useState<{ node: ConnectomeNode; region?: BrainRegion } | null>(null);

  // References for Three.js internals
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const edgeLinesRef = useRef<THREE.Group | null>(null);
  const brainMeshGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Points | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Color mapping helpers
  const getLobeColor = useCallback((lobe: string): THREE.Color => {
    switch (lobe) {
      case 'Frontal': return new THREE.Color(0x00f2fe);
      case 'Temporal': return new THREE.Color(0x7928ca);
      case 'Parietal': return new THREE.Color(0xff007a);
      case 'Occipital': return new THREE.Color(0xf59e0b);
      case 'Subcortical': return new THREE.Color(0x10b981);
      case 'Limbic': return new THREE.Color(0x38bdf8);
      default: return new THREE.Color(0x94a3b8);
    }
  }, []);

  const getZScoreColor = useCallback((zScore: number): THREE.Color => {
    if (zScore <= -2.0) return new THREE.Color(0xf43f5e); // Severe Atrophy (Crimson)
    if (zScore <= -1.0) return new THREE.Color(0xfb923c); // Mild Atrophy (Amber/Orange)
    if (zScore >= 2.0) return new THREE.Color(0x38bdf8);  // Hypertrophy
    return new THREE.Color(0x00e5ff); // Normal (Cyan)
  }, []);

  const getCommunityColor = useCallback((comm: number): THREE.Color => {
    const palette = [0x00f2fe, 0xff007a, 0x10b981, 0xf59e0b, 0xa855f7];
    return new THREE.Color(palette[comm % palette.length]);
  }, []);

  const getNodeColor = useCallback((node: ConnectomeNode): THREE.Color => {
    const reg = regions.find(r => r.code === node.id || r.id.includes(node.name.toLowerCase()));
    if (colorMode === 'zScore') {
      return getZScoreColor(reg?.zScore ?? 0);
    } else if (colorMode === 'lobe') {
      return getLobeColor(node.lobe);
    } else {
      return getCommunityColor(node.community);
    }
  }, [colorMode, regions, getZScoreColor, getLobeColor, getCommunityColor]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.0035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 40, 220);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.maxDistance = 600;
    controls.minDistance = 60;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 2.0);
    dirLight1.position.set(100, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7928ca, 2.0);
    dirLight2.position.set(-100, -100, -100);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xff007a, 2.5, 300);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 6. Realistic 3D Translucent Brain Hemisphere Cortical Shells
    const brainGroup = new THREE.Group();
    brainMeshGroupRef.current = brainGroup;

    // Left Hemisphere Shell
    const leftHemGeo = new THREE.SphereGeometry(62, 48, 36);
    leftHemGeo.scale(0.72, 0.95, 1.2);
    leftHemGeo.translate(-24, 6, 0);

    // Right Hemisphere Shell
    const rightHemGeo = new THREE.SphereGeometry(62, 48, 36);
    rightHemGeo.scale(0.72, 0.95, 1.2);
    rightHemGeo.translate(24, 6, 0);

    // Translucent Holographic Glass Material
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e294b,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.12,
      roughness: 0.25,
      metalness: 0.1,
      transmission: 0.88,
      thickness: 1.8,
      transparent: true,
      opacity: 0.32,
      wireframe: false,
      depthWrite: false
    });

    const leftMesh = new THREE.Mesh(leftHemGeo, brainMat);
    const rightMesh = new THREE.Mesh(rightHemGeo, brainMat);
    brainGroup.add(leftMesh);
    brainGroup.add(rightMesh);

    // Glowing Wireframe Outline Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const leftWire = new THREE.Mesh(leftHemGeo, wireMat);
    const rightWire = new THREE.Mesh(rightHemGeo, wireMat);
    brainGroup.add(leftWire);
    brainGroup.add(rightWire);

    scene.add(brainGroup);

    // 7. Ambient Neural Starfield / Synaptic Dust Particles
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 220;
      particlePositions[i + 1] = (Math.random() - 0.5) * 180;
      particlePositions[i + 2] = (Math.random() - 0.5) * 220;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 1.8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesGroupRef.current = particles;
    scene.add(particles);

    // 8. Connectome Edge Group Container
    const edgeGroup = new THREE.Group();
    edgeLinesRef.current = edgeGroup;
    scene.add(edgeGroup);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodeMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const nodeCode = hitMesh.userData.nodeCode;
        const nodeData = nodes.find(n => n.id === nodeCode);
        if (nodeData) {
          const regData = regions.find(r => r.code === nodeCode || r.id.includes(nodeData.name.toLowerCase()));
          setHoveredNode({ node: nodeData, region: regData });
          containerRef.current.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        if (containerRef.current) containerRef.current.style.cursor = 'default';
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodeMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const nodeCode = hitMesh.userData.nodeCode;
        const reg = regions.find(r => r.code === nodeCode);
        if (reg && onSelectRegion) {
          onSelectRegion(reg.id === selectedRegionId ? null : reg.id);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Gentle floating animation
      if (brainGroup) {
        brainGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.05;
      }
      if (particles) {
        particles.rotation.y = elapsedTime * 0.02;
      }

      // Pulse active/selected nodes
      nodeMeshesRef.current.forEach((mesh, code) => {
        const isSelected = selectedRegionId && regions.find(r => r.id === selectedRegionId)?.code === code;
        if (isSelected) {
          const scale = 1.3 + Math.sin(elapsedTime * 6) * 0.3;
          mesh.scale.set(scale, scale, scale);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update 3D Nodes when nodes/regions/colorMode change
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear old node meshes
    nodeMeshesRef.current.forEach(mesh => scene.remove(mesh));
    nodeMeshesRef.current.clear();

    const nodeGeo = new THREE.SphereGeometry(2.8, 20, 20);

    nodes.forEach(node => {
      const color = getNodeColor(node);
      const nodeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.3
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(node.coords3d[0], node.coords3d[2] - 10, -node.coords3d[1]); // Convert MNI to Three.js orientation
      mesh.userData = { nodeCode: node.id, nodeName: node.name };

      scene.add(mesh);
      nodeMeshesRef.current.set(node.id, mesh);
    });
  }, [nodes, regions, colorMode, getNodeColor]);

  // Update Connectome Arcs / Edges
  useEffect(() => {
    if (!edgeLinesRef.current || !sceneRef.current) return;
    const edgeGroup = edgeLinesRef.current;

    // Clear previous edges
    while (edgeGroup.children.length > 0) {
      const obj = edgeGroup.children[0];
      edgeGroup.remove(obj);
    }

    if (!showEdges) return;

    edges.forEach(edge => {
      if (Math.abs(edge.weight) < edgeThreshold) return;

      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const p1 = new THREE.Vector3(sourceNode.coords3d[0], sourceNode.coords3d[2] - 10, -sourceNode.coords3d[1]);
      const p2 = new THREE.Vector3(targetNode.coords3d[0], targetNode.coords3d[2] - 10, -targetNode.coords3d[1]);

      // Create an arched 3D Quadratic Bezier Curve between brain regions
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.y += dist * 0.25; // Arch height

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(24);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Color coding for edges: Dysfunctional/Hypoconnectivity = Crimson/Magenta, Strong = Cyan/Neon
      let edgeColor = 0x00e5ff;
      let opacity = 0.45;

      if (edge.isAltered && edge.alterationType === 'Hypoconnectivity') {
        edgeColor = 0xf43f5e; // Crimson
        opacity = 0.85;
      } else if (edge.weight > 0.75) {
        edgeColor = 0x00f2fe; // Bright Cyan
        opacity = 0.6;
      }

      const material = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity,
        linewidth: 1.5
      });

      const line = new THREE.Line(geometry, material);
      edgeGroup.add(line);
    });
  }, [edges, nodes, showEdges, edgeThreshold]);

  // Update Brain Mesh visibility
  useEffect(() => {
    if (brainMeshGroupRef.current) {
      brainMeshGroupRef.current.visible = showBrainMesh;
    }
  }, [showBrainMesh]);

  // Update Particles visibility
  useEffect(() => {
    if (particlesGroupRef.current) {
      particlesGroupRef.current.visible = showParticles;
    }
  }, [showParticles]);

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 40, 220);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-card border border-cyan-500/20 shadow-2xl flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Badge & Color Palette Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto bg-neuro-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-cyan-300 font-mono">3D CONNECTOME WEBGL</span>
          <div className="h-4 w-px bg-white/20 mx-1"></div>
          
          {/* Color Mode Selector */}
          <div className="flex items-center gap-1 text-xs">
            <button 
              onClick={() => setColorMode('zScore')}
              className={`px-2 py-0.5 rounded-md transition ${colorMode === 'zScore' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Atrophy Z-Score
            </button>
            <button 
              onClick={() => setColorMode('lobe')}
              className={`px-2 py-0.5 rounded-md transition ${colorMode === 'lobe' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Lobe Atlas
            </button>
            <button 
              onClick={() => setColorMode('community')}
              className={`px-2 py-0.5 rounded-md transition ${colorMode === 'community' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Modularity
            </button>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-neuro-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={() => setShowEdges(!showEdges)}
            title="Toggle Fiber Arcs"
            className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${showEdges ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Tracts</span>
          </button>

          <button
            onClick={() => setShowBrainMesh(!showBrainMesh)}
            title="Toggle Cortical Surface"
            className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${showBrainMesh ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Cortex</span>
          </button>

          <button
            onClick={() => setShowParticles(!showParticles)}
            title="Toggle Synaptic Dust"
            className={`p-1.5 rounded-lg text-xs transition ${showParticles ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset 3D Camera"
            className="p-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full h-full bg-[#060913]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Hovered Node HUD Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-6 left-6 z-30 pointer-events-none glass-card bg-neuro-950/90 border border-cyan-500/40 p-4 rounded-xl shadow-glow-cyan max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                {hoveredNode.node.id} • {hoveredNode.node.lobe}
              </span>
              <span className={`text-xs font-mono font-bold ${
                (hoveredNode.region?.zScore ?? 0) <= -2.0 ? 'text-rose-400' : 
                (hoveredNode.region?.zScore ?? 0) <= -1.0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                Z = {hoveredNode.region?.zScore ?? 0 > 0 ? '+' : ''}{hoveredNode.region?.zScore?.toFixed(2) ?? '0.00'}σ
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">{hoveredNode.node.name}</h4>
            
            {hoveredNode.region && (
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Volume</span>
                  <span className="font-mono text-cyan-300 font-medium">{hoveredNode.region.volume_mm3.toLocaleString()} mm³</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Thickness</span>
                  <span className="font-mono text-cyan-300 font-medium">
                    {hoveredNode.region.cortical_thickness_mm > 0 ? `${hoveredNode.region.cortical_thickness_mm} mm` : 'Subcortical'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nodal Degree</span>
                  <span className="font-mono text-purple-300 font-medium">{hoveredNode.node.degree} edges</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className={`font-medium ${
                    hoveredNode.region.status === 'Atrophy' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {hoveredNode.region.status}
                  </span>
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-2 italic">Click node to pin region & filter connectome tracts</p>
          </div>
        )}

        {/* Edge Threshold Slider & Quick Legend in Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
          {showEdges && (
            <div className="glass-card bg-neuro-900/90 border border-white/10 px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-[11px]">Tract Threshold:</span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={edgeThreshold}
                onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))}
                className="w-20 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-cyan-300 text-[11px] w-7">{edgeThreshold.toFixed(2)}</span>
            </div>
          )}

          {/* Color Legend Badge */}
          <div className="glass-card bg-neuro-900/80 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-3 text-slate-300">
            {colorMode === 'zScore' && (
              <>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Atrophy (Z &lt; -2)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Borderline (-1 to -2)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>Normal (Z &gt; -1)</div>
              </>
            )}
            {colorMode === 'lobe' && (
              <>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00f2fe]"></div>Frontal</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#7928ca]"></div>Temporal</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff007a]"></div>Parietal</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]"></div>Subcortical</div>
              </>
            )}
            {colorMode === 'community' && (
              <>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>Module 1</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500"></div>Module 2</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Module 3</div>
              </>
            )}
          </div>
        </div>

        {/* Safety Disclaimer Banner Watermark */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-40 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          RESEARCH ONLY PROTOTYPE • NOT FOR CLINICAL DIAGNOSIS
        </div>
      </div>
    </div>
  );
};
