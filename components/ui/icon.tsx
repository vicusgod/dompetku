'use client';

import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

// Map Material Symbols names to Lucide icon names
const iconMap: Record<string, keyof typeof LucideIcons> = {
    // Navigation
    'dashboard': 'LayoutDashboard',
    'home': 'Home',
    'settings': 'Settings',
    'menu': 'Menu',
    'close': 'X',
    'arrow_back': 'ArrowLeft',
    'arrow_forward': 'ArrowRight',
    'chevron_left': 'ChevronLeft',
    'chevron_right': 'ChevronRight',
    'chevron_down': 'ChevronDown',
    'expand_more': 'ChevronDown',
    'expand_less': 'ChevronUp',

    // Actions
    'add': 'Plus',
    'edit': 'Pencil',
    'delete': 'Trash2',
    'delete_forever': 'Trash2',
    'search': 'Search',
    'filter_list': 'Filter',
    'more_vert': 'MoreVertical',
    'more_horiz': 'MoreHorizontal',
    'refresh': 'RefreshCw',
    'restart_alt': 'RotateCcw',
    'check': 'Check',
    'check_circle': 'CheckCircle',
    'cancel': 'X',
    'visibility': 'Eye',
    'visibility_off': 'EyeOff',
    'logout': 'LogOut',
    'login': 'LogIn',
    'file_download': 'Download',
    'history': 'History',
    'info': 'Info',

    // Finance
    'wallet': 'Wallet',
    'account_balance': 'Landmark',
    'account_balance_wallet': 'Wallet',
    'savings': 'PiggyBank',
    'payments': 'Banknote',
    'credit_card': 'CreditCard',
    'attach_money': 'DollarSign',
    'money': 'Banknote',
    'receipt': 'Receipt',
    'receipt_long': 'FileText',
    'trending_up': 'TrendingUp',
    'trending_down': 'TrendingDown',
    'north': 'ArrowUp',
    'south': 'ArrowDown',

    // Categories
    'restaurant': 'Utensils',
    'fastfood': 'Utensils',
    'local_dining': 'Utensils',
    'directions_bus': 'Bus',
    'directions_car': 'Car',
    'local_gas_station': 'Fuel',
    'flight': 'Plane',
    'train': 'Train',
    'shopping_bag': 'ShoppingBag',
    'shopping_cart': 'ShoppingCart',
    'store': 'Store',
    'local_mall': 'Building2',
    'home_work': 'Home',
    'apartment': 'Building',
    'movie': 'Film',
    'sports_esports': 'Gamepad2',
    'music_note': 'Music',
    'medical_services': 'Heart',
    'local_hospital': 'Hospital',
    'school': 'GraduationCap',
    'work': 'Briefcase',
    'card_giftcard': 'Gift',
    'electric_bolt': 'Zap',
    'water_drop': 'Droplet',
    'wifi': 'Wifi',
    'phone': 'Phone',
    'smartphone': 'Smartphone',
    'category': 'Tag',
    'label': 'Tag',

    // User
    'person': 'User',
    'people': 'Users',
    'group': 'Users',
    'account_circle': 'UserCircle',

    // Time/Date
    'calendar_today': 'Calendar',
    'schedule': 'Clock',
    'event': 'CalendarDays',

    // Status
    'error': 'AlertCircle',
    'warning': 'AlertTriangle',
    'help': 'HelpCircle',
    'star': 'Star',

    // Misc
    'wifi_off': 'WifiOff',
    'cloud_off': 'CloudOff',
    'sync': 'RefreshCw',
    'notifications': 'Bell',
};

interface IconProps extends Omit<LucideProps, 'ref'> {
    name: string;
}

export function Icon({ name, className = '', size = 20, ...props }: IconProps) {
    // Get the Lucide icon name from our map, or use a default
    const lucideIconName = iconMap[name] || 'HelpCircle';

    // Get the actual icon component
    const LucideIcon = LucideIcons[lucideIconName] as React.ComponentType<LucideProps>;

    if (!LucideIcon) {
        // Fallback to a default icon if not found
        const FallbackIcon = LucideIcons.HelpCircle;
        return <FallbackIcon className={className} size={size} {...props} />;
    }

    return <LucideIcon className={className} size={size} {...props} />;
}

// Export commonly used icons directly for convenience
export {
    Plus as PlusIcon,
    Pencil as EditIcon,
    Trash2 as DeleteIcon,
    Search as SearchIcon,
    Filter as FilterIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    ArrowUp as ArrowUpIcon,
    ArrowDown as ArrowDownIcon,
    Wallet as WalletIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    User as UserIcon,
    Settings as SettingsIcon,
    LayoutDashboard as DashboardIcon,
    FileText as ReceiptIcon,
    PiggyBank as BudgetIcon,
    Calendar as CalendarIcon,
    MoreVertical as MoreIcon,
    Download as DownloadIcon,
    LogOut as LogOutIcon,
    Eye as EyeIcon,
    EyeOff as EyeOffIcon,
    RotateCcw as ResetIcon,
    Landmark as BankIcon,
    CreditCard as CreditCardIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    History as HistoryIcon,
    Home as HomeIcon,
    X as CloseIcon,
} from 'lucide-react';

