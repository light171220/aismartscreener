import * as React from 'react';
import { cn } from '@/lib/utils';

const GlassTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-xl border border-white/10">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
GlassTable.displayName = 'GlassTable';

const GlassTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-white/5 border-b border-white/10', className)}
    {...props}
  />
));
GlassTableHeader.displayName = 'GlassTableHeader';

const GlassTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
GlassTableBody.displayName = 'GlassTableBody';

const GlassTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-white/10 bg-white/5 font-medium',
      className
    )}
    {...props}
  />
));
GlassTableFooter.displayName = 'GlassTableFooter';

const GlassTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-white/5 transition-colors',
      'hover:bg-white/5 data-[state=selected]:bg-white/10',
      className
    )}
    {...props}
  />
));
GlassTableRow.displayName = 'GlassTableRow';

const GlassTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-slate-400',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
GlassTableHead.displayName = 'GlassTableHead';

const GlassTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-white [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
GlassTableCell.displayName = 'GlassTableCell';

const GlassTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-slate-400', className)}
    {...props}
  />
));
GlassTableCaption.displayName = 'GlassTableCaption';

export {
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableFooter,
  GlassTableHead,
  GlassTableRow,
  GlassTableCell,
  GlassTableCaption,
};
