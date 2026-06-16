// ─────────────────────────────────────────────────────────
// Performance Budget — Bundle Analysis (next-bundle-analyzer)
// ─────────────────────────────────────────────────────────
// Analyzes bundle size using @next/bundle-analyzer.
// Run with: ANALYZE=true next build
// ─────────────────────────────────────────────────────────

/**
 * Usage:
 *
 * 1. Install the analyzer:
 *    npm install --save-dev @next/bundle-analyzer
 *
 * 2. Enable it in next.config.ts:
 *    import withBundleAnalyzer from "@next/bundle-analyzer";
 *
 *    const withBundleAnalyzerConfig = withBundleAnalyzer({
 *      enabled: process.env.ANALYZE === "true",
 *    });
 *
 *    export default withBundleAnalyzerConfig({
 *      // your Next.js config
 *    });
 *
 * 3. Run the analysis:
 *    ANALYZE=true bun run build
 *
 * This generates interactive treemap HTML files in .next/analyze/
 * showing the size of each JavaScript chunk.
 *
 * Target budgets (adjust as needed):
 *   - Main JS bundle:  < 200 KB (gzipped)
 *   - Route page JS:   < 100 KB (gzipped) per page
 *   - CSS:             <  50 KB (gzipped)
 *   - Images:          lazy-load below-fold LCP images
 *   - Total page size: < 500 KB (gzipped) initial load
 */

export {};
