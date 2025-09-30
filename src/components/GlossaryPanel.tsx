interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryPanelProps {
  glossary: GlossaryTerm[];
}

export function GlossaryPanel({ glossary }: GlossaryPanelProps) {
  return (
    <div className="p-3 rounded-lg flex-1">
      <div className="overflow-y-auto" style={{ maxHeight: "80vh" }}>
        {glossary.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">Terms will appear as you explore...</p>
        ) : (
          <div className="space-y-3">
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