export const projects = [
  {
    id: 1,
    title: "AETHERIA",
    subtitle: "Generative Audio-Visual Art Room",
    description: "An immersive 3D generative landscape exploring the boundary between music, digital geometries, and user-driven interactions.",
    longDescription: "Aetheria is an experimental project that translates sound waves into real-time 3D topographical meshes. Built using Three.js and Web Audio API, it creates an interactive audio-visual space where the user's microphone or loaded music tracks shape a virtual landscape. The project explores themes of digital synesthesia, cybernetics, and procedural world-building.",
    image: "/aetheria.png",
    tags: ["React Three Fiber", "Web Audio API", "GLSL Shaders", "Three.js"],
    url: "https://threejs.org/",
    details: [
      { label: "Role", value: "Creative Technologist / WebGL Developer" },
      { label: "Timeline", value: "2 Months (2025)" },
      { label: "Technologies", value: "React, Three.js, Canvas, WebGL" },
      { label: "Concept", value: "Procedural Landscape Syncing with Audio Frequencies" }
    ]
  },
  {
    id: 2,
    title: "CHRONOS",
    subtitle: "Spatial Temporal UI Interface",
    description: "A high-fidelity spatial user interface and temporal narrative concept designed for the next generation of augmented reality operating systems.",
    longDescription: "Chronos is a futuristic UI/UX concept design exploring holographic widgets, spatial depth layers, and circular chronological timelines for augmented reality. The project showcases how temporal data, calendars, and spatial environments can intersect seamlessly to provide an immersive, clutter-free user interface that adapts to environmental lighting and depth.",
    image: "/chronos.png",
    tags: ["Spatial UI", "Framer Motion 3D", "UX Design", "Holographic CSS"],
    url: "https://react.dev/",
    details: [
      { label: "Role", value: "Product Designer / UI Prototype Engineer" },
      { label: "Timeline", value: "3 Weeks (2026)" },
      { label: "Technologies", value: "Framer Motion, React, CSS Glassmorphism" },
      { label: "Concept", value: "Spatial AR Overlay & Circular Chronological Interaction" }
    ]
  }
];

export const terminalCategories = [
  { id: "projects", label: "/root/projects", desc: "Core spatial UI & WebGL design case files" },
  { id: "doodles", label: "/root/doodles", desc: "Interactive web canvas & styling experiments" },
  { id: "photography", label: "/root/photography", desc: "Digital captures & 3D virtual environment renders" },
  { id: "notes", label: "/root/ideas", desc: "Technical reflections & log entries" }
];

export const terminalFiles = {
  projects: [
    {
      name: "chronos-concept.sys",
      size: "4.2 MB",
      date: "2026-06-15",
      type: "Configuration File",
      lines: 240,
      previewText: "INIT_UI_SYSTEM --spatial_depth: 3;\nTRACK_HAND_INPUT --gesture: pinch;\nCALIBRATE_TEMPORAL_WIDGET --mode: circular;\nRENDER_HOLOGRAM --opacity: 0.85;\n// System operational. Depth matrices aligned.",
      details: "Full layout config files detailing AR overlay nodes, custom coordinates, and spring physics properties."
    },
    {
      name: "aetheria-shader.glsl",
      size: "128 KB",
      date: "2025-11-04",
      type: "OpenGL Shading Language",
      lines: 85,
      previewText: "uniform float u_time;\nuniform float u_audioFreq;\nvarying vec3 v_position;\nvoid main() {\n  float displacement = sin(v_position.x * 5.0 + u_time) * u_audioFreq;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position + vec3(0.0, displacement, 0.0), 1.0);\n}",
      details: "Fragment & vertex shaders coding the topographical mesh displacement sync'd to audio frequencies."
    }
  ],
  doodles: [
    {
      name: "gravity-sandbox.js",
      size: "45 KB",
      date: "2026-03-22",
      type: "JavaScript Script",
      lines: 310,
      previewText: "class GravityParticle {\n  constructor(x, y) {\n    this.pos = new Vector(x, y);\n    this.vel = new Vector(0, 0);\n    this.mass = Math.random() * 2 + 1;\n  }\n  applyAttractor(attractor) {\n    let force = Vector.sub(attractor, this.pos);\n    let d = force.mag();\n    force.normalize().mult(G / (d * d));\n    this.vel.add(force);\n  }\n}",
      details: "A 2D particle simulation rendering canvas attractors that wrap around coordinates based on hand/mouse drag physics."
    },
    {
      name: "matrix-scrambler.css",
      size: "8 KB",
      date: "2026-05-10",
      type: "Cascading Style Sheet",
      lines: 48,
      previewText: "@keyframes matrixGlow {\n  0% { text-shadow: 0 0 2px var(--accent-gold); }\n  50% { text-shadow: 0 0 12px var(--accent-gold), 0 0 20px var(--accent-purple); }\n  100% { text-shadow: 0 0 2px var(--accent-gold); }\n}\n.scrambled-text { animation: matrixGlow 2s infinite; }",
      details: "CSS variables, transitions, and keyframe animations driving glowing visual filters and canvas grids."
    }
  ],
  photography: [
    {
      name: "tokyo-pulse-09.raw",
      size: "48.5 MB",
      date: "2025-04-12",
      type: "Camera Raw Image",
      lines: "N/A",
      previewText: "[IMAGE META: ISO-400, f/1.8, 1/80s, Focal Length: 35mm]\nCoordinates: Shinjuku district, neon light dispersion analysis.\nKeywords: rain refraction, cyberpunk aesthetic, long exposure.",
      details: "Raw optical capture of metropolitan motion, exploring neon glow dispersion on rain-swept asphalt grids."
    },
    {
      name: "obsidian-monolith.exr",
      size: "18.2 MB",
      date: "2026-01-30",
      type: "OpenEXR High Dynamic Range",
      lines: "N/A",
      previewText: "[3D RENDER ENGINE: Blender Cycles]\nLight passes: Diffuse, Glossy, Ambient Occlusion, Volumetric scatter.\nMaterials: Brushed gold, polished obsidian glass, coarse concrete.",
      details: "Architectural composition depicting a monolith emerging from a dark reflecting pool under diffuse volumetric lightning."
    }
  ],
  notes: [
    {
      name: "digital-synesthesia.txt",
      size: "12 KB",
      date: "2026-02-18",
      type: "Plain Text Log",
      lines: 120,
      previewText: "Thoughts on Digital Synesthesia:\nHow do we represent audio as solid, sculptural forms? \nWebGL gives us a direct translation. If sound is a wave, and web geometry is a vertex array, we can use vertex buffers as spatial oscilloscopes. The interaction must feel physical.",
      details: "Personal dev log analyzing mathematical conversions of sound signals into spatial landscape geometry."
    }
  ]
};

export const moodCanvasCards = [
  {
    id: 1,
    title: "VIBE CODING PLAYLIST",
    type: "playlist",
    content: {
      track: "Ambient Space Synth",
      artist: "Lulu Curation",
      embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX8U77VzyH7sr"
    },
    defaultRotation: -4,
    defaultX: "10%",
    defaultY: "15%",
    description: "My go-to space synth tracks for focused coding sessions. Heavy low-ends and airy atmospheric pads."
  },
  {
    id: 2,
    title: "AETHERIA SHADER FLOW",
    type: "image",
    content: "/aetheria.png",
    defaultRotation: 5,
    defaultX: "48%",
    defaultY: "8%",
    description: "Procedural vertex output rendering sine waves displaced across a dynamic HSL color wheel mesh."
  },
  {
    id: 3,
    title: "SHINJUKU PULSE",
    type: "image",
    content: "/chronos.png",
    defaultRotation: -3,
    defaultX: "28%",
    defaultY: "45%",
    description: "Spatial AR calendar widget layout design displaying timeline coordinates in a glowing champagne halo."
  },
  {
    id: 4,
    title: "QUICK REFLECTION",
    type: "note",
    content: "Craft is in the edge cases. How it handles blank states, how it scales to mobile, how smoothly it exits. If the interface feels fragile under stress, the design has failed.",
    defaultRotation: 3,
    defaultX: "72%",
    defaultY: "25%",
    description: "Design philosophy log entry written during terminal calibration."
  },
  {
    id: 5,
    title: "CURRENT STATUS",
    type: "stats",
    content: {
      "SYSTEM STATUS": "ONLINE // ACTIVE",
      "PRIMARY ROLE": "FRONT-END ARCHITECT",
      "CURRENT STUDY": "WEBGL & GLSL SHADERS",
      "LOCATION": "SHANGHAI, CN"
    },
    defaultRotation: -2,
    defaultX: "65%",
    defaultY: "52%",
    description: "Diagnostic readout of active specs and coordinate parameters."
  }
];
