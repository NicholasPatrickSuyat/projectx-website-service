import type {
  BillingStatus,
  ServiceModel,
  SupportPriority,
  WebsiteStatus,
} from "@/lib/demo-data";
import type {
  ClientCategory,
  ClientPlan,
  ClientServiceModel,
  ClientStatus,
} from "@/lib/domain";
import {
  CLIENT_CATEGORY_LABELS,
  CLIENT_PLAN_LABELS,
  CLIENT_SERVICE_MODEL_SHORT_LABELS,
  CLIENT_STATUS_LABELS,
} from "@/lib/domain";

const WEBSITE_STATUS_CLASS: Record<WebsiteStatus, string> = {
  Setup: "bg-slate-100 text-slate-800",
  Building: "bg-sky-50 text-sky-900",
  "Awaiting Approval": "bg-amber-50 text-amber-900",
  "Ready to Publish": "bg-indigo-50 text-indigo-900",
  Live: "bg-emerald-50 text-emerald-900",
  Maintenance: "bg-teal-50 text-teal-900",
};

const BILLING_STATUS_CLASS: Record<BillingStatus, string> = {
  Active: "bg-emerald-50 text-emerald-900",
  "Past Due": "bg-amber-50 text-amber-900",
  "Cancellation Scheduled": "bg-slate-100 text-slate-800",
};

const PRIORITY_CLASS: Record<SupportPriority, string> = {
  "Highest Priority": "bg-rose-50 text-rose-900",
  Priority: "bg-amber-50 text-amber-900",
  Standard: "bg-slate-100 text-slate-800",
};

const CLIENT_STATUS_CLASS: Record<ClientStatus, string> = {
  LEAD: "bg-sky-50 text-sky-900",
  ACTIVE: "bg-emerald-50 text-emerald-900",
  INACTIVE: "bg-slate-100 text-slate-800",
};

type StatusBadgeProps =
  | { kind: "website"; value: WebsiteStatus }
  | { kind: "billing"; value: BillingStatus }
  | { kind: "model"; value: ServiceModel }
  | { kind: "priority"; value: SupportPriority }
  | { kind: "clientStatus"; value: ClientStatus }
  | { kind: "clientCategory"; value: ClientCategory }
  | { kind: "serviceModel"; value: ClientServiceModel }
  | { kind: "plan"; value: ClientPlan };

export function StatusBadge(props: StatusBadgeProps) {
  if (props.kind === "model") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
        Model {props.value}
      </span>
    );
  }

  if (props.kind === "serviceModel") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
        {CLIENT_SERVICE_MODEL_SHORT_LABELS[props.value]}
      </span>
    );
  }

  if (props.kind === "clientCategory") {
    return (
      <span className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">
        {CLIENT_CATEGORY_LABELS[props.value]}
      </span>
    );
  }

  if (props.kind === "plan") {
    return (
      <span className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">
        {CLIENT_PLAN_LABELS[props.value]}
      </span>
    );
  }

  if (props.kind === "clientStatus") {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${CLIENT_STATUS_CLASS[props.value]}`}
      >
        {CLIENT_STATUS_LABELS[props.value]}
      </span>
    );
  }

  const className =
    props.kind === "website"
      ? WEBSITE_STATUS_CLASS[props.value]
      : props.kind === "billing"
        ? BILLING_STATUS_CLASS[props.value]
        : PRIORITY_CLASS[props.value];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {props.value}
    </span>
  );
}
