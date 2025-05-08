# scripts/build.py

import sys, json, pandas as pd, pathlib

# 입력 CSV, 출력 JSON 경로
CSV = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])

df = pd.read_csv(CSV)

# 백본별 테마 컬러
COLORS = {
    "CNN": "#60a5fa",
    "GNN": "#34d399",
    "Transformer": "#f472b6",
    "Fourier": "#facc15",
    "MLP": "#a78bfa",
    "Other": "#9ca3af",
}

nodes = [
    {"id": "root", "label": "Data-driven Surrogates"}
]
seen = set(["root"])

for _, row in df.iterrows():
    # ─── 1) Backbone 노드 처리 ─────────────────────────
    # ex: "GNN/Transformer" → "GNN"
    backbone = str(row.Backbone).split("/")[0]
    if backbone not in seen:
        nodes.append({
            "id": backbone,
            "label": backbone,
            "parent": "root",
            "color": COLORS.get(backbone, COLORS["Other"])
        })
        seen.add(backbone)

    # ─── 2) GridType 노드 처리 ─────────────────────────
    # ex: "3.1.1 Regular Grid" → grid_id = "3.1.1"
    grid_label = str(row.GridType)
    grid_id = grid_label.split()[0]
    if grid_id not in seen:
        nodes.append({
            "id": grid_id,
            "label": grid_label,
            "parent": backbone
        })
        seen.add(grid_id)

    # ─── 3) Method 노드 처리 ───────────────────────────
    # DOI/CodeURL NaN→None 처리
    doi   = row.DOI     if pd.notna(row.DOI)     else None
    codeu = row.CodeURL if pd.notna(row.CodeURL) else None
    url   = doi or codeu  # str or None

    nodes.append({
        "id": row.Method,
        "label": f"{row.Method} ({int(row.Year)})",
        "parent": grid_id,
        "year": int(row.Year),
        "source": row.Source,
        "scenario": row.Scenario,
        "url": url,   # null 또는 실제 링크
    })

# ─── 4) JSON 파일로 쓰기 ───────────────────────────
OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w", encoding="utf-8") as f:
    json.dump({"nodes": nodes}, f, ensure_ascii=False, indent=2)

print(f"[build.py] wrote {len(nodes)} nodes → {OUT}")
