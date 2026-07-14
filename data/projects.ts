// Types + loaders for the JSON data layer.
// Content lives in projects.json / site.json / gallery.json so the CMS
// (/admin) can edit it via GitHub commits — Vercel rebuilds on push.

import projectsJson from "./projects.json";
import galleryJson from "./gallery.json";

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

export type FeatureSection = {
  title: string;
  body:  string;
};

export type Project = {
  slug:          string;
  title:         string;
  year:          string;
  roles:         string[];
  categoryLabel?: string;  // defaults to "Category" if omitted
  synopsis?:     string;
  cover:         string;
  tab:           "motion" | "interactive";
  videos?:          VideoEntry[];
  videoLayout?:     "stack" | "side-by-side";    // default: "stack"
  styleframes?:          StyleframeEntry[];
  styleframeLayout?:     "auto" | "grid";        // default: "auto" (landscape=full-width, square=grid)
  hideStyleframeLabel?:  boolean;                // hides "Styleframes" title when true
  synopsisCentered?:     boolean;                // centers synopsis text
  // interactive demo fields
  heroStatement?:    string;                     // large opening statement
  featureSections?:  FeatureSection[];           // "The Experience" subsections
  technicalNotes?:   string;                     // smaller-type technical section
  demoUrl?:          string;                     // if set, shows Launch Demo button
};

export type GalleryEntry = {
  slug: string;   // project slug the image belongs to
  src:  string;
};

export const projects = projectsJson as Project[];
export const gallery  = galleryJson as GalleryEntry[];
