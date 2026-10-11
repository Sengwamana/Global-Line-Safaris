/**
 * Centralized image configuration for Global Line Safaris.
 *
 * Hero / page-background imagery comes from /public/images, sourced from the
 * supplied photo set in /public/Images. Files were copied to clean kebab-case
 * slugs so URLs contain no spaces or double extensions; originals are untouched.
 *   1. Drop new files under /public/images (or /public/Images for raw drops).
 *   2. Point the slot below at the new path — no component changes needed.
 *
 * Team avatars intentionally stay in /public/gls/team because they are
 * photographs of named people, not scene/background imagery.
 *
 * All URLs are served through next/image for automatic optimization.
 */

export interface SiteImage {
  src: string;
  alt: string;
}

export interface TeamAvatarEntry {
  name: string;
  initials: string;
  /** Set to a local /public path or remote URL to use a real photo; null shows initials. */
  src: string | null;
}

export interface SiteImages {
  heroSlides: SiteImage[];
  about: SiteImage;
  advisory: SiteImage;
  servicesHero: SiteImage;
  trainingHero: SiteImage;
  smallBusiness: SiteImage;
  personalTaxes: SiteImage;
  outsourcing: SiteImage;
  alliedServices: SiteImage;
  contact: SiteImage;
  team: {
    founder: TeamAvatarEntry;
    raymond: TeamAvatarEntry;
    alexis: TeamAvatarEntry;
    ismail: TeamAvatarEntry;
    diane: TeamAvatarEntry;
  };
  aboutPage: {
    heroBackground: SiteImage;
    office: SiteImage;
    teamCollaboration: SiteImage;
    finances: SiteImage;
    workspace: SiteImage;
  };
}

export const siteImages: SiteImages = {
  // Hero background slides (wide, landscape, work well behind a dark overlay)
  heroSlides: [
    {
      src: "/images/rwanda-hills.jpg",
      alt: "Rolling green hills and countryside views across the Land of a Thousand Hills",
    },
    {
      src: "/images/volcanoes-national-park.jpg",
      alt: "Mist over the rainforest slopes of Volcanoes National Park, home of the mountain gorilla",
    },
    {
      src: "/images/best-of-rwanda-safari.jpg",
      alt: "Wildlife on the savannah plains of Rwanda during a best-of safari",
    },
  ],

  // About section photograph
  about: {
    src: "/images/akagera-national-park.jpg",
    alt: "Landscape of Akagera National Park, Rwanda's largest national park",
  },

  // Advisory / experiences
  advisory: {
    src: "/images/lake-ruhondo.jpg",
    alt: "Lake Ruhondo shoreline with rolling hills in the distance",
  },

  // Page-level hero backgrounds
  servicesHero: {
    src: "/images/nyungwe-forest-park.jpg",
    alt: "Old-growth rainforest canopy of Nyungwe National Park, Rwanda",
  },
  trainingHero: {
    src: "/gls/gallery/gallery_1787761154_6d06c549.jpg",
    alt: "Students participating in tourism training at Global Line Safaris",
  },

  // Service category images
  smallBusiness: {
    src: "/images/safari-01.webp",
    alt: "Safari landscape in Rwanda",
  },
  personalTaxes: {
    src: "/images/volcanoes-national-park.jpg",
    alt: "Gorilla trekking in Volcanoes National Park",
  },
  outsourcing: {
    src: "/images/kingfisher-kayaking.jpg",
    alt: "Kingfisher kayaking on the calm waters of Rwanda",
  },
  alliedServices: {
    src: "/images/lake-ruhondo.jpg",
    alt: "Twin Lakes of Burera and Ruhondo in northern Rwanda",
  },

  // Contact page supporting image
  contact: {
    src: "/images/rwanda-photo-2019.jpg",
    alt: "Rwanda safari experience with Global Line Safaris",
  },

  // Team member avatars — official Global Line Safaris photos of named people
  team: {
    founder: {
      name: "Raymond Shumbusho",
      initials: "RS",
      src: "/gls/team/raymond.jpg",
    },
    raymond: {
      name: "Raymond Shumbusho",
      initials: "RS",
      src: "/gls/team/raymond.jpg",
    },
    alexis: {
      name: "Alexis Rugamba",
      initials: "AR",
      src: "/gls/team/alexis.jpg",
    },
    ismail: {
      name: "Ismail Iradukunda",
      initials: "II",
      src: "/gls/team/ismail.jpg",
    },
    diane: {
      name: "Diane Uwase",
      initials: "DU",
      src: "/gls/team/diane.jpg",
    },
  },

  // About page illustration images
  aboutPage: {
    heroBackground: {
      src: "/images/rwanda-hills.jpg",
      alt: "Hills of Rwanda in the Land of a Thousand Hills",
    },
    office: {
      src: "/images/best-of-rwanda-safari.jpg",
      alt: "Rwanda travel and safari highlights",
    },
    teamCollaboration: {
      src: "/images/kingfisher-kayaking.jpg",
      alt: "Safari highlights from Global Line Safaris tours",
    },
    finances: {
      src: "/images/nyungwe-forest-park.jpg",
      alt: "Nyungwe National Park destination views",
    },
    workspace: {
      src: "/images/safari-01.webp",
      alt: "Rwanda wildlife and scenery",
    },
  },
};
