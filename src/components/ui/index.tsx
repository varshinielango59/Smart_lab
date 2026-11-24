import React from 'react';
import { clsx } from 'clsx';

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: 'online'|'offline'|'occupied'|'available'|'faulty'|'maintenance'|'active'|'inactive'|'suspended'|'draft'|'published'|'closed'|'submitted'|'pending_evaluation'|'accepted'|'rejected'|'evaluation_error'|'open'|'in_progress'|'resolved'|'low'|'medium'|'high'|'critical'|'default';
  children: React.ReactNode;
  size?: 'sm'|'md';
}

const BADGE_VARIANTS: Record<string, string> = {
  online:             'bg-green-100 text-green-700 border border-green-200',
  offline:            'bg-slate-100 text-slate-600 border border-slate-200',
  occupied:           'bg-blue-100 text-blue-700 border border-blue-200',
  available:          'bg-emerald-100 text-emerald-700 border border-emerald-200',
  faulty:             'bg-red-100 text-red-700 border border-red-200',
  maintenance:        'bg-amber-100 text-amber-700 border border-amber-200',
  active:             'bg-green-100 text-green-700 border border-green-200',
  inactive:           'bg-slate-100 text-slate-600 border border-slate-200',
  suspended:          'bg-red-100 text-red-700 border border-red-200',
  draft:              'bg-slate-100 text-slate-600 border border-slate-200',
  published:          'bg-blue-100 text-blue-700 border border-blue-200',
  closed:             'bg-slate-200 text-slate-600 border border-slate-300',
  submitted:          'bg-purple-100 text-purple-700 border border-purple-200',
  pending_evaluation: 'bg-amber-100 text-amber-700 border border-amber-200',
  accepted:           'bg-green-100 text-green-700 border border-green-200',
  rejected:           'bg-red-100 text-red-700 border border-red-200',
  evaluation_error:   'bg-orange-100 text-orange-700 border border-orange-200',
  open:               'bg-red-100 text-red-700 border border-red-200',
  in_progress:        'bg-amber-100 text-amber-700 border border-amber-200',
  resolved:           'bg-green-100 text-green-700 border border-green-200',
  low:                'bg-slate-100 text-slate-600 border border-slate-200',
  medium:             'bg-amber-100 text-amber-700 border border-amber-200',
  high:               'bg-orange-100 text-orange-700 border border-orange-200',
  critical:           'bg-red-100 text-red-700 border border-red-200',
  default:            'bg-slate-100 text-slate-600 border border-slate-200',
};

export function Badge({ variant = 'default', children, size = 'sm' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.default
    )}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'secondary'|'danger'|'ghost'|'outline';
  size?: 'sm'|'md'|'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant='primary', size='md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const variants = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    ghost:     'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  };
  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-4 py-2 text-sm',
    lg:  'px-5 py-2.5 text-base',
  };
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm'|'md'|'lg' }) {
  const sizes = { sm:'w-4 h-4', md:'w-5 h-5', lg:'w-6 h-6' };
  return (
    <svg className={clsx('animate-spin text-current', sizes[size])} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}
export function Card({ children, className, padding=true, hover=false, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        padding && 'p-5',
        hover && 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}
export function Input({ label, error, icon, rightElement, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g,'_');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300',
            icon ? 'pl-10' : 'pl-3',
            rightElement ? 'pr-10' : 'pr-3',
            'py-2',
            className
          )}
          {...props}
        />
        {rightElement && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}
export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g,'_');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        id={selectId}
        className={clsx(
          'w-full rounded-lg border bg-white text-sm text-slate-900 px-3 py-2',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const taId = id || label?.toLowerCase().replace(/\s+/g,'_');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={taId} className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        id={taId}
        className={clsx(
          'w-full rounded-lg border bg-white text-sm text-slate-900 px-3 py-2',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none',
          error ? 'border-red-400' : 'border-slate-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}
export function Table<T>({ columns, data, keyField, onRowClick, emptyMessage='No data found.' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map(col => (
              <th key={col.key} className={clsx('px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">{emptyMessage}</td></tr>
            : data.map(row => (
                <tr
                  key={String(row[keyField])}
                  className={clsx('hover:bg-slate-50 transition-colors', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className={clsx('px-4 py-3 text-slate-700', col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string,unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm'|'md'|'lg'|'xl';
}
export function Modal({ open, onClose, title, children, footer, size='md' }: ModalProps) {
  if (!open) return null;
  const sizes = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-2xl w-full animate-fade-in', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-light cursor-pointer">✕</button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue'|'green'|'red'|'amber'|'purple'|'indigo'|'slate';
  trend?: { value: number; label: string };
  subtitle?: string;
}
const STAT_COLORS: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  red:    'bg-red-50 text-red-600',
  amber:  'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  slate:  'bg-slate-100 text-slate-600',
};
export function StatCard({ label, value, icon, color='blue', subtitle }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('p-3 rounded-xl', STAT_COLORS[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showLabel?: boolean;
}
export function ProgressBar({ value, max=100, label, color, showLabel=true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color ?? (pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-500' : 'bg-indigo-500');
  return (
    <div className="flex flex-col gap-1">
      {(label || showLabel) && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-medium">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-slate-300 mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-slate-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            active === tab.id
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'px-1.5 py-0.5 rounded-full text-xs font-semibold',
              active === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
            )}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── DemoModeBanner ───────────────────────────────────────────────────────────
export function DemoModeBanner() {
  return null;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size='md', color='indigo' }: { initials: string; size?:'sm'|'md'|'lg'; color?:string }) {
  const sizes = { sm:'w-7 h-7 text-xs', md:'w-9 h-9 text-sm', lg:'w-11 h-11 text-base' };
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold bg-indigo-100 text-indigo-700 shrink-0', sizes[size])}>
      {initials}
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}
export function SearchInput({ value, onChange, placeholder='Search…', className }: SearchInputProps) {
  return (
    <div className={clsx('relative', className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
