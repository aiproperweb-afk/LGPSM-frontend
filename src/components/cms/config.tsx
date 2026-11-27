import DashboardLabelsField from "./DashboardLabelsField";
import type { Config, SelectField, TextField, TextareaField } from "@puckeditor/core";
import ContactContent from "@/components/landing/ContactContent";
import { contactCopy } from "./contactContent";
import type { CmsComponents } from "./types";
import HeroSection from "@/components/HeroSection";
import StatsClients from "@/components/landing/StatsClients";
import PainPoints from "@/components/landing/PainPoints";
import StepsCarousel from "@/components/landing/StepsCarousel";
import FeatureRows from "@/components/landing/FeatureRows";
import EventDay from "@/components/landing/EventDay";
import ReportsSection from "@/components/landing/ReportsSection";
import UseCases from "@/components/landing/UseCases";
import PricingLanding from "@/components/landing/PricingLanding";
import SecuritySection from "@/components/landing/SecuritySection";
import FaqLanding from "@/components/landing/FaqLanding";
import { homeContent } from "./homeContent";
import { approvedDestinations } from "./approvedContent";
import { bulletField, imageReferenceField } from "./fields";

const text: TextField = { type: "text" };
const paragraph: TextareaField = { type: "textarea" };
const destination: SelectField = { type: "select", options: approvedDestinations };
const sectionCopy = { heading: text, description: paragraph };
const button = { buttonLabel: text, buttonHref: destination };
const image = { image: imageReferenceField, imageAlt: { ...text, label: "Image alt text" } };

export const cmsConfig: Config<CmsComponents> = {
  root: { fields: {} },
  components: {
    DashboardCopy: {
      label: "Tab text",
      defaultProps: { labels: {} },
      fields: {
        labels: { type: "custom", label: "Editable text", render: props => <DashboardLabelsField {...props} /> },
      },
      render: ({ labels }) => (
        <section className="mx-auto grid max-w-2xl gap-3 p-6 text-sm">
          {Object.entries(labels).map(([key, text]) => <p key={key} className="border-b border-gray-100 pb-2">{text}</p>)}
        </section>
      ),
    },
    ContactContent: {
      label: "Contact page",
      fields: { pageHeading: text, informationHeading: text, formHeading: text, introduction: paragraph, submitLabel: text },
      defaultProps: contactCopy,
      render: ({ pageHeading, informationHeading, formHeading, introduction, submitLabel }) => (
        <ContactContent pageHeading={pageHeading} informationHeading={informationHeading}
          formHeading={formHeading} introduction={introduction} submitLabel={submitLabel} />
      ),
    },
    HeroSection: {
      label: "Hero",
      fields: {
        badge: text,
        ...sectionCopy,
        primaryLabel: text,
        primaryHref: destination,
        secondaryLabel: text,
        secondaryHref: destination,
        note: text,
        ...image,
      },
      defaultProps: homeContent.HeroSection,
      render: (props) => <HeroSection {...props} />,
    },
    StatsClients: {
      label: "Stats and clients",
      fields: {
        heading: text,
        stats: {
          type: "array", min: 4, max: 4,
          arrayFields: { label: text, value: text },
          getItemSummary: (item) => item.label,
        },
      },
      defaultProps: homeContent.StatsClients,
      render: (props) => <StatsClients {...props} />,
    },
    PainPoints: {
      label: "Pain points",
      fields: sectionCopy,
      defaultProps: homeContent.PainPoints,
      render: (props) => <PainPoints {...props} />,
    },
    StepsCarousel: {
      label: "How it works",
      fields: {
        ...sectionCopy,
        ...button,
        steps: {
          type: "array", min: 5, max: 5,
          arrayFields: { title: text, body: paragraph, ...image },
          getItemSummary: (item) => item.title,
        },
      },
      defaultProps: homeContent.StepsCarousel,
      render: ({ heading, description, buttonLabel, buttonHref, steps }) => (
        <StepsCarousel heading={heading} description={description} buttonLabel={buttonLabel} buttonHref={buttonHref} steps={steps} />
      ),
    },
    FeatureRows: {
      label: "Features",
      fields: {
        ...sectionCopy,
        features: {
          type: "array", min: 6, max: 6,
          arrayFields: { tag: text, title: text, desc: paragraph, ...image, bullets: bulletField },
          getItemSummary: (item) => item.tag,
        },
      },
      defaultProps: homeContent.FeatureRows,
      render: (props) => <FeatureRows {...props} />,
    },
    EventDay: {
      label: "Event day",
      fields: { ...sectionCopy, details: paragraph, ...image, ...button },
      defaultProps: homeContent.EventDay,
      render: (props) => <EventDay {...props} />,
    },
    ReportsSection: {
      label: "Reports",
      fields: { ...sectionCopy, details: paragraph, ...image, ...button },
      defaultProps: homeContent.ReportsSection,
      render: (props) => <ReportsSection {...props} />,
    },
    UseCases: {
      label: "Use cases",
      fields: { ...sectionCopy, ...button },
      defaultProps: homeContent.UseCases,
      render: (props) => <UseCases {...props} />,
    },
    PricingLanding: {
      label: "Pricing",
      fields: {
        ...sectionCopy,
        signupLabel: text,
        signupHref: destination,
        contactLabel: text,
        contactHref: destination,
        volumeHeading: text,
        volumeDescription: paragraph,
      },
      defaultProps: homeContent.PricingLanding,
      render: (props) => <PricingLanding {...props} />,
    },
    SecuritySection: {
      label: "Security",
      fields: sectionCopy,
      defaultProps: homeContent.SecuritySection,
      render: (props) => <SecuritySection {...props} />,
    },
    FaqLanding: {
      label: "FAQs",
      fields: {
        heading: text,
        ...button,
        questions: {
          type: "array", min: 10, max: 10,
          arrayFields: { q: { ...text, label: "Question" }, a: { ...paragraph, label: "Answer" } },
          getItemSummary: (item) => item.q,
        },
      },
      defaultProps: homeContent.FaqLanding,
      render: ({ heading, buttonLabel, buttonHref, questions }) => (
        <FaqLanding heading={heading} buttonLabel={buttonLabel} buttonHref={buttonHref} questions={questions} />
      ),
    },
  },
};
