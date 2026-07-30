# Publication data workflow

`papers.json` is the research-map source of truth. The public page reads it at
runtime, so the same paper is used for the year filter, research map, and
subfield filter.

## Add a paper

1. Copy `new-paper.example.json` outside the repository and fill in the paper
   metadata. `title`, `date`, and `abstract` are required.
2. Run:

   ```bash
   python3 publication/manage_papers.py add /path/to/new-paper.json
   ```

The command adds one international-publication card to `index.html` and the
same record to `papers.json`. The research map reads the new record
automatically.

`research_area`, `subfield`, and `map_label` are optional. If omitted, the
manager infers them from the title, abstract, and keywords. Set them explicitly
when you want a particular map placement or short label.

## Existing data

`bootstrap` is for maintainers only; it recreates the initial 38-paper map
dataset from an audit export and should not be used after papers have been
added through `add`.
