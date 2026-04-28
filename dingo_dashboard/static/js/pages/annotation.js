/** annotation.js — Variant annotation summary page. */

function renderAnnotation(container) {
  const ann = PIPELINE_DATA.annotations;
  const totalVariants = PIPELINE_DATA.variantStats.gatk.afterFinalFilter;

  const impactDefs = {
    HIGH:     { color: 'var(--clr-red)',    badge: 'impact-HIGH',     icon: '🔴', desc: 'Loss of function: stop-gain, frameshift, splice-site donor/acceptor. Likely disrupts or eliminates protein function.' },
    MODERATE: { color: 'var(--clr-amber)',  badge: 'impact-MODERATE', icon: '🟡', desc: 'Non-disruptive variant that might change protein effectiveness: missense, in-frame indel, codon change.' },
    LOW:      { color: 'var(--clr-green)',  badge: 'impact-LOW',      icon: '🟢', desc: 'Unlikely to change protein behaviour: synonymous, splice region, start retained.' },
    MODIFIER: { color: 'var(--clr-indigo)', badge: 'impact-MODIFIER', icon: '🔵', desc: 'Intergenic, intronic, upstream/downstream (<5 kb from gene). Effect is unknown or very small.' },
  };

  const consequenceDefs = {
    'intergenic_region':      'Variant falls between genes — no direct gene effect',
    'upstream_gene_variant':  'Within 5 kb upstream of a gene start',
    'downstream_gene_variant':'Within 5 kb downstream of a gene end',
    'intron_variant':         'Within an intron — may affect splicing regulation',
    'synonymous_variant':     'Coding change that does NOT alter the amino acid',
    'missense_variant':       'Coding change that DOES alter the amino acid',
    'splice_region_variant':  'Near a splice site — may affect mRNA splicing',
    '3_prime_UTR_variant':    'In the 3′ untranslated region of a transcript',
    '5_prime_UTR_variant':    'In the 5′ untranslated region of a transcript',
  };

  const totalImpact = Object.values(ann.impacts).reduce((a, b) => a + b, 0);
  const totalCons   = Object.values(ann.consequences).reduce((a, b) => a + b, 0);

  function pct(n, total) { return total > 0 ? (n / total * 100).toFixed(1) : '0.0'; }

  container.innerHTML = `
    <!-- Intro -->
    <div class="card" style="margin-bottom:24px;">
      <div class="card__title"><span class="card__title-icon">🔖</span>What is Variant Annotation?</div>
      <div class="grid-2">
        <div style="font-size:.84rem;color:var(--clr-text-secondary);line-height:1.75;">
          <p><strong style="color:var(--clr-text-primary);">Variant annotation</strong> assigns biological meaning to each variant identified in the genome. For each SNP or Indel, SnpEff predicts its functional consequence by comparing the variant's position to known gene structures (exons, introns, UTRs, regulatory regions).</p>
          <p style="margin-top:10px;">The annotation answers: <em>"If this base changes, does it affect a protein? Which one? How severely?"</em></p>
        </div>
        <div>
          <div class="alert alert--info">
            <span class="alert__icon">ℹ</span>
            <div>
              <strong>Tool used:</strong> SnpEff 5.x<br>
              <strong>Database:</strong> ASM325472v1.99 (dingo genome)<br>
              <strong>Input GATK:</strong> ${totalVariants} final variants<br>
              <strong>Input BCFtools:</strong> ${PIPELINE_DATA.variantStats.bcftools.afterFinalFilter} final variants<br>
              <strong>Annotation type:</strong> VCF ANN field (SO terms)
            </div>
          </div>
          <div class="alert alert--warning" style="margin-top:10px;">
            <span class="alert__icon">⚠</span>
            <div>
              <strong>Known limitation:</strong> The dingo genome annotation (ASM325472v1.99) is less complete than the human genome. Many variants fall in unannotated intergenic regions, resulting in a high proportion of MODIFIER annotations. This is expected.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Impact categories -->
    <div class="section">
      <div class="section__title">🎯 Impact Categories</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title">Impact distribution</div>
          <div style="height:220px;position:relative;"><canvas id="impact-donut"></canvas></div>
        </div>
        <div class="card">
          <div class="card__title">Impact definitions</div>
          ${Object.entries(ann.impacts).map(([imp, count]) => {
            const def = impactDefs[imp];
            const fraction = pct(count, totalImpact);
            return `<div style="padding:10px 0;border-bottom:1px solid var(--clr-border-soft);">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span class="badge ${def.badge}">${def.icon} ${imp}</span>
                <strong style="font-size:.9rem;color:var(--clr-text-primary);">${count}</strong>
                <span style="font-size:.76rem;color:var(--clr-text-muted);">(${fraction}%)</span>
              </div>
              <div class="progress-bar" style="margin-bottom:4px;">
                <div class="progress-bar__fill" style="width:${fraction}%;background:${def.color};"></div>
              </div>
              <div style="font-size:.76rem;color:var(--clr-text-muted);">${def.desc}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Consequences -->
    <div class="section">
      <div class="section__title">⚙️ Functional Consequences</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title">Consequence distribution</div>
          <div style="height:260px;position:relative;"><canvas id="consequence-bar"></canvas></div>
        </div>
        <div class="card">
          <div class="card__title">Consequence table</div>
          <div class="table-wrap">
            <table style="font-size:.8rem;">
              <thead><tr><th>Consequence</th><th>Count</th><th>%</th><th>Description</th></tr></thead>
              <tbody>
                ${Object.entries(ann.consequences)
                  .sort((a,b) => b[1]-a[1])
                  .map(([cons, count]) => `<tr>
                    <td><code style="font-size:.74rem;">${cons.replace(/_/g,' ')}</code></td>
                    <td style="text-align:center;font-weight:700;">${count}</td>
                    <td style="text-align:center;color:var(--clr-text-muted);">${pct(count, totalCons)}%</td>
                    <td style="font-size:.74rem;color:var(--clr-text-muted);">${consequenceDefs[cons] || ''}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Potentially relevant variants -->
    <div class="section">
      <div class="section__title">⭐ Potentially Biologically Relevant Variants</div>
      <div class="card">
        <div class="alert alert--info" style="margin-bottom:14px;">
          <span class="alert__icon">ℹ</span>
          Variants with MODERATE or HIGH impact are the most likely to have functional consequences. Given the low number of final variants (133 GATK), each variant on a main chromosome likely represents a true genomic difference between the dingo samples.
        </div>
        <div class="grid-2">
          <div>
            <div class="card__title">MODERATE impact variants (~3 total)</div>
            <table style="font-size:.8rem;">
              <thead><tr><th>Effect</th><th>Impact</th><th>Interpretation</th></tr></thead>
              <tbody>
                <tr><td>missense_variant</td><td><span class="badge impact-MODERATE">MODERATE</span></td><td>Non-synonymous amino acid change — may alter protein function</td></tr>
                <tr><td>synonymous_variant</td><td><span class="badge impact-LOW">LOW</span></td><td>Silent mutation — same amino acid, no protein change expected</td></tr>
                <tr><td>splice_region_variant</td><td><span class="badge impact-LOW">LOW</span></td><td>Near splice site — may affect mRNA splicing efficiency</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div class="card__title">Why most variants are MODIFIER</div>
            <ul style="font-size:.82rem;color:var(--clr-text-secondary);line-height:1.8;padding-left:18px;">
              <li>Only ~1% of the mammalian genome is protein-coding</li>
              <li>WGS captures all variants including non-functional regions</li>
              <li>LD pruning selects markers randomly, not by function</li>
              <li>Dingo genome annotation is less complete than human</li>
              <li>Intergenic variants may still affect regulatory elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Interpretation guide -->
    <div class="section">
      <div class="section__title">📖 How to Interpret SnpEff Annotations</div>
      <div class="card">
        <div class="grid-2">
          <div>
            <div class="card__title">Reading the ANN field</div>
            <div style="font-size:.78rem;color:var(--clr-text-secondary);line-height:1.7;">
              <p>Each variant's <code>ANN</code> INFO field contains one or more annotations separated by commas. Each annotation is pipe-delimited:</p>
              <code style="display:block;margin:8px 0;padding:8px;background:var(--clr-surface-2);border-radius:var(--r-md);font-size:.72rem;word-break:break-all;">
                ALT | Effect | Impact | GeneName | GeneId | FeatureType | FeatureId | ...
              </code>
              <p style="margin-top:8px;">Example: <code>A|missense_variant|MODERATE|BRCA1|gene123|transcript|NM_001|coding_sequence_variant|...</code></p>
            </div>
          </div>
          <div>
            <div class="card__title">Important caveats</div>
            <ul style="font-size:.82rem;color:var(--clr-text-secondary);line-height:1.8;padding-left:18px;">
              <li><strong style="color:var(--clr-text-primary);">Annotation ≠ causation</strong> — SnpEff predicts effects based on position only</li>
              <li><strong style="color:var(--clr-text-primary);">Database completeness</strong> — The dingo genome annotation may miss genes</li>
              <li><strong style="color:var(--clr-text-primary);">Naming mismatch</strong> — NC_ vs chr naming caused errors, corrected by script 12</li>
              <li><strong style="color:var(--clr-text-primary);">Low sample size</strong> — Only 2 individuals; statistical power is limited</li>
              <li><strong style="color:var(--clr-text-primary);">Low read depth</strong> — DP 2-19 means some calls may be uncertain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Annotation note -->
    <div class="alert alert--warning" style="margin-bottom:20px;">
      <span class="alert__icon">⚠</span>
      <div><strong>Note on annotation statistics:</strong> ${ann.note}</div>
    </div>
  `;

  setTimeout(() => {
    renderImpactChart('impact-donut');
    renderConsequenceChart('consequence-bar');
  }, 100);
}
