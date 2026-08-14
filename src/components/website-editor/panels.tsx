"use client";

import type { ServiceWebsiteContent } from "@/lib/templates/types";
import { SERVICE_MODERN_01_DEMO_ASSETS } from "@/lib/templates/demo-assets";
import {
  EDITOR_LIMITS,
  SERVICE_ICON_OPTIONS,
  WHY_ICON_OPTIONS,
  createFaqItem,
  createGalleryItem,
  createHighlightItem,
  createServiceItem,
  createTestimonialItem,
  createWhyItem,
  moveItem,
  type EditorErrors,
} from "@/lib/templates/editor";
import { RepeatableCard } from "./RepeatableCard";
import {
  ColorField,
  FieldHint,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";

export type EditorUpdate = (
  updater: (draft: ServiceWebsiteContent) => void,
) => void;

type PanelProps = {
  content: ServiceWebsiteContent;
  errors: EditorErrors;
  onUpdate: EditorUpdate;
};

const assetOptions = SERVICE_MODERN_01_DEMO_ASSETS.map((asset) => ({
  value: asset.src,
  label: asset.label,
}));

const logoOptions = [
  { value: "", label: "Text fallback only" },
  ...assetOptions,
];

export function BusinessPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <TextField
        id="businessName"
        label="Business name"
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
        hint="Single display line, matching the current template field."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.address = value;
          })
        }
      />
      <TextAreaField
        id="hours"
        label="Business hours"
        value={content.business.businessHours.join("\n")}
        hint="One line per hours entry. These also appear in Contact."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.business.businessHours = value.split("\n");
          })
        }
      />
    </div>
  );
}

export function BrandingPanel({ content, errors, onUpdate }: PanelProps) {
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
      <SelectField
        id="logoSrc"
        label="Logo image"
        value={content.business.logoSrc ?? ""}
        options={logoOptions}
        hint="Local demo assets only. Uploads come later."
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
              draft.branding.secondaryColor = value || undefined;
            })
          }
        />
      </div>
      <FieldHint>
        Fonts, layout, and corner radius stay with Service Modern 01.
      </FieldHint>
    </div>
  );
}

export function HeroPanel({ content, errors, onUpdate }: PanelProps) {
  const secondary = content.hero.secondaryCta ?? { label: "", href: "" };
  const supporting = content.hero.supportingItem ?? { label: "", value: "" };

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
        id="heroSubheadline"
        label="Subheadline"
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
          hint="Examples: #contact, tel:+14805550142"
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
      <SelectField
        id="heroImage"
        label="Hero image"
        value={content.hero.imageSrc}
        options={assetOptions}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.imageSrc = value;
          })
        }
      />
      <TextField
        id="heroAlt"
        label="Hero image alt text"
        value={content.hero.imageAlt}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.hero.imageAlt = value;
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="heroSupportLabel"
          label="Supporting label"
          value={supporting.label}
          onChange={(value) =>
            onUpdate((draft) => {
              const nextValue = draft.hero.supportingItem?.value ?? "";
              draft.hero.supportingItem =
                value || nextValue ? { label: value, value: nextValue } : undefined;
            })
          }
        />
        <TextField
          id="heroSupportValue"
          label="Supporting value"
          value={supporting.value}
          onChange={(value) =>
            onUpdate((draft) => {
              const nextLabel = draft.hero.supportingItem?.label ?? "";
              draft.hero.supportingItem =
                value || nextLabel ? { label: nextLabel, value } : undefined;
            })
          }
        />
      </div>
    </div>
  );
}

export function ServicesPanel({ content, errors, onUpdate }: PanelProps) {
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
      {errors.services ? (
        <p className="text-sm text-rose-700" role="alert">
          {errors.services}
        </p>
      ) : null}
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
              draft.services = draft.services.filter((_, itemIndex) => itemIndex !== index);
            })
          }
        >
          <TextField
            id={`service-name-${service.id}`}
            label="Name"
            value={service.name}
            error={errors[`services.${index}.name`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const item = draft.services[index];
                if (item) {
                  item.name = value;
                }
              })
            }
          />
          <TextAreaField
            id={`service-desc-${service.id}`}
            label="Short description"
            value={service.shortDescription}
            rows={3}
            error={errors[`services.${index}.shortDescription`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const item = draft.services[index];
                if (item) {
                  item.shortDescription = value;
                }
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id={`service-icon-${service.id}`}
              label="Icon"
              value={service.iconId ?? ""}
              options={[
                { value: "", label: "None" },
                ...SERVICE_ICON_OPTIONS,
              ]}
              onChange={(value) =>
                onUpdate((draft) => {
                  const item = draft.services[index];
                  if (item) {
                    item.iconId = value
                      ? (value as (typeof SERVICE_ICON_OPTIONS)[number]["value"])
                      : undefined;
                  }
                })
              }
            />
            <TextField
              id={`service-href-${service.id}`}
              label="Link"
              value={service.href ?? ""}
              error={errors[`services.${index}.href`]}
              onChange={(value) =>
                onUpdate((draft) => {
                  const item = draft.services[index];
                  if (item) {
                    item.href = value || undefined;
                  }
                })
              }
            />
          </div>
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.services.length >= EDITOR_LIMITS.services}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.services.length < EDITOR_LIMITS.services) {
              draft.services.push(createServiceItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add service
      </button>
    </div>
  );
}

export function AboutPanel({ content, errors, onUpdate }: PanelProps) {
  const highlights = content.about.highlights ?? [];

  return (
    <div className="space-y-4">
      <TextField
        id="aboutHeading"
        label="Heading"
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
        label="Body text"
        value={content.about.text}
        error={errors["about.text"]}
        rows={6}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.about.text = value;
          })
        }
      />
      <SelectField
        id="aboutImage"
        label="Image"
        value={content.about.imageSrc}
        options={assetOptions}
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
      {highlights.map((item, index) => (
        <RepeatableCard
          key={item.id}
          title={item.label || item.value}
          index={index}
          total={highlights.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.about.highlights = moveItem(draft.about.highlights ?? [], index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.about.highlights = moveItem(draft.about.highlights ?? [], index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.about.highlights = (draft.about.highlights ?? []).filter(
                (_, itemIndex) => itemIndex !== index,
              );
            })
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`highlight-value-${item.id}`}
              label="Value"
              value={item.value}
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.about.highlights?.[index];
                  if (next) {
                    next.value = value;
                  }
                })
              }
            />
            <TextField
              id={`highlight-label-${item.id}`}
              label="Label"
              value={item.label}
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.about.highlights?.[index];
                  if (next) {
                    next.label = value;
                  }
                })
              }
            />
          </div>
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={highlights.length >= EDITOR_LIMITS.aboutHighlights}
        onClick={() =>
          onUpdate((draft) => {
            draft.about.highlights = [
              ...(draft.about.highlights ?? []),
              createHighlightItem(),
            ];
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add highlight
      </button>
    </div>
  );
}

export function WhyChooseUsPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="whyEyebrow"
          label="Section eyebrow"
          value={content.sections.whyChooseUs.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.whyChooseUs.eyebrow = value;
            })
          }
        />
        <TextField
          id="whyHeading"
          label="Section heading"
          value={content.sections.whyChooseUs.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.whyChooseUs.heading = value;
            })
          }
        />
      </div>
      {content.whyChooseUs.map((item, index) => (
        <RepeatableCard
          key={item.id}
          title={item.title}
          index={index}
          total={content.whyChooseUs.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.whyChooseUs = moveItem(draft.whyChooseUs, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.whyChooseUs = moveItem(draft.whyChooseUs, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.whyChooseUs = draft.whyChooseUs.filter(
                (_, itemIndex) => itemIndex !== index,
              );
            })
          }
        >
          <TextField
            id={`why-title-${item.id}`}
            label="Title"
            value={item.title}
            error={errors[`whyChooseUs.${index}.title`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.whyChooseUs[index];
                if (next) {
                  next.title = value;
                }
              })
            }
          />
          <TextAreaField
            id={`why-desc-${item.id}`}
            label="Description"
            value={item.description}
            rows={3}
            error={errors[`whyChooseUs.${index}.description`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.whyChooseUs[index];
                if (next) {
                  next.description = value;
                }
              })
            }
          />
          <SelectField
            id={`why-icon-${item.id}`}
            label="Icon"
            value={item.iconId ?? ""}
            options={[{ value: "", label: "None" }, ...WHY_ICON_OPTIONS]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.whyChooseUs[index];
                if (next) {
                  next.iconId = value
                    ? (value as (typeof WHY_ICON_OPTIONS)[number]["value"])
                    : undefined;
                }
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.whyChooseUs.length >= EDITOR_LIMITS.whyChooseUs}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.whyChooseUs.length < EDITOR_LIMITS.whyChooseUs) {
              draft.whyChooseUs.push(createWhyItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add item
      </button>
    </div>
  );
}

export function GalleryPanel({ content, errors, onUpdate }: PanelProps) {
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
              draft.gallery = draft.gallery.filter((_, itemIndex) => itemIndex !== index);
            })
          }
        >
          <SelectField
            id={`gallery-image-${item.id}`}
            label="Image"
            value={item.imageSrc}
            options={assetOptions}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.gallery[index];
                if (next) {
                  next.imageSrc = value;
                }
              })
            }
          />
          <TextField
            id={`gallery-alt-${item.id}`}
            label="Alt text"
            value={item.alt}
            error={errors[`gallery.${index}.alt`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.gallery[index];
                if (next) {
                  next.alt = value;
                }
              })
            }
          />
          <TextField
            id={`gallery-caption-${item.id}`}
            label="Caption"
            value={item.caption ?? ""}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.gallery[index];
                if (next) {
                  next.caption = value;
                }
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.gallery.length >= EDITOR_LIMITS.gallery}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.gallery.length < EDITOR_LIMITS.gallery) {
              draft.gallery.push(
                createGalleryItem(SERVICE_MODERN_01_DEMO_ASSETS[0]?.src ?? ""),
              );
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add gallery item
      </button>
    </div>
  );
}

export function TestimonialsPanel({ content, errors, onUpdate }: PanelProps) {
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
      <FieldHint>
        Keep this tasteful. Do not add Google review widgets or scraped reviews.
      </FieldHint>
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
              draft.testimonials = draft.testimonials.filter(
                (_, itemIndex) => itemIndex !== index,
              );
            })
          }
        >
          <TextField
            id={`testimonial-name-${item.id}`}
            label="Customer name"
            value={item.customerName}
            error={errors[`testimonials.${index}.customerName`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.testimonials[index];
                if (next) {
                  next.customerName = value;
                }
              })
            }
          />
          <TextAreaField
            id={`testimonial-quote-${item.id}`}
            label="Quote"
            value={item.quote}
            rows={3}
            error={errors[`testimonials.${index}.quote`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.testimonials[index];
                if (next) {
                  next.quote = value;
                }
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id={`testimonial-rating-${item.id}`}
              label="Rating"
              value={item.rating ? String(item.rating) : ""}
              error={errors[`testimonials.${index}.rating`]}
              options={[
                { value: "", label: "None" },
                { value: "5", label: "5" },
                { value: "4", label: "4" },
                { value: "3", label: "3" },
                { value: "2", label: "2" },
                { value: "1", label: "1" },
              ]}
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.testimonials[index];
                  if (next) {
                    next.rating = value
                      ? (Number(value) as 1 | 2 | 3 | 4 | 5)
                      : undefined;
                  }
                })
              }
            />
            <TextField
              id={`testimonial-source-${item.id}`}
              label="Source label"
              value={item.sourceLabel ?? ""}
              hint="Example: Mesa homeowner"
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.testimonials[index];
                  if (next) {
                    next.sourceLabel = value;
                  }
                })
              }
            />
          </div>
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.testimonials.length >= EDITOR_LIMITS.testimonials}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.testimonials.length < EDITOR_LIMITS.testimonials) {
              draft.testimonials.push(createTestimonialItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add testimonial
      </button>
    </div>
  );
}

export function ServiceAreasPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="areasEyebrow"
          label="Section eyebrow"
          value={content.sections.serviceAreas.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.serviceAreas.eyebrow = value;
            })
          }
        />
        <TextField
          id="areasHeading"
          label="Section heading"
          value={content.sections.serviceAreas.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.serviceAreas.heading = value;
            })
          }
        />
      </div>
      {content.serviceAreas.map((area, index) => (
        <RepeatableCard
          key={`${area}-${index}`}
          title={area}
          index={index}
          total={content.serviceAreas.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.serviceAreas = moveItem(draft.serviceAreas, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.serviceAreas = moveItem(draft.serviceAreas, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.serviceAreas = draft.serviceAreas.filter(
                (_, itemIndex) => itemIndex !== index,
              );
            })
          }
        >
          <TextField
            id={`area-${index}`}
            label="Area"
            value={area}
            error={errors[`serviceAreas.${index}`]}
            onChange={(value) =>
              onUpdate((draft) => {
                draft.serviceAreas[index] = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.serviceAreas.length >= EDITOR_LIMITS.serviceAreas}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.serviceAreas.length < EDITOR_LIMITS.serviceAreas) {
              draft.serviceAreas.push("");
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add area
      </button>
    </div>
  );
}

export function FaqPanel({ content, errors, onUpdate }: PanelProps) {
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
              draft.faq = draft.faq.filter((_, itemIndex) => itemIndex !== index);
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
                if (next) {
                  next.question = value;
                }
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
                if (next) {
                  next.answer = value;
                }
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.faq.length >= EDITOR_LIMITS.faq}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.faq.length < EDITOR_LIMITS.faq) {
              draft.faq.push(createFaqItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add FAQ
      </button>
    </div>
  );
}

export function ContactPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted">
        Phone, email, address, and hours are edited in Business and shown here
        on the website. This panel is for contact copy and the contact CTA.
      </p>
      <TextField
        id="contactEyebrow"
        label="Eyebrow"
        value={content.sections.contact.eyebrow}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.sections.contact.eyebrow = value;
          })
        }
      />
      <TextField
        id="contactHeading"
        label="Heading"
        value={content.sections.contact.heading}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.sections.contact.heading = value;
          })
        }
      />
      <TextAreaField
        id="contactIntro"
        label="Intro"
        value={content.sections.contact.intro}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.sections.contact.intro = value;
          })
        }
      />
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
    </div>
  );
}

const SOCIAL_NETWORKS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

export function SocialPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <FieldHint>
        Leave a URL blank to hide that network. Empty links are not rendered.
      </FieldHint>
      {SOCIAL_NETWORKS.map((network) => {
        const existing = content.socialLinks.find((link) => link.id === network.id);
        return (
          <TextField
            key={network.id}
            id={`social-${network.id}`}
            label={network.label}
            type="url"
            value={existing?.href ?? ""}
            error={errors[`socialLinks.${content.socialLinks.findIndex((link) => link.id === network.id)}.href`]}
            placeholder={`https://${network.id}.com/...`}
            onChange={(value) =>
              onUpdate((draft) => {
                const remaining = draft.socialLinks.filter(
                  (link) => link.id !== network.id,
                );
                if (value.trim()) {
                  remaining.push({
                    id: network.id,
                    label: network.label,
                    href: value,
                  });
                }
                const order = ["facebook", "instagram", "linkedin"] as const;
                draft.socialLinks = order.flatMap((id) => {
                  const match = remaining.find((link) => link.id === id);
                  return match ? [match] : [];
                });
              })
            }
          />
        );
      })}
    </div>
  );
}

export function VisibilityPanel({ content, onUpdate }: PanelProps) {
  const toggles = [
    { key: "trustStrip", label: "Trust strip" },
    { key: "whyChooseUs", label: "Why choose us" },
    { key: "about", label: "About" },
    { key: "gallery", label: "Gallery" },
    { key: "testimonials", label: "Testimonials" },
    { key: "serviceAreas", label: "Service areas" },
    { key: "faq", label: "FAQ" },
    { key: "finalCta", label: "Final CTA" },
  ] as const;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted">
        Header, hero, services, contact, and footer stay on so the page remains
        a complete website.
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
      {content.sectionVisibility.finalCta ? (
        <div className="grid gap-4">
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
      ) : null}
    </div>
  );
}
