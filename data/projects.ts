export type VideoEntry = {
  type:           "vimeo";
  id:             string;   // Vimeo video ID
  paddingPercent?: string;  // e.g. "16.67%" — from Vimeo embed, overrides default 56.25%
} | {
  type: "mp4";
  src:  string;   // path under /Projects/
};

export type StyleframeEntry = {
  src:    string;
  width:  number;
  height: number;
};

export type Project = {
  slug:          string;
  title:         string;
  year:          string;
  roles:         string[];
  categoryLabel?: string;  // defaults to "Category" if omitted
  synopsis:      string;
  cover:         string;
  tab:           "motion" | "interactive";
  videos?:          VideoEntry[];
  videoLayout?:     "stack" | "side-by-side";    // default: "stack"
  styleframes?:          StyleframeEntry[];
  styleframeLayout?:     "auto" | "grid";        // default: "auto" (landscape=full-width, square=grid)
  hideStyleframeLabel?:  boolean;                // hides "Styleframes" title when true
  synopsisCentered?:     boolean;                // centers synopsis text
};

export const projects: Project[] = [
  // ─── Motion Design ────────────────────────────────────────────────────────
  {
    slug:  "leap-2025",
    title: "Lean - Leap 2025",
    year:  "2025",
    roles: ["Client"],
    synopsis: "This project was created for a healthcare research brand to deliver an engaging, large-scale visual experience. The immersive room setup featured three walls, each 2.5m high and 13m wide, designed to fully surround the viewer with synchronized content.\n\nThe goal was to create infographic-style text sequences paired with 3D animations that visually reinforced key messages. The animations were designed to be clean, minimal, and fluid, ensuring clarity while maintaining a seamless, immersive flow.\n\nTechnical Approach\n- 3D motion graphics to enhance the visual storytelling\n- Typography-led sequences for structured, impactful messaging\n- Multi-screen synchronization to create a cohesive wraparound experience\n- Subtle gradients & minimal color palettes to align with the brand's identity",
    cover:    "/ProjectThumbnails/Lean1.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1055859112", paddingPercent: "16.67%" },
      { type: "vimeo", id: "1055860172", paddingPercent: "16.67%" },
    ],
    styleframes: [
      { src: "/Projects/lean-leap-2025/1c88c1219091735.67ac5432ec032.png",  width: 2376, height: 1320 },
      { src: "/Projects/lean-leap-2025/50347b219091735.67ac5432ec4e7.png",  width: 2376, height: 1320 },
      { src: "/Projects/lean-leap-2025/8da9b6219091735.67ac4ecd791a1.png",  width: 720,  height: 720  },
      { src: "/Projects/lean-leap-2025/b55e67219091735.67ac4ecd79660.png",  width: 683,  height: 683  },
      { src: "/Projects/lean-leap-2025/c7322b219091735.67ac4ecd77fee.png",  width: 834,  height: 834  },
    ],
  },
  {
    slug:     "gitex-2024",
    title:    "E& - Gitex 2024",
    year:     "2024",
    roles:    ["Client"],
    synopsis: "Create a visually striking and dynamic promotional video for E& Money, E&'s finance and payment app. The video should effectively communicate the app's key features and benefits, integrating E&'s signature 3D branding style to enhance visual appeal and brand identity.\n\nTone and Style Notes\n- Innovative yet approachable\n- Sleek and professional but engaging, with a futuristic 3D aesthetic that aligns with E&'s branding\n- Maintain brand colors and font guidelines",
    cover:    "/ProjectThumbnails/eand2.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1177113024", paddingPercent: "132.59%" },
      { type: "vimeo", id: "1177112758", paddingPercent: "132.59%" },
    ],
    videoLayout: "side-by-side",
  },
  {
    slug:     "lueur",
    title:    "Lueur",
    year:     "2023",
    roles:    ["Personal"],
    synopsis: "This is a portfolio piece inspired by ChatGPT's creative input. We leveraged ChatGPT's capabilities to generate branding ideas, names and the overall aesthetic and direction of the project.\n\nIt was pretty straightforward: \"A 10 second motion design video for a beauty brand titled 'Lueur', highlighting their new premium line up.\"\n\nOur project brief was to highlight the premium quality of the product line. We chose to use lighting and color to create a specific mood and atmosphere. We also came up with the campaign slogan \"Feel Regal\" to convey a different perspective on premium. We used the word 'Regal' as the inspiration for our design language throughout the video.\n\nWe started with some standard product reveal shots, then transitioned to some stunning architectural and lighting elements, to evoke a sense of ancient royalty.",
    cover:    "/ProjectThumbnails/leur1.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1177114217", paddingPercent: "75%" },
    ],
    styleframeLayout: "grid",
    styleframes: [
      { src: "/Projects/lueur/36c644176748525.64ca476cb264e.png", width: 1920, height: 960 },
      { src: "/Projects/lueur/9aa299176748525.64ca476cb7475.png", width: 1920, height: 960 },
      { src: "/Projects/lueur/b51fdd176748525.64ca476cb669b.png", width: 1920, height: 960 },
      { src: "/Projects/lueur/c27903176748525.64ca476cb5b04.png", width: 1920, height: 960 },
    ],
  },
  {
    slug:     "daif-2025",
    title:    "Dubai AI Festival",
    year:     "2025",
    roles:    ["Client"],
    synopsis: "Created while working at Sentient by Elysian, this project was commissioned as the main stage opening video for the Dubai AI Festival 2025.\n\nThe challenge was both ambitious and time-critical: producing a fully CG, large-scale film within just 12 days, tailored for an ultra-wide stage format of 6400 × 1300 pixels.\n\nConceptually, the film explores the metaphor of the \"black box mind\" of artificial intelligence—a space where thoughts form, collide, and evolve. Through abstract visual storytelling, we sought to capture how AI reflects on its own history, processes its present, and projects toward the unknowns of the future.\n\nThis project balanced narrative clarity, scale, and technical precision, with the aim of immersing the audience in a cinematic experience that set the tone for one of Dubai's most forward-looking events.",
    cover:    "/ProjectThumbnails/daif1.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1165907943", paddingPercent: "20.31%" },
    ],
    styleframeLayout: "grid",
    styleframes: [
      { src: "/Projects/dubai-ai-festival/01.png",                                width: 3201, height: 789 },
      { src: "/Projects/dubai-ai-festival/02.png",                                width: 3201, height: 806 },
      { src: "/Projects/dubai-ai-festival/03.png",                                width: 3201, height: 800 },
      { src: "/Projects/dubai-ai-festival/20441c233410695.68af069b9fd76.png",     width: 3201, height: 786 },
      { src: "/Projects/dubai-ai-festival/21318c233410695.68af069b9cd7c.png",     width: 3201, height: 771 },
      { src: "/Projects/dubai-ai-festival/32273a233410695.68af069b98e51.png",     width: 3201, height: 786 },
      { src: "/Projects/dubai-ai-festival/3f6445233410695.68af069b9b2c3.png",     width: 3212, height: 795 },
      { src: "/Projects/dubai-ai-festival/45b07f233410695.68af069b9f5dd.png",     width: 3212, height: 794 },
      { src: "/Projects/dubai-ai-festival/48a7f4233410695.68af069b9dd63.png",     width: 3201, height: 794 },
      { src: "/Projects/dubai-ai-festival/4c71f4233410695.68af069b9bfca.png",     width: 3212, height: 803 },
      { src: "/Projects/dubai-ai-festival/6911d7233410695.68af069b9ebc9.png",     width: 3212, height: 804 },
      { src: "/Projects/dubai-ai-festival/706474233410695.68af069b9c7ff.png",     width: 3215, height: 770 },
      { src: "/Projects/dubai-ai-festival/70ae35233410695.68af069b97f70.png",     width: 3201, height: 786 },
      { src: "/Projects/dubai-ai-festival/8aa42c233410695.68af069b99346.png",     width: 3201, height: 794 },
      { src: "/Projects/dubai-ai-festival/99899d233410695.68af069b9e2ff.png",     width: 3201, height: 798 },
      { src: "/Projects/dubai-ai-festival/9c535b233410695.68af069b9b89c.png",     width: 3212, height: 800 },
      { src: "/Projects/dubai-ai-festival/9ebc7c233410695.68af069b99df3.png",     width: 3201, height: 765 },
      { src: "/Projects/dubai-ai-festival/d848d9233410695.68af069b9f0e8.png",     width: 3212, height: 805 },
      { src: "/Projects/dubai-ai-festival/e844d6233410695.68af069b9d581.png",     width: 3201, height: 804 },
      { src: "/Projects/dubai-ai-festival/ede440233410695.68af069b9aabf.png",     width: 3201, height: 771 },
      { src: "/Projects/dubai-ai-festival/f00121233410695.68af069b9a5a2.png",     width: 3201, height: 800 },
      { src: "/Projects/dubai-ai-festival/f1b9bf233410695.68af069ba054f.png",     width: 3211, height: 804 },
    ],
  },
  {
    slug:     "sony",
    title:    "Sony",
    year:     "2021",
    roles:    ["Personal"],
    synopsis: "This project is a product unveiling video for Sony's bluetooth earphones. The video showcases the features and benefits of the earphones in a captivating and engaging way. The video is 15 seconds long and uses motion design elements such as transitions, animations, and sound effects. The video is intended to attract potential customers and increase brand awareness.\n\nThe brief for this project was generated by ChatGPT, an artificial intelligence model that can create natural and coherent texts. ChatGPT was given the product name, the target audience, and the main goal of the video as inputs. ChatGPT then produced a brief that outlined the tone, style, and content of the video. The brief was used as a guide for the creative process and the final product.\n\nThis is not a commercial project, but rather a personal project made strictly for the purpose of showcasing my skills as a motion designer. I wanted to demonstrate my ability to create a compelling and professional video for a real-world product using ChatGPT as a creative assistant.",
    cover:    "/ProjectThumbnails/sony1.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1177117603", paddingPercent: "56.25%" },
    ],
    styleframes: [
      { src: "/Projects/sony/55c08c187573843.658be9ae80582.png", width: 1920, height: 1080 },
      { src: "/Projects/sony/640b85187573843.658be9ae7f7fa.png", width: 1920, height: 1080 },
      { src: "/Projects/sony/b66411187573843.658be9ae7ea2f.png", width: 1920, height: 1080 },
    ],
  },
  {
    slug:     "beyond",
    title:    "Beyond",
    year:     "2019",
    roles:    ["Personal"],
    synopsis: "An exploration of lighting and the emotion it invokes. Also a first step into understanding sound design and what makes visuals come to life because of it.",
    cover:    "/ProjectThumbnails/bey1.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1177118038", paddingPercent: "56.25%" },
    ],
    styleframes: [
      { src: "/Projects/beyond/494e24119752225.60a42743aab82.jpg",  width: 1920, height: 720 },
      { src: "/Projects/beyond/6a70ab119752225.60a42743abaee.png",  width: 1920, height: 720 },
      { src: "/Projects/beyond/9847f3119752225.60a42743aa021.jpg",  width: 1920, height: 720 },
      { src: "/Projects/beyond/e3dba9119752225.60a42743ab163.png",  width: 1920, height: 720 },
    ],
  },
  {
    slug:     "dreams",
    title:    "Dreams",
    year:     "2019",
    roles:    ["Personal"],
    synopsis: "A project inspired by the music of M83 and the film 'Interstellar' focusing on the impact for the future that the 1969 moon landing has inspired for generations to come.",
    cover:    "/ProjectThumbnails/dream1.png",
    tab:      "motion",
    videos: [
      { type: "vimeo", id: "1177118399", paddingPercent: "56.25%" },
    ],
    styleframes: [
      { src: "/Projects/dreams/72c109121631423.60c9d32aede7d.jpg", width: 1920, height: 1080 },
      { src: "/Projects/dreams/747de0121631423.60c9d32aef27b.jpg", width: 1920, height: 1080 },
      { src: "/Projects/dreams/991e31121631423.60c9d32af02c8.jpg", width: 1920, height: 1080 },
      { src: "/Projects/dreams/bdc73f121631423.60c9d32aeea23.jpg", width: 1920, height: 1080 },
      { src: "/Projects/dreams/d517f3121631423.60c9d32aefe13.jpg", width: 1920, height: 1080 },
      { src: "/Projects/dreams/fec18b121631423.60c9d32aef940.jpg", width: 1920, height: 1080 },
    ],
  },
  {
    slug:                "urban",
    title:               "Urban",
    year:                "2018",
    roles:               ["Personal"],
    synopsis:            "To create a filmic and cinematic series of images under the theme 'URBAN'.",
    synopsisCentered:    true,
    cover:               "/ProjectThumbnails/urban1.png",
    tab:                 "motion",
    hideStyleframeLabel: true,
    styleframes: [
      { src: "/Projects/urban/0de262128371097.6154b005cd521.jpg", width: 3840, height: 1609 },
      { src: "/Projects/urban/b20769128371097.6154b005ccf0f.jpg", width: 1920, height: 804  },
      { src: "/Projects/urban/c8c726128371097.6154b005ce010.png", width: 4000, height: 1676 },
      { src: "/Projects/urban/d0170c128371097.6154b005ce610.png", width: 1920, height: 804  },
    ],
  },
  // ─── Interactive Demos ────────────────────────────────────────────────────
  {
    slug:     "porsche-configurator",
    title:    "Porsche Configurator",
    year:     "",
    roles:    [],
    synopsis: "",
    cover:    "",
    tab:      "interactive",
  },
];
