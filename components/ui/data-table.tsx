import { Card, CardContent, CardHeader, CardTitle } from './card';
import { EmptyState } from './empty-state';
import { TableSkeleton } from '../skeletons/table-skeleton';
import { Package } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  getRowKey: (item: T) => string;
}

export function DataTable<T>({
  title,
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  emptyDescription,
  getRowKey,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <EmptyState
            icon={Package}
            title={emptyMessage}
            description={emptyDescription}
            className="py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 font-medium text-${
                        column.align || 'left'
                      }`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={getRowKey(item)}
                    className="border-t hover:bg-muted/50 transition-colors duration-150"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-${column.align || 'left'}`}
                      >
                        {column.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
