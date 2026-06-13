import { useRef } from 'react';

export function ImportControls({
  importing,
  error,
  onImport,
}: {
  importing: boolean;
  error: string | null;
  onImport: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {importing ? 'Importing…' : 'Import SKUs (CSV)'}
      </button>
      <p className="mt-1.5 text-xs text-gray-400">
        Columns: code, name, category, picksPerDay
      </p>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
