import siteJson from "./site.json";

export type DataRow = { key: string; value: string };

export type Capability = {
  tag:      string;
  title:    string;
  sub:      string;
  relSlug:  string;
  relLabel: string;
  image:    string;
};

export type Testimonial = {
  id:       string;
  name:     string;
  position: string;
  preview:  string;
  review:   string;
};

export type SiteContent = {
  hero: {
    wordmark: string;
    hudTop:   string;
    hudLeft:  string;
    marquee:  string[];
  };
  about: {
    sectionMeta:     string;
    headingLine1:    string;
    headingLine2:    string;
    paragraph:       string;
    portrait:        string;
    portraitCaption: string;
    dataRows:        DataRow[];
    statusRow:       boolean;
  };
  capabilities: Capability[];
  testimonials: Testimonial[];
  contact: {
    responseLine: string;
    links: { label: string; sub: string; href: string }[];
  };
  footer: {
    studioLine: string;
    status:     string;
    version:    string;
    links: { label: string; href: string }[];
  };
};

export const site = siteJson as SiteContent;
