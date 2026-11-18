import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import legacyLogo from "./assets/legacy-air-logo.png";
import casLogo from "./assets/cas-logo.png";
import pasLogo from "./assets/pas-logo.png";
import torchHandlePhoto from "./assets/oxy-fuel-torch-handle.jpg";
import torchPhoto from "./assets/oxy-fuel-torch-portrait.jpg";
import torchPreviewPhoto from "./assets/oxy-fuel-torch-preview.jpg";
import torchTipPhoto from "./assets/oxy-fuel-torch-tip.jpg";

const assetPhotos = [
  {
    src: torchPhoto,
    label: "Full asset",
    alt: "Oxy-fuel heating torch photographed vertically on a concrete floor",
  },
  {
    src: torchHandlePhoto,
    label: "Handle detail",
    alt: "Detail of the heating torch handle, valves, and connectors",
  },
  {
    src: torchTipPhoto,
    label: "Torch tip",
    alt: "Detail of the heating torch neck and tip",
  },
];

type Screen =
  | "signin"
  | "home"
  | "scanner"
  | "asset"
  | "history"
  | "inspection"
  | "inspection-success"
  | "success"
  | "registry"
  | "profile";
type AssetAction = "custody" | "location";
type DestinationType = "Employee" | "Truck" | "Project" | "Warehouse";
type IssueType = "Damage" | "Missing" | null;
type InspectionCondition = "Good" | "Fair" | "Damaged" | "Unusable";
type InspectionResult = {
  condition: InspectionCondition;
  notes: string;
  photoName: string;
  completedAt: string;
};
type TransferOutcome = {
  action: AssetAction;
  name: string;
  detail: string;
  badge: string;
};
type IconName =
  | "arrow-left"
  | "arrow-right"
  | "box"
  | "briefcase"
  | "building"
  | "camera"
  | "check"
  | "chevron"
  | "flash"
  | "grid"
  | "help"
  | "home"
  | "map-pin"
  | "menu"
  | "person"
  | "search"
  | "truck"
  | "warehouse"
  | "warning"
  | "x";

const paths: Record<IconName, React.ReactNode> = {
  "arrow-left": <path d="M19 12H5m6-6-6 6 6 6" />,
  "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
  box: (
    <>
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Zm8 4v10" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5l8-3v19m0-13h8v13M8 7v1m0 3v1m0 3v1m8-4v1m0 3v1M2 21h20" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 5 13 3H8L6.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-5.5Z" />
      <circle cx="11" cy="12.5" r="4" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  flash: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 3.3 2.2c-.8.4-1.1.9-1.1 1.8m0 3.5h.01" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v11H3zM14 10h4l3 4v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  warehouse: (
    <>
      <path d="m3 9 9-6 9 6v12H3V9Z" />
      <path d="M7 21v-8h10v8M7 16h10" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.8 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const tools = [
  {
    tag: "CAS-04217",
    name: "Oxy-Fuel Heating Torch",
    model: "Field torch assembly",
    place: "Truck 104",
    status: "Due back",
    company: "CAS",
  },
  {
    tag: "PAS-01842",
    name: "Digital Manifold Kit",
    model: "Fieldpiece SM480V",
    place: "Midtown Tower",
    status: "Active",
    company: "PAS",
  },
  {
    tag: "CAS-03891",
    name: "Rotary Hammer",
    model: "Milwaukee 2912-20",
    place: "Truck 104",
    status: "Active",
    company: "CAS",
  },
];

const registry = [
  ...tools,
  {
    tag: "PAS-02104",
    name: "Recovery Machine",
    model: "Appion G5Twin",
    place: "PAS Warehouse",
    status: "In repair",
    company: "PAS",
  },
  {
    tag: "CAS-03028",
    name: "Press Tool",
    model: "RIDGID RP 350",
    place: "Unassigned",
    status: "Missing",
    company: "CAS",
  },
];

type HistoryCategory = "Custody" | "Location" | "Issues" | "Other";
type HistoryEvent = {
  date: string;
  sortDate: string;
  title: string;
  detail: string;
  performedBy: string;
  icon: IconName;
  category: HistoryCategory;
  note?: string;
};

const baseHistoryEvents: HistoryEvent[] = [
  {
    date: "Today · 8:42 AM",
    sortDate: "2026-03-23T08:42:00",
    title: "Asset scanned",
    detail: "Scanned at Truck 104",
    performedBy: "Jordan Davis",
    icon: "camera",
    category: "Other",
  },
  {
    date: "March 20 · 3:16 PM",
    sortDate: "2026-03-20T15:16:00",
    title: "Custody transferred",
    detail: "Marco Ruiz → Jordan Davis",
    performedBy: "Elena Torres",
    icon: "person",
    category: "Custody",
    note: "Handed off at the Midtown loading dock.",
  },
  {
    date: "March 18 · 7:05 AM",
    sortDate: "2026-03-18T07:05:00",
    title: "Location changed",
    detail: "CAS Warehouse → Truck 104",
    performedBy: "Jordan Davis",
    icon: "map-pin",
    category: "Location",
  },
  {
    date: "March 15 · 4:22 PM",
    sortDate: "2026-03-15T16:22:00",
    title: "Condition inspected",
    detail: "Condition confirmed as Good",
    performedBy: "Amanda Lee",
    icon: "check",
    category: "Other",
  },
  {
    date: "February 28 · 11:40 AM",
    sortDate: "2026-02-28T11:40:00",
    title: "Custody transferred",
    detail: "David Kim → Marco Ruiz",
    performedBy: "David Kim",
    icon: "person",
    category: "Custody",
    note: "Transferred after project closeout.",
  },
  {
    date: "February 4 · 9:12 AM",
    sortDate: "2026-02-04T09:12:00",
    title: "Damage report resolved",
    detail: "Battery latch inspected and cleared",
    performedBy: "Sofia Bennett",
    icon: "warning",
    category: "Issues",
  },
  {
    date: "January 20 · 2:08 PM",
    sortDate: "2026-01-20T14:08:00",
    title: "Returned to service",
    detail: "Repair bench → CAS Warehouse",
    performedBy: "Sofia Bennett",
    icon: "warehouse",
    category: "Issues",
  },
  {
    date: "January 12 · 10:30 AM",
    sortDate: "2026-01-12T10:30:00",
    title: "Added to asset registry",
    detail: "Initial asset record created",
    performedBy: "Amanda Lee",
    icon: "box",
    category: "Other",
  },
];

function getHistoryEvents(
  issueType: IssueType,
  inspectionResult: InspectionResult | null = null,
): HistoryEvent[] {
  return [
    ...(inspectionResult
      ? [
          {
            date: "Just now",
            sortDate: "2026-03-23T12:30:00",
            title: "Scheduled inspection completed",
            detail: `Condition recorded as ${inspectionResult.condition}`,
            performedBy: "Jordan Davis",
            icon: "check" as IconName,
            category: "Other" as HistoryCategory,
            note: inspectionResult.notes || undefined,
          },
        ]
      : []),
    ...(issueType
      ? [
          {
            date: "Just now",
            sortDate: "2026-03-23T12:00:00",
            title: issueType === "Missing" ? "Asset marked missing" : "Damage reported",
            detail:
              issueType === "Missing"
                ? "Last known location submitted for investigation"
                : "Damage report submitted for inspection",
            performedBy: "Jordan Davis",
            icon: "warning",
            category: "Issues",
          },
        ]
      : []),
    ...baseHistoryEvents,
  ];
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? "brand-mark--compact" : ""}`}>
      <img src={legacyLogo} alt="Legacy Air" />
      {!compact && <span>Asset Hub</span>}
    </div>
  );
}

function CompanyMark({ company }: { company: "CAS" | "PAS" }) {
  return (
    <span className={`company-mark company-mark--${company.toLowerCase()}`}>
      <span>{company}</span>
    </span>
  );
}

function StatusChip({
  children,
  tone = "active",
}: {
  children: React.ReactNode;
  tone?: "active" | "warn" | "danger" | "neutral";
}) {
  return <span className={`status status--${tone}`}>{children}</span>;
}

function BottomNav({ current, go }: { current: Screen; go: (screen: Screen) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <button className={current === "home" ? "is-active" : ""} onClick={() => go("home")}>
        <Icon name="briefcase" />
        <span>My tools</span>
      </button>
      <button className={current === "registry" ? "is-active" : ""} onClick={() => go("registry")}>
        <Icon name="grid" />
        <span>Registry</span>
      </button>
      <button className={current === "profile" ? "is-active" : ""} onClick={() => go("profile")}>
        <Icon name="person" />
        <span>Account</span>
      </button>
    </nav>
  );
}

function AppHeader({
  title,
  eyebrow,
  back,
  right,
}: {
  title?: string;
  eyebrow?: string;
  back?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <header className="app-header">
      <div className="app-header__side">
        {back ? (
          <button className="icon-button" onClick={back} aria-label="Go back">
            <Icon name="arrow-left" />
          </button>
        ) : (
          <BrandMark compact />
        )}
      </div>
      {(title || eyebrow) && (
        <div className="app-header__title">
          {eyebrow && <span>{eyebrow}</span>}
          <strong>{title}</strong>
        </div>
      )}
      <div className="app-header__side app-header__side--right">{right}</div>
    </header>
  );
}

function SignIn({ onSignIn }: { onSignIn: () => void }) {
  return (
    <main className="signin">
      <div className="signin__safety-line" />
      <section className="signin__brand">
        <BrandMark />
        <div className="signin__title">
          <p>FIELD ASSET CONTROL</p>
          <h1>
            Know what’s where.
            <br />
            Keep work moving.
          </h1>
          <span>One asset platform for CAS + PAS.</span>
        </div>
      </section>
      <section className="signin__actions">
        <button className="button button--primary button--microsoft" onClick={onSignIn}>
          <span className="microsoft-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          Continue with Microsoft
        </button>
        <p>Use your company Microsoft account</p>
        <div
          className="company-lockup"
          aria-label="Commercial Air Systems and Professional Air Systems"
        >
          <img src={casLogo} alt="CAS" />
          <span />
          <img src={pasLogo} alt="PAS" />
        </div>
      </section>
    </main>
  );
}

function ToolRow({
  tool,
  onClick,
  inspectionDue = false,
}: {
  tool: (typeof tools)[number];
  onClick: () => void;
  inspectionDue?: boolean;
}) {
  return (
    <button className="tool-row" onClick={onClick}>
      <div className="tool-row__icon">
        <Icon
          name={
            tool.name.includes("Vacuum")
              ? "box"
              : tool.name.includes("Manifold")
                ? "grid"
                : "briefcase"
          }
        />
      </div>
      <div className="tool-row__content">
        <div className="tool-row__top">
          <span>{tool.tag}</span>
          <CompanyMark company={tool.company as "CAS" | "PAS"} />
          {inspectionDue && <StatusChip tone="warn">Inspection due</StatusChip>}
        </div>
        <strong>{tool.name}</strong>
        <p>
          <Icon name="map-pin" size={15} /> {tool.place}
        </p>
      </div>
      <div className="tool-row__end">
        {tool.status !== "Active" && (
          <StatusChip tone={tool.status === "Missing" ? "danger" : "warn"}>
            {tool.status}
          </StatusChip>
        )}
        <Icon name="chevron" size={19} />
      </div>
    </button>
  );
}

function Home({
  go,
  offline,
  issueType,
  inspectionResult,
  onStartInspection,
  onScan,
}: {
  go: (screen: Screen) => void;
  offline: boolean;
  issueType: IssueType;
  inspectionResult: InspectionResult | null;
  onStartInspection: () => void;
  onScan: () => void;
}) {
  const [ascending, setAscending] = useState(true);
  const visibleTools = tools
    .map((tool) =>
      tool.tag === "CAS-04217" && issueType === "Missing" ? { ...tool, status: "Missing" } : tool,
    )
    .sort((a, b) => (ascending ? a.tag.localeCompare(b.tag) : b.tag.localeCompare(a.tag)));

  return (
    <main className="screen screen--with-nav">
      <AppHeader
        right={
          <button className="avatar" onClick={() => go("profile")}>
            JD
          </button>
        }
      />
      {offline && (
        <div className="offline-bar">
          <span />
          Offline — showing saved tools
        </div>
      )}
      <section className="page-heading">
        <p>MONDAY, MARCH 23</p>
        <h1>My tools</h1>
        <span>3 assets in your custody</span>
      </section>
      {!inspectionResult && issueType !== "Missing" && (
        <button className="inspection-notice" onClick={onStartInspection}>
          <span className="inspection-notice__icon">
            <Icon name="check" size={20} />
          </span>
          <span>
            <strong>1 inspection due today</strong>
            <small>Scan CAS-04217 to complete it</small>
          </span>
          <span className="inspection-notice__action">
            Scan <Icon name="chevron" size={17} />
          </span>
        </button>
      )}
      <button
        className={`home-alert ${issueType === "Missing" ? "home-alert--danger" : ""}`}
        onClick={() => go("asset")}
      >
        <span className="home-alert__icon">
          <Icon name="warning" size={20} />
        </span>
        <span>
          <strong>
            {issueType === "Missing" ? "1 asset reported missing" : "1 tool due back today"}
          </strong>
          <small>Oxy-Fuel Heating Torch · CAS-04217</small>
        </span>
        <span className="home-alert__action">
          View <Icon name="chevron" size={17} />
        </span>
      </button>
      <section className="list-section">
        <div className="section-label">
          <span>IN MY CUSTODY</span>
          <button onClick={() => setAscending(!ascending)}>
            {ascending ? "Tag A–Z" : "Tag Z–A"} <Icon name="chevron" size={14} />
          </button>
        </div>
        <div className="tool-list">
          {visibleTools.map((tool) => (
            <ToolRow
              key={tool.tag}
              tool={tool}
              inspectionDue={
                tool.tag === "CAS-04217" && !inspectionResult && issueType !== "Missing"
              }
              onClick={() => go("asset")}
            />
          ))}
        </div>
      </section>
      <button className="scan-cta" onClick={onScan}>
        <Icon name="camera" size={25} />
        <span>SCAN ASSET</span>
      </button>
      <BottomNav current="home" go={go} />
    </main>
  );
}

function Scanner({
  onBack,
  onFound,
  purpose,
}: {
  onBack: () => void;
  onFound: () => void;
  purpose: "asset" | "inspection";
}) {
  const [mode, setMode] = useState<"ready" | "denied" | "notfound">("ready");
  return (
    <main className="scanner">
      <div className="scanner__scene" />
      <header className="scanner__header">
        <button
          className="icon-button icon-button--dark"
          onClick={onBack}
          aria-label="Close scanner"
        >
          <Icon name="x" />
        </button>
        <strong>{purpose === "inspection" ? "Scan to inspect" : "Scan asset tag"}</strong>
        <button
          className="icon-button icon-button--dark"
          onClick={() => setMode(mode === "denied" ? "ready" : "denied")}
          aria-label="Toggle flash"
        >
          <Icon name="flash" />
        </button>
      </header>
      {mode === "ready" && (
        <>
          <div
            className="scanner__reticle"
            onClick={onFound}
            role="button"
            tabIndex={0}
            aria-label="Simulate QR scan"
          >
            <i />
            <i />
            <i />
            <i />
            <div className="fake-qr">
              <b />
              <b />
              <b />
              <b />
              <b />
            </div>
          </div>
          <div className="scanner__instruction">
            <strong>Align QR code inside frame</strong>
            <span>
              {purpose === "inspection"
                ? "We’ll verify the asset before inspection"
                : "Scanning happens automatically"}
            </span>
          </div>
          <div className="scanner__footer">
            <button onClick={() => setMode("notfound")}>
              <Icon name="help" /> Enter tag manually
            </button>
          </div>
        </>
      )}
      {mode === "denied" && (
        <div className="scanner-state">
          <div className="scanner-state__icon">
            <Icon name="camera" />
          </div>
          <h2>Camera access needed</h2>
          <p>Allow camera access to scan asset QR codes.</p>
          <button className="button button--primary" onClick={() => setMode("ready")}>
            Allow camera
          </button>
          <button className="button button--text" onClick={() => setMode("notfound")}>
            Enter tag instead
          </button>
        </div>
      )}
      {mode === "notfound" && (
        <div className="scanner-state scanner-state--form">
          <button className="scanner-state__close" onClick={() => setMode("ready")}>
            <Icon name="x" />
          </button>
          <div className="scanner-state__icon scanner-state__icon--danger">
            <Icon name="warning" />
          </div>
          <h2>Asset not found</h2>
          <p>Check the tag and try again, or ask an admin to add it.</p>
          <label>
            ASSET TAG
            <input defaultValue="CAS-042I7" />
          </label>
          <button className="button button--primary" onClick={onFound}>
            Search again
          </button>
        </div>
      )}
    </main>
  );
}

function Fact({
  icon,
  label,
  children,
  company,
}: {
  icon: IconName;
  label: string;
  children: React.ReactNode;
  company?: "CAS" | "PAS";
}) {
  return (
    <div className="fact">
      <div className="fact__icon">
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{children}</strong>
      </div>
      {company && <CompanyMark company={company} />}
    </div>
  );
}

function TransferSheet({
  action,
  onClose,
  onConfirm,
}: {
  action: AssetAction;
  onClose: () => void;
  onConfirm: (outcome: TransferOutcome) => void;
}) {
  const [tab, setTab] = useState<DestinationType>(action === "custody" ? "Employee" : "Truck");
  const options: Record<DestinationType, { name: string; detail: string; badge: string }[]> = {
    Employee: [
      { name: "Marco Ruiz", detail: "PAS · Service Technician", badge: "MR" },
      { name: "Elena Torres", detail: "CAS · Foreman", badge: "ET" },
      { name: "David Kim", detail: "CAS · Installer", badge: "DK" },
    ],
    Truck: [
      { name: "Truck 104", detail: "CAS · Marco Ruiz", badge: "104" },
      { name: "Truck 208", detail: "PAS · Elena Torres", badge: "208" },
    ],
    Project: [
      { name: "Midtown Tower", detail: "Project 23-184 · Atlanta", badge: "MT" },
      { name: "Northside Medical", detail: "Project 24-031 · Sandy Springs", badge: "NM" },
    ],
    Warehouse: [
      { name: "CAS Main Warehouse", detail: "Atlanta · Receiving bay 2", badge: "CAS" },
      { name: "PAS Warehouse", detail: "Marietta · Tool counter", badge: "PAS" },
    ],
  };
  const visibleTabs: DestinationType[] =
    action === "custody" ? ["Employee"] : ["Truck", "Project", "Warehouse"];
  const [selected, setSelected] = useState(0);
  const selection = options[tab][selected];
  return (
    <div className="sheet-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section
        className="sheet"
        aria-modal="true"
        role="dialog"
        aria-label={action === "custody" ? "Transfer custody" : "Change location"}
      >
        <div className="sheet__handle" />
        <header>
          <div>
            <span>{action === "custody" ? "TRANSFER CUSTODY" : "CHANGE LOCATION"}</span>
            <h2>{action === "custody" ? "Who has it next?" : "Where is it going?"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <Icon name="x" />
          </button>
        </header>
        {action === "location" && (
          <div className="segmented">
            {visibleTabs.map((item) => (
              <button
                key={item}
                className={tab === item ? "is-active" : ""}
                onClick={() => {
                  setTab(item);
                  setSelected(0);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        {action === "custody" && (
          <div className="sheet-context">Select the employee taking custody</div>
        )}
        <label className="search-field">
          <Icon name="search" />
          <input
            placeholder={action === "custody" ? "Search employees" : `Search ${tab.toLowerCase()}s`}
          />
          <button aria-label="Clear">
            <Icon name="x" size={17} />
          </button>
        </label>
        <div className="recent-label">
          {action === "custody" ? "RECENT EMPLOYEES" : `RECENT ${tab.toUpperCase()}S`}
        </div>
        <div className="recipient-list">
          {options[tab].map((option, index) => (
            <button
              key={option.name}
              className={selected === index ? "is-selected" : ""}
              onClick={() => setSelected(index)}
            >
              <span className="recipient-avatar">{option.badge}</span>
              <span>
                <strong>{option.name}</strong>
                <small>{option.detail}</small>
              </span>
              <i>{selected === index && <Icon name="check" size={16} />}</i>
            </button>
          ))}
        </div>
        <label className="note-field">
          NOTE <span>OPTIONAL</span>
          <textarea placeholder="Add handoff details…" />
        </label>
        <button
          className="button button--primary sheet__confirm"
          onClick={() => onConfirm({ action, ...selection })}
        >
          {action === "custody" ? "Confirm custody transfer" : "Confirm new location"}{" "}
          <Icon name="arrow-right" />
        </button>
      </section>
    </div>
  );
}

function SheetHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <>
      <div className="sheet__handle" />
      <header>
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close">
          <Icon name="x" />
        </button>
      </header>
    </>
  );
}

function AssetHistory({
  issueType,
  inspectionResult,
  go,
}: {
  issueType: IssueType;
  inspectionResult: InspectionResult | null;
  go: (screen: Screen) => void;
}) {
  const events = getHistoryEvents(issueType, inspectionResult).slice(0, 4);
  return (
    <section className="asset-history" aria-labelledby="asset-history-title">
      <header>
        <div>
          <span>AUDIT TRAIL</span>
          <h2 id="asset-history-title">Recent activity</h2>
        </div>
        <Icon name="briefcase" size={21} />
      </header>
      <div className="history-timeline">
        {events.map((event) => (
          <div className="history-event" key={event.date}>
            <span className="history-event__icon">
              <Icon name={event.icon} size={19} />
            </span>
            <span>
              <small>{event.date}</small>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              <em>
                Performed by <b>{event.performedBy}</b>
              </em>
            </span>
          </div>
        ))}
      </div>
      <button className="asset-history__more" onClick={() => go("history")}>
        View full history <span>{getHistoryEvents(issueType, inspectionResult).length} events</span>
        <Icon name="chevron" size={18} />
      </button>
    </section>
  );
}

function FullHistory({
  go,
  issueType,
  inspectionResult,
}: {
  go: (screen: Screen) => void;
  issueType: IssueType;
  inspectionResult: InspectionResult | null;
}) {
  const [filter, setFilter] = useState<"All" | HistoryCategory>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const events = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return getHistoryEvents(issueType, inspectionResult).filter(
      (event) =>
        (filter === "All" || event.category === filter) &&
        (!normalizedQuery ||
          `${event.title} ${event.detail} ${event.performedBy} ${event.note || ""}`
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [filter, query, issueType, inspectionResult]);
  const visibleEvents = events.slice(0, visibleCount);

  const exportHistory = () => {
    const rows = [
      ["Date", "Category", "Activity", "Change", "Performed by", "Note"],
      ...events.map((event) => [
        event.date,
        event.category,
        event.title,
        event.detail,
        event.performedBy,
        event.note || "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "CAS-04217-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="screen full-history">
      <AppHeader title="Full history" back={() => go("asset")} />
      <section className="history-heading">
        <div>
          <p>CAS-04217 · OXY-FUEL HEATING TORCH</p>
          <h1>Asset audit trail</h1>
          <span>{getHistoryEvents(issueType, inspectionResult).length} recorded events</span>
        </div>
        <button className="button button--secondary history-export" onClick={exportHistory}>
          Export CSV
        </button>
      </section>
      <section className="history-controls">
        <label className="search-field">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(5);
            }}
            placeholder="Search employee or activity…"
          />
        </label>
        <div className="history-filters" aria-label="Filter history">
          {(["All", "Custody", "Location", "Issues", "Other"] as const).map((item) => (
            <button
              key={item}
              className={filter === item ? "is-active" : ""}
              onClick={() => {
                setFilter(item);
                setVisibleCount(5);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="history-results" aria-live="polite">
        <div className="history-table__head">
          <span>DATE</span>
          <span>ACTIVITY</span>
          <span>CHANGE</span>
          <span>PERFORMED BY</span>
        </div>
        {visibleEvents.map((event) => (
          <article className="full-history-event" key={`${event.sortDate}-${event.title}`}>
            <span className="history-event__icon">
              <Icon name={event.icon} size={19} />
            </span>
            <div className="full-history-event__date">{event.date}</div>
            <div className="full-history-event__title">
              <StatusChip tone="neutral">{event.category}</StatusChip>
              <strong>{event.title}</strong>
            </div>
            <div className="full-history-event__change">
              <strong>{event.detail}</strong>
              {event.note && <small>Note: “{event.note}”</small>}
            </div>
            <div className="full-history-event__actor">
              <span>
                {event.performedBy
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </span>
              <strong>{event.performedBy}</strong>
            </div>
          </article>
        ))}
        {!visibleEvents.length && (
          <div className="history-empty">
            <Icon name="search" />
            <strong>No matching activity</strong>
            <span>Try another employee, event, or filter.</span>
          </div>
        )}
      </section>
      {visibleCount < events.length && (
        <button
          className="button button--secondary history-load"
          onClick={() => setVisibleCount(events.length)}
        >
          Load earlier activity
        </button>
      )}
    </main>
  );
}

function LabelSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="sheet-scrim"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="sheet utility-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Print QR label"
      >
        <SheetHeader eyebrow="ASSET IDENTIFICATION" title="Print QR label" onClose={onClose} />
        <p className="utility-sheet__intro">
          Print and attach this label where the code can be scanned without moving the tool.
        </p>
        <div className="print-label">
          <div className="print-label__brand">
            LEGACY AIR <span>ASSET HUB</span>
          </div>
          <QRCode
            value={`${window.location.origin}/?asset=CAS-04217`}
            size={148}
            bgColor="#ffffff"
            fgColor="#111548"
            aria-label="QR code for asset CAS-04217"
          />
          <div className="print-label__details">
            <span>ASSET TAG</span>
            <strong>CAS-04217</strong>
            <p>Oxy-Fuel Heating Torch</p>
            <small>Owned by Commercial Air Systems</small>
          </div>
        </div>
        <button
          className="button button--primary label-print-button"
          onClick={() => window.print()}
        >
          Print label
        </button>
        <button className="button button--secondary utility-sheet__done" onClick={onClose}>
          Cancel
        </button>
      </section>
    </div>
  );
}

function ReportSheet({
  onClose,
  onReported,
}: {
  onClose: () => void;
  onReported: (type: Exclude<IssueType, null>) => void;
}) {
  const [reportType, setReportType] = useState<"Damage" | "Missing">("Damage");
  const [details, setDetails] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="sheet-scrim">
        <section className="sheet utility-sheet report-success" role="dialog" aria-modal="true">
          <div className="sheet__handle" />
          <div className="success-check">
            <Icon name="check" size={34} />
          </div>
          <p>REPORT SUBMITTED</p>
          <h2>{reportType === "Damage" ? "Damage reported" : "Asset marked missing"}</h2>
          <span>
            {reportType === "Damage"
              ? "An admin has been notified and the condition now requires inspection."
              : "The asset status is now Missing and an admin has been notified."}
          </span>
          <button className="button button--primary" onClick={onClose}>
            Done
          </button>
        </section>
      </div>
    );
  }

  return (
    <div
      className="sheet-scrim"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="sheet utility-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Report an issue"
      >
        <SheetHeader eyebrow="CAS-04217" title="Report an issue" onClose={onClose} />
        <div className="report-type" aria-label="Issue type">
          {(["Damage", "Missing"] as const).map((type) => (
            <button
              key={type}
              className={reportType === type ? "is-active" : ""}
              onClick={() => setReportType(type)}
            >
              <Icon name={type === "Damage" ? "warning" : "search"} size={20} />
              <span>{type === "Damage" ? "Damaged" : "Missing"}</span>
            </button>
          ))}
        </div>
        <label className="report-details">
          WHAT HAPPENED? <span>REQUIRED</span>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={
              reportType === "Damage"
                ? "Describe the damage and whether the tool is safe to use…"
                : "Describe where and when the asset was last seen…"
            }
          />
        </label>
        <label className="report-photo">
          <Icon name="camera" />
          <span>
            <strong>{fileName || "Add a photo"}</strong>
            <small>{fileName ? "Tap to replace" : "Optional · helps admins assess damage"}</small>
          </span>
          <Icon name="chevron" size={18} />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name || "")}
          />
        </label>
        <button
          className="button button--primary report-submit"
          disabled={!details.trim()}
          onClick={() => {
            onReported(reportType);
            setSubmitted(true);
          }}
        >
          Submit {reportType.toLowerCase()} report
        </button>
      </section>
    </div>
  );
}

function AssetQrAccess({ className, onClick }: { className: string; onClick: () => void }) {
  return (
    <button className={`asset-qr-access ${className}`} onClick={onClick}>
      <span className="asset-qr-access__code">
        <QRCode
          value={`${window.location.origin}/?asset=CAS-04217`}
          size={132}
          bgColor="#ffffff"
          fgColor="#111548"
          aria-label="QR code for asset CAS-04217"
        />
      </span>
      <span className="asset-qr-access__copy">
        <small>ASSET QR CODE</small>
        <strong>CAS-04217</strong>
        <span>Tap to enlarge or print</span>
      </span>
      <Icon name="chevron" size={19} className="asset-qr-access__chevron" />
    </button>
  );
}

const inspectionQuestions = [
  "Body and components are free of visible damage",
  "Fittings and attachments are secure",
  "The asset operates normally",
];

function InspectionForm({
  go,
  onSubmit,
}: {
  go: (screen: Screen) => void;
  onSubmit: (result: InspectionResult) => void;
}) {
  const [condition, setCondition] = useState<InspectionCondition | null>(null);
  const [answers, setAnswers] = useState<Record<number, "Pass" | "Fail" | "N/A">>({});
  const [notes, setNotes] = useState("");
  const [photoName, setPhotoName] = useState("");
  const hasFailure = Object.values(answers).includes("Fail");
  const notesRequired = condition === "Damaged" || condition === "Unusable" || hasFailure;
  const canSubmit =
    Boolean(condition) &&
    inspectionQuestions.every((_, index) => answers[index]) &&
    (!notesRequired || Boolean(notes.trim()));

  return (
    <main className="screen inspection-screen">
      <AppHeader title="Asset inspection" back={() => go("asset")} />
      <section className="inspection-heading">
        <p>SCHEDULED INSPECTION · DUE TODAY</p>
        <h1>Inspect asset</h1>
        <span>Complete the condition check before returning this asset to service.</span>
      </section>
      <section className="inspection-asset">
        <span className="inspection-asset__check">
          <Icon name="check" />
        </span>
        <div>
          <small>ASSET VERIFIED</small>
          <strong>Oxy-Fuel Heating Torch</strong>
          <span>CAS-04217 · Truck 104</span>
        </div>
        <StatusChip tone="active">Matched</StatusChip>
      </section>
      <form
        className="inspection-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!condition || !canSubmit) return;
          onSubmit({
            condition,
            notes: notes.trim(),
            photoName,
            completedAt: "March 23, 2026 at 12:30 PM",
          });
        }}
      >
        <fieldset className="inspection-condition">
          <legend>
            CONDITION <span>REQUIRED</span>
          </legend>
          <div>
            {(["Good", "Fair", "Damaged", "Unusable"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={condition === item ? `is-active is-${item.toLowerCase()}` : ""}
                onClick={() => setCondition(item)}
              >
                <i />
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="inspection-checklist">
          <legend>
            SAFETY & OPERATION <span>REQUIRED</span>
          </legend>
          {inspectionQuestions.map((question, index) => (
            <div className="inspection-question" key={question}>
              <strong>
                {index + 1}. {question}
              </strong>
              <div>
                {(["Pass", "Fail", "N/A"] as const).map((answer) => (
                  <button
                    key={answer}
                    type="button"
                    className={answers[index] === answer ? "is-active" : ""}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: answer }))}
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
        <label className="inspection-notes">
          NOTES <span>{notesRequired ? "REQUIRED" : "OPTIONAL"}</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add inspection findings or follow-up details…"
          />
        </label>
        <label className="report-photo inspection-photo">
          <Icon name="camera" />
          <span>
            <strong>{photoName || "Add inspection photo"}</strong>
            <small>
              {photoName ? "Tap to replace" : "Optional unless your policy requires it"}
            </small>
          </span>
          <Icon name="chevron" size={18} />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setPhotoName(event.currentTarget.files?.[0]?.name || "")}
          />
        </label>
        <section className="inspection-schedule">
          <Icon name="check" />
          <div>
            <strong>90-day inspection schedule</strong>
            <span>Passing inspection sets the next due date to June 23, 2026.</span>
          </div>
        </section>
        <button className="button button--primary inspection-submit" disabled={!canSubmit}>
          Complete inspection
        </button>
      </form>
    </main>
  );
}

function InspectionSuccess({
  go,
  result,
}: {
  go: (screen: Screen) => void;
  result: InspectionResult;
}) {
  const flagged = result.condition !== "Good";
  return (
    <main className="success-screen inspection-complete">
      <div className="success-check">
        <Icon name="check" size={44} />
      </div>
      <p>INSPECTION COMPLETE</p>
      <h1>{flagged ? "Condition flagged" : "Asset passed"}</h1>
      <span>CAS-04217 · Oxy-Fuel Heating Torch</span>
      <div className="inspection-result">
        <div>
          <span>CONDITION</span>
          <StatusChip tone={flagged ? "warn" : "active"}>{result.condition}</StatusChip>
        </div>
        <div>
          <span>NEXT INSPECTION</span>
          <strong>{flagged ? "Follow-up required" : "June 23, 2026"}</strong>
        </div>
        <div>
          <span>PERFORMED BY</span>
          <strong>Jordan Davis</strong>
        </div>
      </div>
      <div className="success-actions">
        <button className="button button--primary" onClick={() => go("asset")}>
          View asset
        </button>
        <button className="button button--secondary" onClick={() => go("home")}>
          Back to My Tools
        </button>
      </div>
    </main>
  );
}

function AssetDetail({
  go,
  onComplete,
  issueType,
  onReported,
  inspectionResult,
  onStartInspection,
}: {
  go: (screen: Screen) => void;
  onComplete: (outcome: TransferOutcome) => void;
  issueType: IssueType;
  onReported: (type: Exclude<IssueType, null>) => void;
  inspectionResult: InspectionResult | null;
  onStartInspection: () => void;
}) {
  const [activeAction, setActiveAction] = useState<AssetAction | null>(null);
  const [utility, setUtility] = useState<"label" | "report" | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!photoOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhotoOpen(false);
      if (event.key === "ArrowLeft") {
        setPhotoIndex((current) => (current - 1 + assetPhotos.length) % assetPhotos.length);
      }
      if (event.key === "ArrowRight") {
        setPhotoIndex((current) => (current + 1) % assetPhotos.length);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [photoOpen]);

  const inspectionFlagged = Boolean(inspectionResult && inspectionResult.condition !== "Good");

  return (
    <main className="screen asset-screen">
      <AppHeader title="Asset details" back={() => go("home")} />
      <div className="asset-overview">
        <div className="asset-overview__primary">
          <section className="asset-identity">
            <div className="asset-identity__eyebrow">
              <span>CAS-04217</span>
              <StatusChip tone={issueType === "Missing" ? "danger" : "active"}>
                {issueType === "Missing" ? "Missing" : "Active"}
              </StatusChip>
              {issueType === "Damage" && <StatusChip tone="warn">Needs inspection</StatusChip>}
              {!issueType && inspectionResult && inspectionResult.condition !== "Good" && (
                <StatusChip tone="warn">Condition: {inspectionResult.condition}</StatusChip>
              )}
            </div>
            <h1>Oxy-Fuel Heating Torch</h1>
            <p>Field torch assembly</p>
          </section>
          {issueType !== "Missing" && (
            <div className="asset-due">
              <span className="asset-due__icon">
                <Icon name="warning" size={20} />
              </span>
              <span>
                <strong>Due back today by 5:00 PM</strong>
                <small>Return to CAS Main Warehouse</small>
              </span>
            </div>
          )}
          <section
            className={`inspection-card ${
              inspectionResult && !inspectionFlagged ? "inspection-card--current" : ""
            } ${inspectionFlagged ? "inspection-card--flagged" : ""}`}
          >
            <div className="inspection-card__icon">
              <Icon name={inspectionResult ? "check" : "warning"} />
            </div>
            <div className="inspection-card__content">
              <span>INSPECTION</span>
              <strong>
                {issueType === "Missing"
                  ? "Inspection paused"
                  : inspectionFlagged
                    ? "Follow-up required"
                    : inspectionResult
                      ? "Inspection current"
                      : "Due today"}
              </strong>
              <small>
                {issueType === "Missing"
                  ? "Resume the scheduled inspection when the asset is found."
                  : inspectionFlagged
                    ? `${inspectionResult?.condition} condition recorded by Jordan Davis`
                    : inspectionResult
                      ? `Last inspected ${inspectionResult.completedAt} · Next due June 23, 2026`
                      : "Last inspected December 23, 2025 · Every 90 days"}
              </small>
            </div>
            {!inspectionResult && issueType !== "Missing" && (
              <button onClick={onStartInspection}>
                Inspect now <Icon name="chevron" size={17} />
              </button>
            )}
          </section>
          <section className="asset-facts">
            <div className="asset-facts__heading">RESPONSIBILITY & LOCATION</div>
            <Fact icon="building" label="OWNED BY" company="CAS">
              Commercial Air Systems
            </Fact>
            <Fact icon="person" label="IN CUSTODY OF" company="PAS">
              Jordan Davis
            </Fact>
            <Fact icon="map-pin" label="LOCATED AT">
              Truck 104
            </Fact>
          </section>
        </div>
        <aside className="asset-overview__media">
          <figure className="asset-photo asset-photo--preview">
            <span>ASSET PHOTO</span>
            <span className="asset-photo__orientation asset-photo__orientation--mobile">
              Fit preview
            </span>
            <span className="asset-photo__orientation asset-photo__orientation--desktop">
              Portrait photo
            </span>
            <button
              className="asset-photo__viewer"
              onClick={() => {
                setPhotoIndex(0);
                setPhotoOpen(true);
              }}
              aria-label="View full asset photo"
            >
              <img
                className="asset-photo__mobile-preview"
                src={torchPreviewPhoto}
                alt="Fitted preview showing the complete oxy-fuel heating torch"
              />
              <img
                className="asset-photo__desktop-image"
                src={assetPhotos[0].src}
                alt={assetPhotos[0].alt}
              />
              <span>View {assetPhotos.length} photos</span>
            </button>
          </figure>
          <AssetQrAccess className="asset-qr-access--mobile" onClick={() => setUtility("label")} />
          <AssetQrAccess className="asset-qr-access--desktop" onClick={() => setUtility("label")} />
        </aside>
      </div>
      <section className="asset-actions">
        <h2>Actions</h2>
        <button className="action-primary" onClick={() => setActiveAction("custody")}>
          <span>
            <Icon name="arrow-right" />
          </span>
          <div>
            <strong>Transfer custody</strong>
            <small>Hand off to an employee</small>
          </div>
          <Icon name="chevron" />
        </button>
        <button className="action-secondary" onClick={() => setActiveAction("location")}>
          <span>
            <Icon name="map-pin" />
          </span>
          <div>
            <strong>Change location</strong>
            <small>Truck, project, or warehouse</small>
          </div>
          <Icon name="chevron" />
        </button>
        <button className="report-button" onClick={() => setUtility("report")}>
          <Icon name="warning" /> {issueType ? "Report another issue" : "Report damage or missing"}
        </button>
      </section>
      <details className="asset-more">
        <summary>
          Technical & purchasing details <Icon name="chevron" size={18} />
        </summary>
        <div>
          <dl>
            <dt>Serial number</dt>
            <dd>24A-118092</dd>
            <dt>Model</dt>
            <dd>Field torch assembly</dd>
            <dt>Condition</dt>
            <dd>
              {issueType === "Damage"
                ? "Damage reported · Needs inspection"
                : issueType === "Missing"
                  ? "Unknown · Asset missing"
                  : inspectionResult
                    ? `${inspectionResult.condition} · Inspected March 23`
                    : "Good · Inspected December 23"}
            </dd>
            <dt>Purchased</dt>
            <dd>August 14, 2024</dd>
            <dt>Purchase price</dt>
            <dd>$325</dd>
          </dl>
          <p>Purchasing information is shown to authorized staff.</p>
        </div>
      </details>
      <AssetHistory issueType={issueType} inspectionResult={inspectionResult} go={go} />
      {photoOpen && (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Full asset photo"
          onMouseDown={(event) => event.target === event.currentTarget && setPhotoOpen(false)}
        >
          <button
            className="icon-button photo-lightbox__close"
            onClick={() => setPhotoOpen(false)}
            aria-label="Close full photo"
          >
            <Icon name="x" />
          </button>
          <div className="photo-lightbox__stage">
            <button
              className="photo-lightbox__nav photo-lightbox__nav--previous"
              onClick={() =>
                setPhotoIndex((current) => (current - 1 + assetPhotos.length) % assetPhotos.length)
              }
              aria-label="Previous photo"
            >
              <Icon name="arrow-left" />
            </button>
            <img src={assetPhotos[photoIndex].src} alt={assetPhotos[photoIndex].alt} />
            <button
              className="photo-lightbox__nav photo-lightbox__nav--next"
              onClick={() => setPhotoIndex((current) => (current + 1) % assetPhotos.length)}
              aria-label="Next photo"
            >
              <Icon name="arrow-right" />
            </button>
          </div>
          <footer>
            <div className="photo-lightbox__caption">
              <div>
                <span>
                  ASSET PHOTO · {photoIndex + 1} OF {assetPhotos.length}
                </span>
                <strong>{assetPhotos[photoIndex].label}</strong>
              </div>
              <small>Oxy-Fuel Heating Torch · CAS-04217</small>
            </div>
            <div className="photo-lightbox__thumbnails" aria-label="Asset photos">
              {assetPhotos.map((photo, index) => (
                <button
                  key={photo.label}
                  className={photoIndex === index ? "is-active" : ""}
                  onClick={() => setPhotoIndex(index)}
                  aria-label={`View ${photo.label}`}
                >
                  <img src={photo.src} alt="" />
                  <span>{photo.label}</span>
                </button>
              ))}
            </div>
          </footer>
        </div>
      )}
      {activeAction && (
        <TransferSheet
          action={activeAction}
          onClose={() => setActiveAction(null)}
          onConfirm={onComplete}
        />
      )}
      {utility === "label" && <LabelSheet onClose={() => setUtility(null)} />}
      {utility === "report" && (
        <ReportSheet onClose={() => setUtility(null)} onReported={onReported} />
      )}
    </main>
  );
}

function Success({ go, outcome }: { go: (screen: Screen) => void; outcome: TransferOutcome }) {
  const isCustody = outcome.action === "custody";
  return (
    <main className="success-screen">
      <div className="success-check">
        <Icon name="check" size={44} />
      </div>
      <p>{isCustody ? "TRANSFER COMPLETE" : "LOCATION UPDATED"}</p>
      <h1>{isCustody ? "Custody transferred" : "Location updated"}</h1>
      <span>{isCustody ? "CAS-04217 is now in custody of" : "CAS-04217 is now located at"}</span>
      <div className="success-person">
        <b>{outcome.badge}</b>
        <div>
          <strong>{outcome.name}</strong>
          <small>{outcome.detail}</small>
        </div>
      </div>
      <div className="success-summary">
        <div>
          <span>ASSET</span>
          <strong>Oxy-Fuel Heating Torch</strong>
        </div>
        <div>
          <span>LOCATION</span>
          <strong>{isCustody ? "Truck 104" : outcome.name}</strong>
        </div>
      </div>
      <div className="success-actions">
        <button className="button button--primary" onClick={() => go("home")}>
          Back to My Tools
        </button>
        <button className="button button--secondary" onClick={() => go("scanner")}>
          <Icon name="camera" /> Scan another asset
        </button>
      </div>
    </main>
  );
}

function Registry({
  go,
  issueType,
  inspectionResult,
}: {
  go: (screen: Screen) => void;
  issueType: IssueType;
  inspectionResult: InspectionResult | null;
}) {
  const [query, setQuery] = useState("");
  const registryItems = useMemo(
    () =>
      registry.map((item) =>
        item.tag === "CAS-04217" && issueType === "Missing" ? { ...item, status: "Missing" } : item,
      ),
    [issueType],
  );
  const filtered = useMemo(
    () =>
      registryItems.filter((item) =>
        `${item.tag} ${item.name} ${item.model}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, registryItems],
  );
  return (
    <main className="screen screen--with-nav registry-screen">
      <AppHeader right={<button className="avatar">JD</button>} />
      <section className="registry-heading">
        <div>
          <p>ADMIN WORKSPACE</p>
          <h1>Asset registry</h1>
          <span>{registryItems.length} assets across CAS + PAS</span>
        </div>
        <label className="button button--secondary bulk-import">
          <Icon name="arrow-right" /> Bulk import
          <input
            type="file"
            accept=".csv"
            onChange={(event) =>
              event.currentTarget.files?.[0] &&
              window.alert(`${event.currentTarget.files[0].name} is ready to import.`)
            }
          />
        </label>
      </section>
      <section className="registry-tools">
        <label className="search-field">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tag, asset, serial…"
          />
        </label>
        <button className="filter-button">
          All companies <Icon name="chevron" />
        </button>
      </section>
      <section className="registry-table">
        <div className="registry-table__head">
          <span>ASSET</span>
          <span>OWNER</span>
          <span>LOCATION</span>
          <span>INSPECTION</span>
          <span>STATUS</span>
        </div>
        {filtered.map((tool) => (
          <button key={tool.tag} className="registry-row" onClick={() => go("asset")}>
            <span className="registry-row__asset">
              <b>{tool.name}</b>
              <small>
                {tool.tag} · {tool.model}
              </small>
            </span>
            <span className="registry-row__owner">
              <CompanyMark company={tool.company as "CAS" | "PAS"} />
            </span>
            <span className="registry-row__location">{tool.place}</span>
            <span className="registry-row__inspection">
              <StatusChip tone={tool.tag === "CAS-04217" && !inspectionResult ? "warn" : "active"}>
                {tool.tag === "CAS-04217" && !inspectionResult ? "Due" : "Current"}
              </StatusChip>
            </span>
            <span className="registry-row__status">
              <StatusChip
                tone={
                  tool.status === "Missing"
                    ? "danger"
                    : tool.status === "In repair" || tool.status === "Due back"
                      ? "warn"
                      : "active"
                }
              >
                {tool.status}
              </StatusChip>
              <Icon name="chevron" size={18} />
            </span>
          </button>
        ))}
      </section>
      <BottomNav current="registry" go={go} />
    </main>
  );
}

function Profile({ go }: { go: (screen: Screen) => void }) {
  return (
    <main className="screen screen--with-nav">
      <AppHeader />
      <section className="profile">
        <div className="profile__avatar">JD</div>
        <h1>Jordan Davis</h1>
        <p>CAS · Field Foreman</p>
        <div className="profile__company">
          <CompanyMark company="CAS" />
          <span>Primary company context</span>
        </div>
        <button className="button button--secondary" onClick={() => go("signin")}>
          Sign out
        </button>
      </section>
      <BottomNav current="profile" go={go} />
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("signin");
  const [offline, setOffline] = useState(false);
  const [outcome, setOutcome] = useState<TransferOutcome>({
    action: "custody",
    name: "Marco Ruiz",
    detail: "PAS · Service Technician",
    badge: "MR",
  });
  const [issueType, setIssueType] = useState<IssueType>(null);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [scanPurpose, setScanPurpose] = useState<"asset" | "inspection">("asset");

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      {screen === "signin" && <SignIn onSignIn={() => go("home")} />}
      {screen === "home" && (
        <Home
          go={go}
          offline={offline}
          issueType={issueType}
          inspectionResult={inspectionResult}
          onStartInspection={() => {
            setScanPurpose("inspection");
            go("scanner");
          }}
          onScan={() => {
            setScanPurpose("asset");
            go("scanner");
          }}
        />
      )}
      {screen === "scanner" && (
        <Scanner
          purpose={scanPurpose}
          onBack={() => go("home")}
          onFound={() => go(scanPurpose === "inspection" ? "inspection" : "asset")}
        />
      )}
      {screen === "asset" && (
        <AssetDetail
          go={go}
          issueType={issueType}
          onReported={setIssueType}
          inspectionResult={inspectionResult}
          onStartInspection={() => go("inspection")}
          onComplete={(nextOutcome) => {
            setOutcome(nextOutcome);
            go("success");
          }}
        />
      )}
      {screen === "history" && (
        <FullHistory go={go} issueType={issueType} inspectionResult={inspectionResult} />
      )}
      {screen === "inspection" && (
        <InspectionForm
          go={go}
          onSubmit={(result) => {
            setInspectionResult(result);
            go("inspection-success");
          }}
        />
      )}
      {screen === "inspection-success" && inspectionResult && (
        <InspectionSuccess go={go} result={inspectionResult} />
      )}
      {screen === "success" && <Success go={go} outcome={outcome} />}
      {screen === "registry" && (
        <Registry go={go} issueType={issueType} inspectionResult={inspectionResult} />
      )}
      {screen === "profile" && <Profile go={go} />}
    </div>
  );
}
