import {
  Archive,
  ArrowRight,
  Banknote,
  Book,
  Box,
  Briefcase,
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  CircleDot,
  CircleHelp,
  ClipboardList,
  Component as ComponentIcon,
  Construction,
  Cuboid,
  Factory,
  File as FileIcon,
  FileSignature,
  FileText,
  Flag,
  Folder,
  Folders,
  Gauge,
  Gem,
  Hammer,
  Handshake,
  HardHat,
  Hash,
  IdCard,
  Image,
  Inbox,
  Key,
  LayoutDashboard,
  Layers,
  Lightbulb,
  LineChart,
  Link as LinkIcon,
  Loader,
  Lock,
  Megaphone,
  MessageSquare,
  Moon,
  NotepadText,
  Package,
  PackageOpen,
  Palette,
  Pencil,
  Pin,
  Power,
  Puzzle,
  Receipt,
  RefreshCw,
  Route,
  Scale,
  ScrollText,
  Search,
  Settings,
  Share2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sun,
  Tag,
  Timer,
  TrafficCone,
  Truck,
  User,
  Users,
  Wand2,
  Wrench,
} from 'lucide-angular';

/**
 * Map of every Lucide icon used anywhere in the frontend.
 * Fed into `LucideAngularModule.pick({...})` in `app.config.ts` so unused
 * icons are tree-shaken out of the bundle.
 *
 * Keep this list tight — every entry adds bytes to the bundle. Add new icons
 * here only after adding their first usage somewhere.
 */
export const APP_LUCIDE_ICONS = {
  // Status / states
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleDollarSign,
  CircleHelp,
  Loader,

  // Navigation / structure
  ArrowRight,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Sliders,

  // Theme / power
  Moon,
  Sun,
  Power,

  // Search & shared
  Search,
  Lock,

  // Category 1 — Основные
  CheckSquare,
  Folders,
  Building2,
  User,
  Users,
  Key,
  Shield,
  IdCard,
  TrafficCone,
  Settings,
  Flag,
  Handshake,
  Briefcase,

  // Category 2 — Продукция
  Package,
  Box,
  PackageOpen,
  Layers,
  Puzzle,
  ComponentIcon,
  Image,
  ClipboardList,
  Tag,
  Gem,
  Book,
  Folder,
  ScrollText,
  Scale,
  Archive,
  Cuboid,

  // Category 3 — Производство
  Construction,
  Hammer,
  HardHat,
  Route,
  Factory,
  Pin,
  Wrench,
  Banknote,
  Wand2,

  // Category 4 — Склад
  RefreshCw,
  Gauge,

  // Category 5 — Закупки
  FileSignature,
  Receipt,
  Megaphone,
  Hash,

  // Category 6 — Продажи
  ShoppingBag,
  ShoppingCart,
  Truck,

  // Category 7 — Документы + Финансы
  FileIcon,
  FileText,
  NotepadText,
  LineChart,
  Share2,
  Pencil,

  // Category 8 — Система
  MessageSquare,
  Inbox,
  Timer,
  Palette,

  // Misc UI
  LinkIcon,
  Lightbulb,
};
