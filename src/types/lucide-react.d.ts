// Local type workaround for lucide-react icons that exist at runtime
// but whose types can't be resolved from the monolithic d.ts file.
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
} & RefAttributes<SVGSVGElement>;

type LucideIcon = ForwardRefExoticComponent<IconProps>;

// These icons exist in lucide-react at runtime but TS can't resolve them
// from the single-line export in the .d.ts file.
declare module "lucide-react" {
  export const Briefcase: LucideIcon;
  export const LayoutGrid: LucideIcon;
  export const Wallet: LucideIcon;
  export const Cpu: LucideIcon;
  export const Cog: LucideIcon;
  export const Cloud: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Shield: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Calculator: LucideIcon;
  export const Store: LucideIcon;
  export const CalendarCheck: LucideIcon;
  export const Copy: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Monitor: LucideIcon;
  export const Clock: LucideIcon;
  export const FileText: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Search: LucideIcon;
  export const Bell: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Lock: LucideIcon;
  export const Music2Icon: LucideIcon;
}
