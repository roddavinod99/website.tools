import json
from collections import Counter

with open('C:/Users/Vinod/Desktop/Project/tools/tools-audit.json', encoding='utf-8') as f:
    data = json.load(f)

# 1. Count of tools by category
categories = Counter([t['registry']['category'] for t in data])

# 2. Count of tools with each advanced feature
features = [
    'hasSearch', 'hasCopy', 'hasDownload', 'hasHistory', 'hasKeyboardShortcuts',
    'hasValidation', 'hasSyntaxHighlighting', 'hasTabs', 'hasMultipleOutputs',
    'hasFileUpload', 'hasDragDrop', 'hasWorker', 'hasWasm', 'hasMultipleInputs',
    'hasExport', 'hasImport', 'hasRealTime', 'hasCopyButtons', 'hasClearButton',
    'hasStats', 'hasComparison', 'hasBatchProcessing', 'hasProgress',
    'hasThemeToggle', 'hasResponsive'
]
feature_counts = {}
for feat in features:
    feature_counts[feat] = sum(1 for t in data if t['advancedFeatures'].get(feat, False))

# 3. Count of tools with each UI problem type
ui_problems = Counter()
for t in data:
    for p in t.get('uiProblems', []):
        ui_problems[p] += 1

# 4. Count of tools marked as worker vs actually using worker
registry_worker = sum(1 for t in data if t['registry'].get('worker', False))
actual_worker = sum(1 for t in data if t['advancedFeatures'].get('hasWorker', False))

# 5. Count of tools with wasm flag vs actual wasm usage
registry_wasm = sum(1 for t in data if t['registry'].get('wasm', False))
actual_wasm = sum(1 for t in data if t['advancedFeatures'].get('hasWasm', False))

# 6. List of tools that have hasMultipleInputs
multi_input_tools = [
    {'slug': t['registry']['slug'], 'name': t['registry']['name'], 'category': t['registry']['category']}
    for t in data if t['advancedFeatures'].get('hasMultipleInputs', False)
]

# 7. List of tools with hasComparison
comparison_tools = [
    {'slug': t['registry']['slug'], 'name': t['registry']['name'], 'category': t['registry']['category']}
    for t in data if t['advancedFeatures'].get('hasComparison', False)
]

# 8. List of tools with hasTabs
tabs_tools = [
    {'slug': t['registry']['slug'], 'name': t['registry']['name'], 'category': t['registry']['category']}
    for t in data if t['advancedFeatures'].get('hasTabs', False)
]

# 9. Count of featured, trending, new, noindex tools
featured = sum(1 for t in data if t['registry'].get('featured', False))
trending = sum(1 for t in data if t['registry'].get('trending', False))
new_tools = sum(1 for t in data if t['registry'].get('new', False))
noindex = sum(1 for t in data if t['registry'].get('noindex', False))

# 10. Slug mismatches between registry and component
slug_mismatches = [
    {'registry_slug': t['registry']['slug'], 'component_slug': t['component'].get('actualSlug', 'N/A'), 'name': t['registry']['name']}
    for t in data if t['registry']['slug'] != t['component'].get('actualSlug', '')
]

result = {
    'totalTools': len(data),
    'toolsByCategory': dict(categories),
    'advancedFeatureCounts': feature_counts,
    'uiProblemCounts': dict(ui_problems),
    'workerStats': {'registryWorker': registry_worker, 'actualWorker': actual_worker},
    'wasmStats': {'registryWasm': registry_wasm, 'actualWasm': actual_wasm},
    'multiInputTools': multi_input_tools,
    'comparisonTools': comparison_tools,
    'tabsTools': tabs_tools,
    'flagsCounts': {'featured': featured, 'trending': trending, 'new': new_tools, 'noindex': noindex},
    'slugMismatches': slug_mismatches
}

print(json.dumps(result, indent=2))
