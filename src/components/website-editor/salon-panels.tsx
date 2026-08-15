"use client";

import type { ComponentProps } from "react";
import { SALON_MODERN_01_DEMO_ASSETS } from "@/lib/templates/demo-assets";
import {
  createFaqItem,
  createGalleryItem,
  createTestimonialItem,
  moveItem,
  type EditorErrors,
} from "@/lib/templates/editor";
import {
  SALON_EDITOR_LIMITS,
  createSalonService,
  createSalonTeamMember,
} from "@/lib/templates/salon-editor";
import type { SalonWebsiteContent } from "@/lib/templates/types";
import { RepeatableCard } from "./RepeatableCard";
import { ImagePickerField } from "./ImagePickerField";
import {
  ColorField,
  FieldError,
  FieldHint,
  TextAreaField,
  TextField,
} from "./fields";

export type SalonEditorUpdate = (
  updater: (draft: SalonWebsiteContent) => void,
) => void;

type PanelProps = {
  content: SalonWebsiteContent;
  errors: EditorErrors;
  onUpdate: SalonEditorUpdate;
};

const HERO_IMAGE = "/templates/salon-modern-01/hero.jpg";
const INTRO_IMAGE = "/templates/salon-modern-01/intro.jpg";
const STORY_IMAGE = "/templates/salon-modern-01/story.jpg";
const TEAM_IMAGE = "/templates/salon-modern-01/team-mira.jpg";
const GALLERY_IMAGE = "/templates/salon-modern-01/gallery-cut.jpg";

function SalonImagePicker(
  props: Omit<ComponentProps<typeof ImagePickerField>, "demoAssets">,
) {
  return (
    <ImagePickerField {...props} demoAssets={SALON_MODERN_01_DEMO_ASSETS} />
  );
}

export function SalonBusinessPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <TextField
        id="studioName"
        label="Studio name"
        value={content.business.businessName}
        error={errors["business.businessName"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.businessName = value;
          })
        }
      />
      <TextField
        id="tagline"
        label="Tagline"
        value={content.business.tagline ?? ""}
        hint="Optional. Shown under the name in the header."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.tagline = value;
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="phone"
          label="Phone"
          type="tel"
          value={content.business.phone}
          error={errors["business.phone"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.business.phone = value;
            })
          }
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={content.business.email}
          error={errors["business.email"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.business.email = value;
            })
          }
        />
      </div>
      <TextField
        id="address"
        label="Address"
        value={content.business.address}
        hint="Single display line. Shown in Location & Hours. No map is embedded."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.address = value;
          })
        }
      />
      <TextAreaField
        id="hours"
        label="Studio hours"
        value={content.business.businessHours.join("\n")}
        hint="One line per hours entry. These also appear in Location."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.businessHours = value.split("\n");
          })
        }
      />
    </div>
  );
}

export function SalonBrandingPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <TextField
        id="logoText"
        label="Logo text fallback"
        value={content.business.logoText}
        hint="Used when no logo image is selected."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.logoText = value;
          })
        }
      />
      <SalonImagePicker
        id="logoSrc"
        label="Logo image"
        value={content.business.logoSrc ?? ""}
        allowClear
        hint="Optional. Removing the logo does not delete uploaded files."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.logoSrc = value || undefined;
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <ColorField
          id="primaryColor"
          label="Primary color"
          value={content.branding.primaryColor}
          error={errors["branding.primaryColor"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.branding.primaryColor = value;
            })
          }
        />
        <ColorField
          id="accentColor"
          label="Accent color"
          value={content.branding.accentColor}
          error={errors["branding.accentColor"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.branding.accentColor = value;
            })
          }
        />
        <ColorField
          id="secondaryColor"
          label="Secondary color"
          value={content.branding.secondaryColor ?? ""}
          error={errors["branding.secondaryColor"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.branding.secondaryColor = value;
            })
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          id="backgroundColor"
          label="Background color"
          value={content.branding.backgroundColor}
          error={errors["branding.backgroundColor"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.branding.backgroundColor = value;
            })
          }
        />
        <ColorField
          id="surfaceColor"
          label="Surface color"
          value={content.branding.surfaceColor}
          error={errors["branding.surfaceColor"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.branding.surfaceColor = value;
            })
          }
        />
      </div>
    </div>
  );
}

export function SalonHeroPanel({ content, errors, onUpdate }: PanelProps) {
  const secondary = content.hero.secondaryCta ?? { label: "", href: "" };
  return (
    <div className="grid gap-4">
      <TextField
        id="heroEyebrow"
        label="Eyebrow"
        value={content.hero.eyebrow ?? ""}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.eyebrow = value;
          })
        }
      />
      <TextField
        id="heroHeadline"
        label="Headline"
        value={content.hero.headline}
        error={errors["hero.headline"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.headline = value;
          })
        }
      />
      <TextAreaField
        id="heroDescription"
        label="Description"
        value={content.hero.subheadline}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.subheadline = value;
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="heroPrimaryLabel"
          label="Primary CTA label"
          value={content.hero.primaryCta.label}
          error={errors["hero.primaryCta.label"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.hero.primaryCta.label = value;
            })
          }
        />
        <TextField
          id="heroPrimaryHref"
          label="Primary CTA destination"
          value={content.hero.primaryCta.href}
          error={errors["hero.primaryCta.href"]}
          hint="Examples: #book, #services, tel:+16025550194"
          onChange={(value) =>
            onUpdate((draft) => {
              draft.hero.primaryCta.href = value;
            })
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="heroSecondaryLabel"
          label="Secondary CTA label"
          value={secondary.label}
          error={errors["hero.secondaryCta.label"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.hero.secondaryCta = {
                label: value,
                href: draft.hero.secondaryCta?.href ?? "",
              };
            })
          }
        />
        <TextField
          id="heroSecondaryHref"
          label="Secondary CTA destination"
          value={secondary.href}
          error={errors["hero.secondaryCta.href"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.hero.secondaryCta = {
                label: draft.hero.secondaryCta?.label ?? "",
                href: value,
              };
            })
          }
        />
      </div>
      <SalonImagePicker
        id="heroImage"
        label="Hero image"
        value={content.hero.imageSrc}
        templateFallbackSrc={HERO_IMAGE}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.imageSrc = value;
          })
        }
      />
      <TextField
        id="heroAlt"
        label="Image alt text"
        value={content.hero.imageAlt}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.imageAlt = value;
          })
        }
      />
    </div>
  );
}

export function SalonIntroPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="introEyebrow"
          label="Section eyebrow"
          value={content.sections.intro.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.intro.eyebrow = value;
            })
          }
        />
        <TextField
          id="introSectionHeading"
          label="Section heading"
          value={content.sections.intro.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.intro.heading = value;
            })
          }
        />
      </div>
      <TextField
        id="introHeading"
        label="Introduction heading"
        value={content.intro.heading}
        error={errors["intro.heading"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.intro.heading = value;
          })
        }
      />
      <TextAreaField
        id="introText"
        label="Introduction copy"
        value={content.intro.text}
        error={errors["intro.text"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.intro.text = value;
          })
        }
      />
      <SalonImagePicker
        id="introImage"
        label="Introduction image"
        value={content.intro.imageSrc}
        templateFallbackSrc={INTRO_IMAGE}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.intro.imageSrc = value;
          })
        }
      />
      <TextField
        id="introAlt"
        label="Image alt text"
        value={content.intro.imageAlt}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.intro.imageAlt = value;
          })
        }
      />
    </div>
  );
}

export function SalonServicesPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="servicesEyebrow"
          label="Section eyebrow"
          value={content.sections.services.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.services.eyebrow = value;
            })
          }
        />
        <TextField
          id="servicesHeading"
          label="Section heading"
          value={content.sections.services.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.services.heading = value;
            })
          }
        />
      </div>
      <FieldHint>
        Structured salon services only. Display content — no booking or checkout.
      </FieldHint>
      <FieldError message={errors.services} />
      {content.services.map((service, index) => (
        <RepeatableCard
          key={service.id}
          title={service.name}
          index={index}
          total={content.services.length}
          disableRemove={content.services.length <= 1}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.services = moveItem(draft.services, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.services = moveItem(draft.services, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              if (draft.services.length > 1) {
                draft.services = draft.services.filter((_, i) => i !== index);
              }
            })
          }
        >
          <TextField
            id={`svc-name-${service.id}`}
            label="Name"
            value={service.name}
            error={errors[`services.${index}.name`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.services[index];
                if (next) next.name = value;
              })
            }
          />
          <TextAreaField
            id={`svc-desc-${service.id}`}
            label="Description"
            value={service.description}
            error={errors[`services.${index}.description`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.services[index];
                if (next) next.description = value;
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              id={`svc-price-${service.id}`}
              label="Price"
              value={service.price}
              error={errors[`services.${index}.price`]}
              hint='Examples: $68 or From $145'
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.services[index];
                  if (next) next.price = value;
                })
              }
            />
            <TextField
              id={`svc-duration-${service.id}`}
              label="Duration"
              value={service.duration ?? ""}
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.services[index];
                  if (next) next.duration = value;
                })
              }
            />
            <TextField
              id={`svc-cat-${service.id}`}
              label="Category"
              value={service.category ?? ""}
              hint="Hair, Color, Nails, Skin, Barbering, or custom."
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.services[index];
                  if (next) next.category = value;
                })
              }
            />
          </div>
          <SalonImagePicker
            id={`svc-image-${service.id}`}
            label="Service image"
            value={service.imageSrc ?? ""}
            allowClear
            hint="Optional."
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.services[index];
                if (next) next.imageSrc = value || undefined;
              })
            }
          />
          <TextField
            id={`svc-alt-${service.id}`}
            label="Image alt text"
            value={service.imageAlt ?? ""}
            error={errors[`services.${index}.imageAlt`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.services[index];
                if (next) next.imageAlt = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.services.length >= SALON_EDITOR_LIMITS.services}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.services.length < SALON_EDITOR_LIMITS.services) {
              draft.services.push(createSalonService());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium disabled:opacity-40"
      >
        Add service
      </button>
    </div>
  );
}

export function SalonStoryPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="aboutEyebrow"
          label="Section eyebrow"
          value={content.sections.about.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.about.eyebrow = value;
            })
          }
        />
        <TextField
          id="aboutSectionHeading"
          label="Section heading"
          value={content.sections.about.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.about.heading = value;
            })
          }
        />
      </div>
      <TextField
        id="aboutHeading"
        label="Story heading"
        value={content.about.heading}
        error={errors["about.heading"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.about.heading = value;
          })
        }
      />
      <TextAreaField
        id="aboutText"
        label="Story copy"
        value={content.about.text}
        error={errors["about.text"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.about.text = value;
          })
        }
      />
      <SalonImagePicker
        id="aboutImage"
        label="Story image"
        value={content.about.imageSrc}
        templateFallbackSrc={STORY_IMAGE}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.about.imageSrc = value;
          })
        }
      />
      <TextField
        id="aboutAlt"
        label="Image alt text"
        value={content.about.imageAlt}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.about.imageAlt = value;
          })
        }
      />
    </div>
  );
}

export function SalonTeamPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="teamEyebrow"
          label="Section eyebrow"
          value={content.sections.team.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.team.eyebrow = value;
            })
          }
        />
        <TextField
          id="teamHeading"
          label="Section heading"
          value={content.sections.team.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.team.heading = value;
            })
          }
        />
      </div>
      <FieldHint>Presentation profiles only. No staff accounts or logins.</FieldHint>
      {content.team.map((member, index) => (
        <RepeatableCard
          key={member.id}
          title={member.name}
          index={index}
          total={content.team.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.team = moveItem(draft.team, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.team = moveItem(draft.team, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.team = draft.team.filter((_, i) => i !== index);
            })
          }
        >
          <TextField
            id={`team-name-${member.id}`}
            label="Name"
            value={member.name}
            error={errors[`team.${index}.name`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.team[index];
                if (next) next.name = value;
              })
            }
          />
          <TextField
            id={`team-role-${member.id}`}
            label="Role / title"
            value={member.role}
            error={errors[`team.${index}.role`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.team[index];
                if (next) next.role = value;
              })
            }
          />
          <TextAreaField
            id={`team-bio-${member.id}`}
            label="Short bio"
            value={member.bio}
            error={errors[`team.${index}.bio`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.team[index];
                if (next) next.bio = value;
              })
            }
          />
          <SalonImagePicker
            id={`team-image-${member.id}`}
            label="Portrait"
            value={member.imageSrc}
            templateFallbackSrc={TEAM_IMAGE}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.team[index];
                if (next) next.imageSrc = value;
              })
            }
          />
          <TextField
            id={`team-alt-${member.id}`}
            label="Image alt text"
            value={member.imageAlt}
            error={errors[`team.${index}.imageAlt`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.team[index];
                if (next) next.imageAlt = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.team.length >= SALON_EDITOR_LIMITS.team}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.team.length < SALON_EDITOR_LIMITS.team) {
              draft.team.push(createSalonTeamMember(TEAM_IMAGE));
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium disabled:opacity-40"
      >
        Add team member
      </button>
    </div>
  );
}

export function SalonGalleryPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="galleryEyebrow"
          label="Section eyebrow"
          value={content.sections.gallery.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.gallery.eyebrow = value;
            })
          }
        />
        <TextField
          id="galleryHeading"
          label="Section heading"
          value={content.sections.gallery.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.gallery.heading = value;
            })
          }
        />
      </div>
      {content.gallery.map((item, index) => (
        <RepeatableCard
          key={item.id}
          title={item.caption || item.alt}
          index={index}
          total={content.gallery.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.gallery = moveItem(draft.gallery, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.gallery = moveItem(draft.gallery, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.gallery = draft.gallery.filter((_, i) => i !== index);
            })
          }
        >
          <SalonImagePicker
            id={`gal-image-${item.id}`}
            label="Image"
            value={item.imageSrc}
            templateFallbackSrc={GALLERY_IMAGE}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.gallery[index];
                if (next) next.imageSrc = value;
              })
            }
          />
          <TextField
            id={`gal-alt-${item.id}`}
            label="Alt text"
            value={item.alt}
            error={errors[`gallery.${index}.alt`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.gallery[index];
                if (next) next.alt = value;
              })
            }
          />
          <TextField
            id={`gal-caption-${item.id}`}
            label="Caption"
            value={item.caption ?? ""}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.gallery[index];
                if (next) next.caption = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.gallery.length >= SALON_EDITOR_LIMITS.gallery}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.gallery.length < SALON_EDITOR_LIMITS.gallery) {
              draft.gallery.push(createGalleryItem(GALLERY_IMAGE));
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium disabled:opacity-40"
      >
        Add gallery image
      </button>
    </div>
  );
}

export function SalonTestimonialsPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="testimonialsEyebrow"
          label="Section eyebrow"
          value={content.sections.testimonials.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.testimonials.eyebrow = value;
            })
          }
        />
        <TextField
          id="testimonialsHeading"
          label="Section heading"
          value={content.sections.testimonials.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.testimonials.heading = value;
            })
          }
        />
      </div>
      {content.testimonials.map((item, index) => (
        <RepeatableCard
          key={item.id}
          title={item.customerName}
          index={index}
          total={content.testimonials.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.testimonials = moveItem(draft.testimonials, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.testimonials = moveItem(draft.testimonials, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.testimonials = draft.testimonials.filter((_, i) => i !== index);
            })
          }
        >
          <TextField
            id={`t-name-${item.id}`}
            label="Guest name"
            value={item.customerName}
            error={errors[`testimonials.${index}.customerName`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.testimonials[index];
                if (next) next.customerName = value;
              })
            }
          />
          <TextAreaField
            id={`t-quote-${item.id}`}
            label="Quote"
            value={item.quote}
            error={errors[`testimonials.${index}.quote`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.testimonials[index];
                if (next) next.quote = value;
              })
            }
          />
          <TextField
            id={`t-source-${item.id}`}
            label="Source label"
            value={item.sourceLabel ?? ""}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.testimonials[index];
                if (next) next.sourceLabel = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.testimonials.length >= SALON_EDITOR_LIMITS.testimonials}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.testimonials.length < SALON_EDITOR_LIMITS.testimonials) {
              draft.testimonials.push(createTestimonialItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium disabled:opacity-40"
      >
        Add testimonial
      </button>
    </div>
  );
}

export function SalonFaqPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="faqEyebrow"
          label="Section eyebrow"
          value={content.sections.faq.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.faq.eyebrow = value;
            })
          }
        />
        <TextField
          id="faqHeading"
          label="Section heading"
          value={content.sections.faq.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.faq.heading = value;
            })
          }
        />
      </div>
      {content.faq.map((item, index) => (
        <RepeatableCard
          key={item.id}
          title={item.question}
          index={index}
          total={content.faq.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.faq = moveItem(draft.faq, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.faq = moveItem(draft.faq, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.faq = draft.faq.filter((_, i) => i !== index);
            })
          }
        >
          <TextField
            id={`faq-q-${item.id}`}
            label="Question"
            value={item.question}
            error={errors[`faq.${index}.question`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.faq[index];
                if (next) next.question = value;
              })
            }
          />
          <TextAreaField
            id={`faq-a-${item.id}`}
            label="Answer"
            value={item.answer}
            error={errors[`faq.${index}.answer`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.faq[index];
                if (next) next.answer = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.faq.length >= SALON_EDITOR_LIMITS.faq}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.faq.length < SALON_EDITOR_LIMITS.faq) {
              draft.faq.push(createFaqItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium disabled:opacity-40"
      >
        Add FAQ
      </button>
    </div>
  );
}

export function SalonContactPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="locationEyebrow"
          label="Location eyebrow"
          value={content.sections.location.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.location.eyebrow = value;
            })
          }
        />
        <TextField
          id="locationHeading"
          label="Location heading"
          value={content.sections.location.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.location.heading = value;
            })
          }
        />
      </div>
      <TextAreaField
        id="locationIntro"
        label="Location intro"
        value={content.sections.location.intro}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.sections.location.intro = value;
          })
        }
      />
      <FieldHint>
        Booking is a link only. Leave the URL blank to fall back to Call Us or Contact.
        Do not paste a scheduler embed.
      </FieldHint>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="bookingLabel"
          label="Booking button label"
          value={content.booking.label}
          error={errors["booking.label"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.booking.label = value;
            })
          }
        />
        <TextField
          id="bookingHref"
          label="External booking URL"
          value={content.booking.href}
          error={errors["booking.href"]}
          hint="Optional https:// link. Blank is allowed."
          onChange={(value) =>
            onUpdate((draft) => {
              draft.booking.href = value;
            })
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="contactCtaLabel"
          label="Contact CTA label"
          value={content.contact.cta.label}
          error={errors["contact.cta.label"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.contact.cta.label = value;
            })
          }
        />
        <TextField
          id="contactCtaHref"
          label="Contact CTA destination"
          value={content.contact.cta.href}
          error={errors["contact.cta.href"]}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.contact.cta.href = value;
            })
          }
        />
      </div>
      <TextField
        id="finalCtaHeading"
        label="Final CTA heading"
        value={content.sections.finalCta.heading}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.sections.finalCta.heading = value;
          })
        }
      />
      <TextAreaField
        id="finalCtaText"
        label="Final CTA text"
        value={content.sections.finalCta.text}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.sections.finalCta.text = value;
          })
        }
      />
    </div>
  );
}

export function SalonSocialPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <FieldHint>Empty links are not shown on the website.</FieldHint>
      {content.socialLinks.map((link, index) => (
        <div key={link.id} className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={`social-label-${link.id}`}
            label="Label"
            value={link.label}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.socialLinks[index];
                if (next) next.label = value;
              })
            }
          />
          <TextField
            id={`social-href-${link.id}`}
            label="URL"
            value={link.href}
            error={errors[`socialLinks.${index}.href`]}
            hint="Leave blank to hide this link."
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.socialLinks[index];
                if (next) next.href = value;
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

export function SalonVisibilityPanel({ content, onUpdate }: PanelProps) {
  const toggles = [
    { key: "intro", label: "Introduction" },
    { key: "services", label: "Services" },
    { key: "about", label: "Our Story" },
    { key: "team", label: "Team" },
    { key: "gallery", label: "Gallery" },
    { key: "testimonials", label: "Testimonials" },
    { key: "faq", label: "FAQ" },
    { key: "finalCta", label: "Booking CTA" },
  ] as const;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted">
        Header, hero, location, and footer stay on so the page remains a complete
        salon website.
      </p>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {toggles.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-4 px-4 py-3">
            <label htmlFor={`section-${item.key}`} className="text-sm font-medium">
              {item.label}
            </label>
            <input
              id={`section-${item.key}`}
              type="checkbox"
              checked={content.sectionVisibility[item.key]}
              onChange={(event) =>
                onUpdate((draft) => {
                  draft.sectionVisibility[item.key] = event.target.checked;
                })
              }
              className="h-4 w-4 accent-[var(--color-accent,#3d7eff)]"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
