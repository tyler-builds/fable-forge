interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryPanelProps {
  glossary: GlossaryTerm[];
}

export function GlossaryPanel({ glossary }: GlossaryPanelProps) {
  return (
    <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 p-3 rounded-lg border border-amber-300 dark:border-amber-600 flex-1">
      <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">📜 Glossary</h4>
      <div className="overflow-y-auto" style={{ maxHeight: "calc(50vh - 200px)" }}>
        {glossary.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">Terms will appear as you explore...</p>
        ) : (
          <div className="space-y-1">
            {glossary.map((term, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-semibold">{term.term}:</span>
                <span className="text-gray-600 dark:text-gray-300"> {term.definition}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}