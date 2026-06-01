/**
 * RagaSelector — choose which raga to explore.
 */

import { RAGAS } from "../music/ragas";

interface RagaSelectorProps {
  ragaName: string;
  onRagaChange: (name: string) => void;
}

export function RagaSelector({ ragaName, onRagaChange }: RagaSelectorProps) {
  return (
    <div className="control-row">
      <label htmlFor="raga-select">Raga</label>
      <select
        id="raga-select"
        value={ragaName}
        onChange={(e) => onRagaChange(e.target.value)}
      >
        {RAGAS.map((raga) => (
          <option key={raga.name} value={raga.name}>
            {raga.name}
          </option>
        ))}
      </select>
    </div>
  );
}
