"use client";

import type { ComponentProps } from "react";
import { RESTAURANT_MODERN_01_DEMO_ASSETS } from "@/lib/templates/demo-assets";
import {
  createFaqItem,
  createGalleryItem,
  createTestimonialItem,
  moveItem,
  type EditorErrors,
} from "@/lib/templates/editor";
import {
  RESTAURANT_EDITOR_LIMITS,
  createFeaturedDish,
  createMenuCategory,
  createMenuItem,
} from "@/lib/templates/restaurant-editor";
import type { RestaurantWebsiteContent } from "@/lib/templates/types";
import { RepeatableCard } from "./RepeatableCard";
import { ImagePickerField } from "./ImagePickerField";
import {
  ColorField,
  FieldError,
  FieldHint,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";

export type RestaurantEditorUpdate = (
  updater: (draft: RestaurantWebsiteContent) => void,
) => void;

type PanelProps = {
  content: RestaurantWebsiteContent;
  errors: EditorErrors;
  onUpdate: RestaurantEditorUpdate;
};

const HERO_IMAGE = "/templates/restaurant-modern-01/hero.jpg";
const INTRO_IMAGE = "/templates/restaurant-modern-01/intro.jpg";
const STORY_IMAGE = "/templates/restaurant-modern-01/story.jpg";
const FEATURED_IMAGE = "/templates/restaurant-modern-01/featured-branzino.jpg";
const GALLERY_IMAGE = "/templates/restaurant-modern-01/gallery-table.jpg";

function RestaurantImagePicker(
  props: Omit<ComponentProps<typeof ImagePickerField>, "demoAssets">,
) {
  return (
    <ImagePickerField
      {...props}
      demoAssets={RESTAURANT_MODERN_01_DEMO_ASSETS}
    />
  );
}

export function RestaurantBusinessPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <TextField
        id="restaurantName"
        label="Restaurant name"
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
        label="Restaurant hours"
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

export function RestaurantBrandingPanel({ content, errors, onUpdate }: PanelProps) {
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
      <RestaurantImagePicker
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
              draft.branding.secondaryColor = value || undefined;
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
          label="Surface / section color"
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

export function RestaurantHeroPanel({ content, errors, onUpdate }: PanelProps) {
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
          hint="Examples: #reserve, #menu, tel:+14805550177"
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
      <RestaurantImagePicker
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
              draft.hero.supportingItem = {
                label: value,
                value: draft.hero.supportingItem?.value ?? "",
              };
            })
          }
        />
        <TextField
          id="heroSupportValue"
          label="Supporting value"
          value={supporting.value}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.hero.supportingItem = {
                label: draft.hero.supportingItem?.label ?? "",
                value,
              };
            })
          }
        />
      </div>
    </div>
  );
}

export function RestaurantIntroPanel({ content, errors, onUpdate }: PanelProps) {
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
      <RestaurantImagePicker
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

export function RestaurantFeaturedPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="featuredEyebrow"
          label="Section eyebrow"
          value={content.sections.featured.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.featured.eyebrow = value;
            })
          }
        />
        <TextField
          id="featuredHeading"
          label="Section heading"
          value={content.sections.featured.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.featured.heading = value;
            })
          }
        />
      </div>
      {content.featuredDishes.map((dish, index) => (
        <RepeatableCard
          key={dish.id}
          title={dish.name}
          index={index}
          total={content.featuredDishes.length}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.featuredDishes = moveItem(draft.featuredDishes, index, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.featuredDishes = moveItem(draft.featuredDishes, index, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              draft.featuredDishes = draft.featuredDishes.filter(
                (_, itemIndex) => itemIndex !== index,
              );
            })
          }
        >
          <TextField
            id={`featured-name-${dish.id}`}
            label="Dish name"
            value={dish.name}
            error={errors[`featuredDishes.${index}.name`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.featuredDishes[index];
                if (next) next.name = value;
              })
            }
          />
          <TextAreaField
            id={`featured-desc-${dish.id}`}
            label="Description"
            value={dish.description}
            rows={3}
            error={errors[`featuredDishes.${index}.description`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.featuredDishes[index];
                if (next) next.description = value;
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`featured-price-${dish.id}`}
              label="Price"
              value={dish.price}
              error={errors[`featuredDishes.${index}.price`]}
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.featuredDishes[index];
                  if (next) next.price = value;
                })
              }
            />
            <TextField
              id={`featured-tag-${dish.id}`}
              label="Tag"
              value={dish.tag ?? ""}
              hint="Optional. Example: Popular"
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.featuredDishes[index];
                  if (next) next.tag = value;
                })
              }
            />
          </div>
          <RestaurantImagePicker
            id={`featured-image-${dish.id}`}
            label="Dish image"
            value={dish.imageSrc}
            templateFallbackSrc={FEATURED_IMAGE}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.featuredDishes[index];
                if (next) next.imageSrc = value;
              })
            }
          />
          <TextField
            id={`featured-alt-${dish.id}`}
            label="Image alt text"
            value={dish.imageAlt}
            error={errors[`featuredDishes.${index}.imageAlt`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.featuredDishes[index];
                if (next) next.imageAlt = value;
              })
            }
          />
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.featuredDishes.length >= RESTAURANT_EDITOR_LIMITS.featuredDishes}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.featuredDishes.length < RESTAURANT_EDITOR_LIMITS.featuredDishes) {
              draft.featuredDishes.push(createFeaturedDish(FEATURED_IMAGE));
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add featured dish
      </button>
    </div>
  );
}

export function RestaurantMenuPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="menuEyebrow"
          label="Section eyebrow"
          value={content.sections.menu.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.menu.eyebrow = value;
            })
          }
        />
        <TextField
          id="menuHeading"
          label="Section heading"
          value={content.sections.menu.heading}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.menu.heading = value;
            })
          }
        />
      </div>
      <FieldHint>
        Structured menu only. This is display content — no ordering or checkout.
      </FieldHint>
      <FieldError message={errors.menu} />
      {content.menu.map((category, categoryIndex) => (
        <RepeatableCard
          key={category.id}
          title={category.name || `Category ${categoryIndex + 1}`}
          index={categoryIndex}
          total={content.menu.length}
          disableRemove={content.menu.length <= 1}
          onMoveUp={() =>
            onUpdate((draft) => {
              draft.menu = moveItem(draft.menu, categoryIndex, -1);
            })
          }
          onMoveDown={() =>
            onUpdate((draft) => {
              draft.menu = moveItem(draft.menu, categoryIndex, 1);
            })
          }
          onRemove={() =>
            onUpdate((draft) => {
              if (draft.menu.length <= 1) return;
              draft.menu = draft.menu.filter((_, index) => index !== categoryIndex);
            })
          }
        >
          <TextField
            id={`menu-cat-${category.id}`}
            label="Category name"
            value={category.name}
            error={errors[`menu.${categoryIndex}.name`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.menu[categoryIndex];
                if (next) next.name = value;
              })
            }
          />
          {category.items.map((item, itemIndex) => (
            <RepeatableCard
              key={item.id}
              title={item.name || `Item ${itemIndex + 1}`}
              index={itemIndex}
              total={category.items.length}
              onMoveUp={() =>
                onUpdate((draft) => {
                  const next = draft.menu[categoryIndex];
                  if (next) next.items = moveItem(next.items, itemIndex, -1);
                })
              }
              onMoveDown={() =>
                onUpdate((draft) => {
                  const next = draft.menu[categoryIndex];
                  if (next) next.items = moveItem(next.items, itemIndex, 1);
                })
              }
              onRemove={() =>
                onUpdate((draft) => {
                  const next = draft.menu[categoryIndex];
                  if (next) {
                    next.items = next.items.filter((_, index) => index !== itemIndex);
                  }
                })
              }
            >
              <TextField
                id={`menu-item-name-${item.id}`}
                label="Item name"
                value={item.name}
                error={errors[`menu.${categoryIndex}.items.${itemIndex}.name`]}
                onChange={(value) =>
                  onUpdate((draft) => {
                    const next = draft.menu[categoryIndex]?.items[itemIndex];
                    if (next) next.name = value;
                  })
                }
              />
              <TextAreaField
                id={`menu-item-desc-${item.id}`}
                label="Description"
                value={item.description}
                rows={2}
                onChange={(value) =>
                  onUpdate((draft) => {
                    const next = draft.menu[categoryIndex]?.items[itemIndex];
                    if (next) next.description = value;
                  })
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id={`menu-item-price-${item.id}`}
                  label="Price"
                  value={item.price}
                  error={errors[`menu.${categoryIndex}.items.${itemIndex}.price`]}
                  onChange={(value) =>
                    onUpdate((draft) => {
                      const next = draft.menu[categoryIndex]?.items[itemIndex];
                      if (next) next.price = value;
                    })
                  }
                />
                <TextField
                  id={`menu-item-tag-${item.id}`}
                  label="Tag"
                  value={item.tag ?? ""}
                  hint="Optional. Popular, Vegetarian, Spicy"
                  onChange={(value) =>
                    onUpdate((draft) => {
                      const next = draft.menu[categoryIndex]?.items[itemIndex];
                      if (next) next.tag = value;
                    })
                  }
                />
              </div>
            </RepeatableCard>
          ))}
          <button
            type="button"
            disabled={
              category.items.length >= RESTAURANT_EDITOR_LIMITS.menuItemsPerCategory
            }
            onClick={() =>
              onUpdate((draft) => {
                const next = draft.menu[categoryIndex];
                if (
                  next &&
                  next.items.length < RESTAURANT_EDITOR_LIMITS.menuItemsPerCategory
                ) {
                  next.items.push(createMenuItem());
                }
              })
            }
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
          >
            Add menu item
          </button>
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.menu.length >= RESTAURANT_EDITOR_LIMITS.menuCategories}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.menu.length < RESTAURANT_EDITOR_LIMITS.menuCategories) {
              draft.menu.push(createMenuCategory());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add menu category
      </button>
    </div>
  );
}

export function RestaurantStoryPanel({ content, errors, onUpdate }: PanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="storyEyebrow"
          label="Section eyebrow"
          value={content.sections.about.eyebrow}
          onChange={(value) =>
            onUpdate((draft) => {
              draft.sections.about.eyebrow = value;
            })
          }
        />
        <TextField
          id="storySectionHeading"
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
        id="storyHeading"
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
        id="storyText"
        label="Story copy"
        value={content.about.text}
        error={errors["about.text"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.about.text = value;
          })
        }
      />
      <RestaurantImagePicker
        id="storyImage"
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
        id="storyAlt"
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

export function RestaurantGalleryPanel({ content, errors, onUpdate }: PanelProps) {
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
          <RestaurantImagePicker
            id={`gallery-image-${item.id}`}
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
            id={`gallery-alt-${item.id}`}
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
            id={`gallery-caption-${item.id}`}
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
        disabled={content.gallery.length >= RESTAURANT_EDITOR_LIMITS.gallery}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.gallery.length < RESTAURANT_EDITOR_LIMITS.gallery) {
              draft.gallery.push(createGalleryItem(GALLERY_IMAGE));
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

export function RestaurantTestimonialsPanel({
  content,
  errors,
  onUpdate,
}: PanelProps) {
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
              draft.testimonials = draft.testimonials.filter(
                (_, itemIndex) => itemIndex !== index,
              );
            })
          }
        >
          <TextField
            id={`testimonial-name-${item.id}`}
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
            id={`testimonial-quote-${item.id}`}
            label="Quote"
            value={item.quote}
            rows={3}
            error={errors[`testimonials.${index}.quote`]}
            onChange={(value) =>
              onUpdate((draft) => {
                const next = draft.testimonials[index];
                if (next) next.quote = value;
              })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id={`testimonial-rating-${item.id}`}
              label="Rating"
              value={item.rating ? String(item.rating) : ""}
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
                  if (!next) return;
                  const numeric = Number(value);
                  next.rating =
                    numeric === 1 || numeric === 2 || numeric === 3 || numeric === 4 || numeric === 5
                      ? numeric
                      : undefined;
                })
              }
            />
            <TextField
              id={`testimonial-source-${item.id}`}
              label="Source label"
              value={item.sourceLabel ?? ""}
              onChange={(value) =>
                onUpdate((draft) => {
                  const next = draft.testimonials[index];
                  if (next) next.sourceLabel = value;
                })
              }
            />
          </div>
        </RepeatableCard>
      ))}
      <button
        type="button"
        disabled={content.testimonials.length >= RESTAURANT_EDITOR_LIMITS.testimonials}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.testimonials.length < RESTAURANT_EDITOR_LIMITS.testimonials) {
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

export function RestaurantFaqPanel({ content, errors, onUpdate }: PanelProps) {
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
        disabled={content.faq.length >= RESTAURANT_EDITOR_LIMITS.faq}
        onClick={() =>
          onUpdate((draft) => {
            if (draft.faq.length < RESTAURANT_EDITOR_LIMITS.faq) {
              draft.faq.push(createFaqItem());
            }
          })
        }
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground disabled:opacity-40"
      >
        Add FAQ item
      </button>
    </div>
  );
}

export function RestaurantContactPanel({ content, errors, onUpdate }: PanelProps) {
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
        hint="Usually tel: or #menu. Address, hours, phone, and email sync from Restaurant info."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.contact.cta.href = value;
          })
        }
      />
      <TextField
        id="reservationLabel"
        label="Reservation button label"
        value={content.reservation.label}
        error={errors["reservation.label"]}
        onChange={(value) =>
          onUpdate((draft) => {
            draft.reservation.label = value;
          })
        }
      />
      <TextField
        id="reservationHref"
        label="Reservation link"
        value={content.reservation.href}
        error={errors["reservation.href"]}
        hint="Optional external URL. Leave blank to use Call Us / Location instead. No OpenTable, Resy, or booking backend."
        onChange={(value) =>
          onUpdate((draft) => {
            draft.reservation.href = value;
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
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

export function RestaurantSocialPanel({ content, errors, onUpdate }: PanelProps) {
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

export function RestaurantVisibilityPanel({ content, onUpdate }: PanelProps) {
  const toggles = [
    { key: "intro", label: "Introduction" },
    { key: "featured", label: "Featured dishes" },
    { key: "about", label: "Our Story" },
    { key: "gallery", label: "Gallery" },
    { key: "testimonials", label: "Testimonials" },
    { key: "faq", label: "FAQ" },
    { key: "finalCta", label: "Reservation CTA" },
  ] as const;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted">
        Header, hero, menu, location, and footer stay on so the page remains a
        complete restaurant website.
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
