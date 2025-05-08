import pandas as pd, sys, json, pathlib

csv_path = pathlib.Path(sys.argv[1])
out_path = pathlib.Path(sys.argv[2])
df = pd.read_csv(csv_path)
out_path.parent.mkdir(parents=True, exist_ok=True)
df.to_json(out_path, orient="records", force_ascii=False)