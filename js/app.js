(() => {
  // ── Font catalogue ─────────────────────────────────────────────────
  const FONTS = [
    { label: 'Great Vibes',         value: "'Great Vibes', cursive",        category: 'Handwriting' },
    { label: 'Pinyon Script',       value: "'Pinyon Script', cursive",       category: 'Handwriting' },
    { label: 'Allura',              value: "'Allura', cursive",              category: 'Handwriting' },
    { label: 'Alex Brush',          value: "'Alex Brush', cursive",          category: 'Handwriting' },
    { label: 'Sacramento',          value: "'Sacramento', cursive",          category: 'Handwriting' },
    { label: 'Tangerine',           value: "'Tangerine', cursive",           category: 'Handwriting' },
    { label: 'Dancing Script',      value: "'Dancing Script', cursive",      category: 'Handwriting' },
    { label: 'Satisfy',             value: "'Satisfy', cursive",             category: 'Handwriting' },
    { label: 'Pacifico',            value: "'Pacifico', cursive",            category: 'Handwriting' },
    { label: 'Cinzel',              value: "'Cinzel', serif",                category: 'Elegant Serif' },
    { label: 'Cormorant Garamond',  value: "'Cormorant Garamond', serif",    category: 'Elegant Serif' },
    { label: 'Playfair Display',    value: "'Playfair Display', serif",      category: 'Elegant Serif' },
    { label: 'EB Garamond',         value: "'EB Garamond', serif",           category: 'Elegant Serif' },
    { label: 'Crimson Text',        value: "'Crimson Text', serif",          category: 'Elegant Serif' },
    { label: 'Libre Baskerville',   value: "'Libre Baskerville', serif",     category: 'Elegant Serif' },
    { label: 'Georgia',             value: 'Georgia, serif',                 category: 'Classic' },
    { label: 'Palatino',            value: "'Palatino Linotype', serif",     category: 'Classic' },
    { label: 'Times New Roman',     value: "'Times New Roman', serif",       category: 'Classic' },
    { label: 'Raleway',             value: "'Raleway', sans-serif",          category: 'Sans-serif' },
    { label: 'Lato',                value: "'Lato', sans-serif",             category: 'Sans-serif' },
    { label: 'Arial',               value: 'Arial, sans-serif',              category: 'Sans-serif' },
    { label: 'Verdana',             value: 'Verdana, sans-serif',            category: 'Sans-serif' },
    { label: 'Courier New',         value: "'Courier New', monospace",       category: 'Monospace' },
  ];

  // ── Default typography for new fields ─────────────────────────────
  function defaultTypography() {
    return {
      font:          FONTS[0].value,
      size:          72,
      color:         '#2c1a0e',
      bold:          false,
      italic:        false,
      align:         'center',
      textTransform: 'none',
    };
  }

  // ── State ──────────────────────────────────────────────────────────
  const state = {
    image:          null,
    naturalW:       0,
    naturalH:       0,
    scale:          0.65,
    fields:         [],   // [{key, x, y, font, size, color, bold, italic, align, _bbox}]
    activeFieldIdx: -1,
    draggingField:  false,
    dragFieldOffX:  0,
    dragFieldOffY:  0,
    committedFont:  FONTS[0].value,
    hoverFont:      null,
    excelData:      [],
    excelColumns:   [],
    // Per-row preview & overrides
    previewRowIdx:  0,    // which row is shown on canvas
    editingRowIdx:  -1,   // -1 = editing global defaults; >=0 = edits save to that row's overrides
    rowOverrides:   {},   // { rowIdx: { fieldKey: { x?, y?, font?, size?, ... } } }
  };

  // ── DOM refs ───────────────────────────────────────────────────────
  const canvas      = document.getElementById('previewCanvas');
  const ctx         = canvas.getContext('2d');

  const fontSize    = document.getElementById('fontSize');
  const fontColor   = document.getElementById('fontColor');
  const fontColorHex = document.getElementById('fontColorHex');
  const boldBtn     = document.getElementById('boldBtn');
  const italicBtn   = document.getElementById('italicBtn');
  const alignBtns     = document.querySelectorAll('.align-btn');
  const transformBtns = document.querySelectorAll('.transform-btn');

  const activeFieldLabel = document.getElementById('activeFieldLabel');

  const btnDownload  = document.getElementById('btnDownload');
  const btnBulk      = document.getElementById('btnBulk');
  const progressWrap = document.getElementById('progressWrap');
  const progressFill = document.getElementById('progressFill');
  const progressLbl  = document.getElementById('progressLbl');

  const zoomInBtn   = document.getElementById('zoomIn');
  const zoomOutBtn  = document.getElementById('zoomOut');
  const zoomLbl     = document.getElementById('zoomLbl');

  const fontPicker       = document.getElementById('fontPicker');
  const fontTrigger      = document.getElementById('fontTrigger');
  const fontTriggerLabel = document.getElementById('fontTriggerLabel');
  const fontDropdown     = document.getElementById('fontDropdown');

  const excelFile          = document.getElementById('excelFile');
  const excelUploadArea    = document.getElementById('excelUploadArea');
  const excelUploadLabel   = document.getElementById('excelUploadLabel');
  const excelPreviewWrap   = document.getElementById('excelPreviewWrap');
  const excelTableBody     = document.getElementById('excelTableBody');
  const excelPreviewTitle  = document.getElementById('excelPreviewTitle');
  const excelCount         = document.getElementById('excelCount');
  const btnClearExcel      = document.getElementById('btnClearExcel');
  const columnFieldsSection = document.getElementById('columnFieldsSection');
  const columnChipsEl      = document.getElementById('columnChips');

  const waModal         = document.getElementById('waModal');
  const waModalClose    = document.getElementById('waModalClose');
  const waModalDone     = document.getElementById('waModalDone');
  const btnOpenWa       = document.getElementById('btnOpenWa');
  const btnWaLogout     = document.getElementById('btnWaLogout');
  const waStatusBadge   = document.getElementById('waStatusBadge');
  const waQrBox         = document.getElementById('waQrBox');
  const waConnectText   = document.getElementById('waConnectText');
  const waSteps         = document.getElementById('waSteps');
  const waCountryCode   = document.getElementById('waCountryCode');
  const waPhoneColumn   = document.getElementById('waPhoneColumn');

  const emailModal      = document.getElementById('emailModal');
  const emailModalClose = document.getElementById('emailModalClose');
  const emailModalDone  = document.getElementById('emailModalDone');
  const btnOpenCompose  = document.getElementById('btnOpenCompose');
  const composeSummary  = document.getElementById('composeSummary');
  const varChipsEl      = document.getElementById('varChips');

  const rowIndicator        = document.getElementById('rowIndicator');
  const rowIndicatorLabel   = document.getElementById('rowIndicatorLabel');
  const btnExitRowEdit      = document.getElementById('btnExitRowEdit');
  const btnResetRowOverride = document.getElementById('btnResetRowOverride');

  const certDropZone      = document.getElementById('certDropZone');
  const certFileInput     = document.getElementById('certFileInput');
  const changeTemplateBtn = document.getElementById('changeTemplateBtn');
  const canvasContainer   = document.getElementById('canvasContainer');
  const canvasHint        = document.getElementById('canvasHint');

  const API_BASE = 'http://localhost:3001';

  const msgBody        = document.getElementById('emailBody');
  const btnSendWa      = document.getElementById('btnSendWa');
  const btnStopWa      = document.getElementById('btnStopWa');
  const waProgressWrap = document.getElementById('waProgressWrap');
  const waProgressFill = document.getElementById('waProgressFill');
  const waProgressLbl  = document.getElementById('waProgressLbl');
  const waResultLog    = document.getElementById('waResultLog');

  // ── Build font picker dropdown ─────────────────────────────────────
  (function buildDropdown() {
    let currentCategory = '';
    FONTS.forEach((f, idx) => {
      if (f.category !== currentCategory) {
        currentCategory = f.category;
        const sep = document.createElement('div');
        sep.className = 'font-category-label';
        sep.textContent = f.category;
        fontDropdown.appendChild(sep);
      }
      const item = document.createElement('div');
      item.className = 'font-item' + (idx === 0 ? ' active' : '');
      item.dataset.idx = idx;
      item.style.fontFamily = f.value;
      item.innerHTML = `
        <span>${f.label}</span>
        <svg class="font-item-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="2 8 6 12 14 4"/>
        </svg>`;
      item.addEventListener('mouseenter', () => {
        state.hoverFont = f.value;
        if (state.activeFieldIdx >= 0) render();
      });
      item.addEventListener('click', () => { commitFont(idx); closeDropdown(); });
      fontDropdown.appendChild(item);
    });
  })();

  function commitFont(idx, silent = false) {
    state.committedFont = FONTS[idx].value;
    state.hoverFont = null;
    fontTriggerLabel.style.fontFamily = state.committedFont;
    fontTriggerLabel.textContent = FONTS[idx].label;
    fontDropdown.querySelectorAll('.font-item').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.idx) === idx);
    });
    if (!silent) {
      saveActiveFieldTypography();
      render();
    }
  }

  function openDropdown() {
    fontDropdown.classList.add('open');
    fontTrigger.classList.add('open');
    FONTS.forEach(f => {
      document.fonts.load(`${parseInt(fontSize.value) || 72}px ${f.value}`).catch(() => {});
    });
  }

  function closeDropdown() {
    state.hoverFont = null;
    fontDropdown.classList.remove('open');
    fontTrigger.classList.remove('open');
    render();
  }

  fontTrigger.addEventListener('click', () => {
    if (fontDropdown.classList.contains('open')) closeDropdown();
    else openDropdown();
  });

  fontDropdown.addEventListener('mouseleave', () => { state.hoverFont = null; render(); });
  document.addEventListener('click', e => { if (!fontPicker.contains(e.target)) closeDropdown(); });

  // ── Helpers ────────────────────────────────────────────────────────
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity / 100})`;
  }

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.className = '', 2500);
  }

  // ── Per-row override helpers ───────────────────────────────────────
  // Returns the effective field for rendering at a given rowIdx (base merged with any overrides)
  function getEffectiveField(baseField, rowIdx) {
    const override = (rowIdx >= 0) ? state.rowOverrides[rowIdx]?.[baseField.key] : null;
    return override ? { ...baseField, ...override } : baseField;
  }

  function hasRowOverrides(rowIdx) {
    const o = state.rowOverrides[rowIdx];
    return !!o && Object.keys(o).length > 0;
  }

  // ── Typography read/write ──────────────────────────────────────────
  function readTypographyFromControls() {
    return {
      font:          state.committedFont,
      size:          parseInt(fontSize.value) || 72,
      color:         fontColor.value,
      bold:          boldBtn.classList.contains('active'),
      italic:        italicBtn.classList.contains('active'),
      align:         document.querySelector('.align-btn.active')?.dataset.align || 'center',
      textTransform: document.querySelector('.transform-btn.active')?.dataset.transform || 'none',
    };
  }

  function writeTypographyToControls(t) {
    const fidx = FONTS.findIndex(f => f.value === t.font);
    if (fidx >= 0) commitFont(fidx, true);

    fontSize.value = t.size;
    fontColor.value = t.color;
    fontColorHex.value = t.color;

    boldBtn.classList.toggle('active', t.bold);
    italicBtn.classList.toggle('active', t.italic);

    alignBtns.forEach(b => b.classList.toggle('active', b.dataset.align === t.align));
    transformBtns.forEach(b => b.classList.toggle('active', b.dataset.transform === (t.textTransform || 'none')));

  }

  function saveActiveFieldTypography() {
    if (state.activeFieldIdx < 0) return;
    const t = readTypographyFromControls();
    const baseField = state.fields[state.activeFieldIdx];

    if (state.editingRowIdx >= 0) {
      // Save typography override for this specific row
      if (!state.rowOverrides[state.editingRowIdx]) state.rowOverrides[state.editingRowIdx] = {};
      if (!state.rowOverrides[state.editingRowIdx][baseField.key]) state.rowOverrides[state.editingRowIdx][baseField.key] = {};
      Object.assign(state.rowOverrides[state.editingRowIdx][baseField.key], t);
      updateTableRowHighlights();
    } else {
      Object.assign(baseField, t);
    }
  }

  // ── Field management ───────────────────────────────────────────────
  function addField(key, x, y) {
    const t = readTypographyFromControls();
    state.fields.push({ key, x, y, ...t, _bbox: null });
    selectField(state.fields.length - 1);
    updateBulkBtn();
  }

  function selectField(idx) {
    state.activeFieldIdx = idx;
    if (idx >= 0) {
      const baseField = state.fields[idx];
      // Show effective typography (with row overrides if in row-edit mode)
      const effectiveField = getEffectiveField(baseField, state.editingRowIdx);
      writeTypographyToControls(effectiveField);
      activeFieldLabel.textContent = baseField.key;
      activeFieldLabel.classList.add('has-field');
    } else {
      activeFieldLabel.textContent = 'no field selected';
      activeFieldLabel.classList.remove('has-field');
    }
    render();
  }

  function removeActiveField() {
    if (state.activeFieldIdx < 0) return;
    const key = state.fields[state.activeFieldIdx].key;
    // Also remove any row overrides for this field
    for (const rowIdx of Object.keys(state.rowOverrides)) {
      delete state.rowOverrides[rowIdx][key];
    }
    state.fields.splice(state.activeFieldIdx, 1);
    state.activeFieldIdx = -1;
    activeFieldLabel.textContent = 'no field selected';
    activeFieldLabel.classList.remove('has-field');
    updateBulkBtn();
    updateTableRowHighlights();
    render();
  }

  // Delete / Backspace removes the selected field (when not typing in a box)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return;
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
    if (document.querySelector('.modal-overlay.open')) return;
    if (state.activeFieldIdx < 0) return;
    e.preventDefault();
    removeActiveField();
  });

  function updateBulkBtn() {
    btnBulk.disabled = state.excelData.length === 0 || state.fields.length === 0;
  }

  // ── Hit testing ────────────────────────────────────────────────────
  function hitTestFields(cx, cy) {
    for (let i = state.fields.length - 1; i >= 0; i--) {
      const b = state.fields[i]._bbox;
      if (!b) continue;
      const pad = 10;
      if (cx >= b.x1 - pad && cx <= b.x2 + pad && cy >= b.y1 - pad && cy <= b.y2 + pad) return i;
    }
    return -1;
  }

  // ── Build field font string ────────────────────────────────────────
  function buildFieldFont(field, overrideFont) {
    const parts = [];
    if (field.italic) parts.push('italic');
    if (field.bold)   parts.push('bold');
    parts.push(`${field.size}px`);
    parts.push(overrideFont || field.font);
    return parts.join(' ');
  }

  // ── Canvas rendering ───────────────────────────────────────────────
  function render() {
    if (!state.image) return;
    const w = state.naturalW;
    const h = state.naturalH;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(state.image, 0, 0, w, h);

    const previewRow = state.excelData[state.previewRowIdx] || null;

    for (let i = 0; i < state.fields.length; i++) {
      const baseField = state.fields[i];
      // Apply row overrides for the currently previewed row
      const field = getEffectiveField(baseField, state.previewRowIdx);

      const value = previewRow ? (previewRow[field.key] || `[${field.key}]`) : `[${field.key}]`;
      const x = field.x * w;
      const y = field.y * h;

      const effectiveFont = (i === state.activeFieldIdx && state.hoverFont)
        ? buildFieldFont(field, state.hoverFont)
        : buildFieldFont(field);

      drawFieldOnCtx(ctx, field, value, x, y, effectiveFont);

      // Store bbox on baseField for hit testing (at the rendered/override position)
      ctx.font = effectiveFont;
      const tw = ctx.measureText(applyTextTransform(value, field.textTransform || 'none')).width;
      const th = field.size * 1.4;
      let x1, x2;
      if (field.align === 'center') { x1 = x - tw / 2; x2 = x + tw / 2; }
      else if (field.align === 'left') { x1 = x; x2 = x + tw; }
      else { x1 = x - tw; x2 = x; }
      baseField._bbox = { x1, y1: y - th / 2, x2, y2: y + th / 2 };

      // Selection indicator
      if (i === state.activeFieldIdx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.85)';
        ctx.lineWidth = Math.max(1.5, w / 600);
        ctx.setLineDash([6, 4]);
        const pad = 8;
        ctx.strokeRect(x1 - pad, y - th / 2 - pad / 2, (x2 - x1) + pad * 2, th + pad);
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

  }

  function applyTextTransform(value, transform) {
    if (transform === 'uppercase') return value.toUpperCase();
    if (transform === 'titlecase') return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return value;
  }

  function drawFieldOnCtx(c, field, value, x, y, fontOverride) {
    const displayValue = applyTextTransform(value, field.textTransform || 'none');
    c.font         = fontOverride || buildFieldFont(field);
    c.fillStyle    = field.color;
    c.textAlign    = field.align;
    c.textBaseline = 'middle';

    c.shadowColor = 'transparent';
    c.shadowBlur = c.shadowOffsetX = c.shadowOffsetY = 0;
    c.fillText(displayValue, x, y);
  }

  // ── Generate certificate blob ──────────────────────────────────────
  // rowIdx: pass the actual data row index so per-row overrides are applied
  function generateCertBlob(rowData, rowIdx = -1) {
    return new Promise(resolve => {
      const off = document.createElement('canvas');
      off.width  = state.naturalW;
      off.height = state.naturalH;
      const oc = off.getContext('2d');
      oc.drawImage(state.image, 0, 0, state.naturalW, state.naturalH);
      for (const baseField of state.fields) {
        const value = rowData[baseField.key] || '';
        if (!value) continue;
        const field = getEffectiveField(baseField, rowIdx);
        drawFieldOnCtx(oc, field, value, field.x * state.naturalW, field.y * state.naturalH);
      }
      off.toBlob(resolve, 'image/png');
    });
  }

  function blobToBase64(blob) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }

  // ── Download ───────────────────────────────────────────────────────
  function safeName(n) {
    return String(n).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 60) || 'certificate';
  }

  async function downloadPreview() {
    if (!state.image) { toast('Load a certificate template first', 'warning'); return; }
    const rowIdx = state.previewRowIdx;
    const rowData = state.excelData[rowIdx] || {};
    const blob = await generateCertBlob(rowData, rowIdx);
    const nameKey = state.excelColumns.find(k => k.includes('name')) || state.excelColumns[0];
    const label = (nameKey && rowData[nameKey]) ? safeName(rowData[nameKey]) : 'preview';
    triggerDownload(blob, `${label}_certificate.png`);
    toast('Preview downloaded!', 'success');
  }

  async function downloadBulk() {
    const rows = state.excelData;
    if (!rows.length) { toast('Upload an Excel file first', 'warning'); return; }
    if (!state.fields.length) { toast('Place at least one field on the canvas first', 'warning'); return; }
    if (typeof JSZip === 'undefined') { toast('JSZip not loaded', 'warning'); return; }

    btnBulk.disabled = true;
    progressWrap.classList.add('visible');
    const zip = new JSZip();

    const nameKey = state.excelColumns.find(k => k.includes('name')) || state.excelColumns[0];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const label = (nameKey && row[nameKey]) ? row[nameKey] : `row_${i + 1}`;
      progressFill.style.width = `${(i / rows.length) * 100}%`;
      progressLbl.textContent  = `Generating ${i + 1} / ${rows.length}: ${label}`;
      // Pass i as rowIdx so each row uses its own overrides
      const blob = await generateCertBlob(row, i);
      zip.file(`${safeName(label)}_${i + 1}.png`, blob);
      await new Promise(r => setTimeout(r, 0));
    }

    progressFill.style.width = '100%';
    progressLbl.textContent  = 'Compressing…';
    await new Promise(r => setTimeout(r, 50));

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    triggerDownload(zipBlob, 'certificates.zip');
    progressWrap.classList.remove('visible');
    progressFill.style.width = '0%';
    btnBulk.disabled = false;
    updateBulkBtn();
    toast(`${rows.length} certificate${rows.length !== 1 ? 's' : ''} downloaded!`, 'success');
  }

  function triggerDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  // ── Excel Import ───────────────────────────────────────────────────
  excelUploadArea.addEventListener('click', () => excelFile.click());

  excelUploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    excelUploadArea.classList.add('drag-over');
  });
  excelUploadArea.addEventListener('dragleave', () => excelUploadArea.classList.remove('drag-over'));
  excelUploadArea.addEventListener('drop', e => {
    e.preventDefault();
    excelUploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) parseExcelFile(file);
  });

  excelFile.addEventListener('change', () => {
    if (excelFile.files[0]) parseExcelFile(excelFile.files[0]);
  });

  function parseExcelFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows.length) { toast('No data found in the file', 'warning'); return; }

        const normalise = obj => {
          const result = {};
          for (const k of Object.keys(obj)) result[k.toLowerCase().trim()] = String(obj[k]).trim();
          return result;
        };

        const parsed = rows.map(normalise);
        const allKeys  = Object.keys(parsed[0]);
        const nameKey  = allKeys.find(k => k.includes('name'))  || allKeys[0];
        const phoneKey = allKeys.find(k => /whats|phone|mobile|mob\b|contact|number|\bno\b/.test(k)) || '';

        state.excelColumns = allKeys;
        state.excelData = parsed.map(r => ({
          ...r,
          name:  r[nameKey]  || '',
        })).filter(r => r.name || allKeys.some(k => r[k]));

        if (!state.excelData.length) { toast('No valid rows found', 'warning'); return; }

        // Reset row state when new file is loaded
        state.previewRowIdx = 0;
        state.editingRowIdx = -1;
        state.rowOverrides  = {};

        buildVarChips();
        buildPhoneColumnSelect(allKeys, phoneKey);
        buildColumnChips(allKeys);
        renderExcelPreview();
        updateBulkBtn();
        updateRowIndicator();
        excelUploadLabel.textContent = `${file.name} (${state.excelData.length} rows)`;
        toast(`Loaded ${state.excelData.length} rows — ${allKeys.length} column${allKeys.length !== 1 ? 's' : ''} detected`, 'success');
        render();
      } catch (err) {
        toast('Failed to parse file: ' + err.message, 'warning');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function renderExcelPreview() {
    const data = state.excelData;
    const cols = state.excelColumns;
    const displayCols = cols.slice(0, 4);
    const colSpan = displayCols.length + 1;

    const thead = document.getElementById('excelTableHead');
    thead.innerHTML = '<tr><th>#</th>' + displayCols.map(c => `<th>${esc(c)}</th>`).join('') + '</tr>';

    excelTableBody.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
      const tr = document.createElement('tr');
      tr.dataset.rowIdx = i;
      tr.innerHTML = `<td>${i + 1}</td>` + displayCols.map(c => `<td>${esc(data[i][c] || '—')}</td>`).join('');
      tr.addEventListener('click', () => selectPreviewRow(i));
      excelTableBody.appendChild(tr);
    }
    excelPreviewTitle.textContent = `Preview — ${data.length} row${data.length !== 1 ? 's' : ''}, ${cols.length} col${cols.length !== 1 ? 's' : ''}`;
    excelPreviewWrap.style.display = 'block';
    excelCount.style.display = 'inline-flex';
    excelCount.textContent = `${data.length} rows`;
    updateTableRowHighlights();
    updateSendBtn();
  }

  // ── Per-row preview & editing ──────────────────────────────────────
  function selectPreviewRow(rowIdx) {
    state.previewRowIdx = rowIdx;
    state.editingRowIdx = rowIdx;

    // If active field exists, refresh typography panel to show row overrides
    if (state.activeFieldIdx >= 0) {
      const baseField = state.fields[state.activeFieldIdx];
      const effectiveField = getEffectiveField(baseField, rowIdx);
      writeTypographyToControls(effectiveField);
    }

    updateTableRowHighlights();
    updateRowIndicator();
    render();
  }

  function exitRowEditMode() {
    state.previewRowIdx = 0;
    state.editingRowIdx = -1;

    // Refresh typography panel to show global settings for active field
    if (state.activeFieldIdx >= 0) {
      writeTypographyToControls(state.fields[state.activeFieldIdx]);
    }

    updateTableRowHighlights();
    updateRowIndicator();
    render();
  }

  function updateTableRowHighlights() {
    excelTableBody.querySelectorAll('tr[data-row-idx]').forEach(tr => {
      const idx = parseInt(tr.dataset.rowIdx);
      tr.classList.toggle('active', idx === state.previewRowIdx && state.editingRowIdx >= 0);
      tr.classList.toggle('customized', hasRowOverrides(idx));
    });
  }

  function updateRowIndicator() {
    if (state.editingRowIdx < 0) {
      rowIndicator.style.display = 'none';
      return;
    }
    rowIndicator.style.display = '';
    const row = state.excelData[state.editingRowIdx];
    const nameKey = state.excelColumns.find(k => k.includes('name')) || state.excelColumns[0];
    const name = (row && nameKey && row[nameKey]) ? row[nameKey] : `Row ${state.editingRowIdx + 1}`;
    const total = state.excelData.length;
    rowIndicatorLabel.textContent = `Row ${state.editingRowIdx + 1} of ${total}: ${name}`;
  }

  btnExitRowEdit.addEventListener('click', exitRowEditMode);

  btnResetRowOverride.addEventListener('click', () => {
    if (state.editingRowIdx < 0) return;
    delete state.rowOverrides[state.editingRowIdx];
    // Refresh typography panel to show global settings
    if (state.activeFieldIdx >= 0) {
      writeTypographyToControls(state.fields[state.activeFieldIdx]);
    }
    updateTableRowHighlights();
    render();
    toast(`Row ${state.editingRowIdx + 1} overrides cleared`, 'success');
  });

  // ── Column chips ───────────────────────────────────────────────────
  function buildColumnChips(columns) {
    columnChipsEl.innerHTML = '';
    columns.forEach(col => {
      const chip = document.createElement('div');
      chip.className = 'col-chip';
      chip.draggable = true;
      chip.dataset.key = col;
      chip.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
        ${esc(col)}`;
      chip.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', col);
        e.dataTransfer.effectAllowed = 'copy';
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      columnChipsEl.appendChild(chip);
    });
    columnFieldsSection.style.display = '';
  }

  btnClearExcel.addEventListener('click', () => {
    state.excelData    = [];
    state.excelColumns = [];
    state.fields       = [];
    state.activeFieldIdx = -1;
    state.previewRowIdx  = 0;
    state.editingRowIdx  = -1;
    state.rowOverrides   = {};
    excelPreviewWrap.style.display = 'none';
    excelCount.style.display = 'none';
    excelUploadLabel.textContent = 'Click to upload or drag & drop';
    excelFile.value = '';
    columnFieldsSection.style.display = 'none';
    columnChipsEl.innerHTML = '';
    buildVarChips();
    updateBulkBtn();
    updateSendBtn();
    updateRowIndicator();
    activeFieldLabel.textContent = 'no field selected';
    activeFieldLabel.classList.remove('has-field');
    render();
    toast('Excel data cleared');
  });

  // ── Canvas drop zone ───────────────────────────────────────────────
  canvas.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    canvas.classList.add('drop-over');
  });

  canvas.addEventListener('dragleave', () => canvas.classList.remove('drop-over'));

  canvas.addEventListener('drop', e => {
    e.preventDefault();
    canvas.classList.remove('drop-over');
    const key = e.dataTransfer.getData('text/plain');
    if (!key || !state.excelColumns.includes(key)) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    addField(key, x, y);
    toast(`"${key}" placed on canvas`, 'success');
  });

  // ── Canvas drag to reposition fields ──────────────────────────────
  function canvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left)  / rect.width,
      y: (clientY - rect.top)   / rect.height,
    };
  }

  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const c = canvasCoords(e);
    const cx = c.x * state.naturalW;
    const cy = c.y * state.naturalH;
    const hitIdx = hitTestFields(cx, cy);

    if (hitIdx >= 0) {
      selectField(hitIdx);
      state.draggingField = true;
      const baseField = state.fields[hitIdx];
      // Use effective (override-aware) position for drag offset calculation
      const f = getEffectiveField(baseField, state.previewRowIdx);
      state.dragFieldOffX = c.x - f.x;
      state.dragFieldOffY = c.y - f.y;
      canvas.style.cursor = 'grabbing';
    } else {
      selectField(-1);
    }
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!state.draggingField || state.activeFieldIdx < 0) return;
    const c = canvasCoords(e);
    const newX = Math.max(0, Math.min(1, c.x - state.dragFieldOffX));
    const newY = Math.max(0, Math.min(1, c.y - state.dragFieldOffY));

    const baseField = state.fields[state.activeFieldIdx];

    if (state.editingRowIdx >= 0) {
      // Save position override for this specific row
      if (!state.rowOverrides[state.editingRowIdx]) state.rowOverrides[state.editingRowIdx] = {};
      if (!state.rowOverrides[state.editingRowIdx][baseField.key]) state.rowOverrides[state.editingRowIdx][baseField.key] = {};
      state.rowOverrides[state.editingRowIdx][baseField.key].x = newX;
      state.rowOverrides[state.editingRowIdx][baseField.key].y = newY;
      updateTableRowHighlights();
    } else {
      baseField.x = newX;
      baseField.y = newY;
    }
    render();
  });

  window.addEventListener('mouseup', () => {
    state.draggingField = false;
    canvas.style.cursor = 'crosshair';
  });

  canvas.addEventListener('touchstart', e => {
    const c = canvasCoords(e);
    const cx = c.x * state.naturalW;
    const cy = c.y * state.naturalH;
    const hitIdx = hitTestFields(cx, cy);

    if (hitIdx >= 0) {
      selectField(hitIdx);
      state.draggingField = true;
      const baseField = state.fields[hitIdx];
      const f = getEffectiveField(baseField, state.previewRowIdx);
      state.dragFieldOffX = c.x - f.x;
      state.dragFieldOffY = c.y - f.y;
    } else {
      selectField(-1);
    }
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    if (!state.draggingField || state.activeFieldIdx < 0) return;
    const c = canvasCoords(e);
    const newX = Math.max(0, Math.min(1, c.x - state.dragFieldOffX));
    const newY = Math.max(0, Math.min(1, c.y - state.dragFieldOffY));

    const baseField = state.fields[state.activeFieldIdx];

    if (state.editingRowIdx >= 0) {
      if (!state.rowOverrides[state.editingRowIdx]) state.rowOverrides[state.editingRowIdx] = {};
      if (!state.rowOverrides[state.editingRowIdx][baseField.key]) state.rowOverrides[state.editingRowIdx][baseField.key] = {};
      state.rowOverrides[state.editingRowIdx][baseField.key].x = newX;
      state.rowOverrides[state.editingRowIdx][baseField.key].y = newY;
      updateTableRowHighlights();
    } else {
      baseField.x = newX;
      baseField.y = newY;
    }
    render();
  }, { passive: false });

  window.addEventListener('touchend', () => { state.draggingField = false; });

  // ── Zoom ───────────────────────────────────────────────────────────
  const ZOOM_STEPS = [0.25, 0.35, 0.5, 0.65, 0.75, 1.0];
  let zoomIdx = 3;

  function applyZoom() {
    state.scale = ZOOM_STEPS[zoomIdx];
    zoomLbl.textContent = Math.round(state.scale * 100) + '%';
    if (state.naturalW) {
      canvas.style.width  = Math.round(state.naturalW  * state.scale) + 'px';
      canvas.style.height = Math.round(state.naturalH * state.scale) + 'px';
    }
  }

  zoomInBtn.addEventListener('click',  () => { if (zoomIdx < ZOOM_STEPS.length - 1) { zoomIdx++; applyZoom(); } });
  zoomOutBtn.addEventListener('click', () => { if (zoomIdx > 0)                     { zoomIdx--; applyZoom(); } });

  function autoFitZoom() {
    const wrap = document.getElementById('canvasWrap');
    const availW = (wrap.clientWidth  || 800) - 48;
    const availH = (wrap.clientHeight || 600) - 100;
    const bestScale = Math.min(availW / state.naturalW, availH / state.naturalH, 1.0);
    let idx = 0;
    for (let i = 0; i < ZOOM_STEPS.length; i++) {
      if (ZOOM_STEPS[i] <= bestScale) idx = i;
    }
    zoomIdx = idx;
    applyZoom();
  }

  // ── Typography control changes → update active field ──────────────
  function onTypographyChange() {
    saveActiveFieldTypography();
    render();
  }

  fontSize.addEventListener('input', onTypographyChange);
  boldBtn.addEventListener('click',   () => { boldBtn.classList.toggle('active');   onTypographyChange(); });
  italicBtn.addEventListener('click', () => { italicBtn.classList.toggle('active'); onTypographyChange(); });

  alignBtns.forEach(btn => btn.addEventListener('click', () => {
    alignBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    onTypographyChange();
  }));

  transformBtns.forEach(btn => btn.addEventListener('click', () => {
    transformBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    onTypographyChange();
  }));

  fontColor.addEventListener('input', () => { fontColorHex.value = fontColor.value; onTypographyChange(); });
  fontColorHex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(fontColorHex.value)) { fontColor.value = fontColorHex.value; onTypographyChange(); }
  });

  // ── Download buttons ───────────────────────────────────────────────
  btnDownload.addEventListener('click', downloadPreview);
  btnBulk.addEventListener('click', downloadBulk);

  // ── Modal helpers ──────────────────────────────────────────────────
  function openModal(modal) {
    modal.classList.add('open');
    modal.removeAttribute('aria-hidden');
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  [waModal, emailModal].forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(waModal); closeModal(emailModal); updateComposeSummary(); }
  });

  btnOpenWa.addEventListener('click', () => { openModal(waModal); pollWaStatus(); });
  waModalClose.addEventListener('click', () => closeModal(waModal));
  waModalDone.addEventListener('click',  () => closeModal(waModal));

  btnOpenCompose.addEventListener('click', () => { openModal(emailModal); msgBody.focus(); });
  emailModalClose.addEventListener('click', () => { closeModal(emailModal); updateComposeSummary(); });
  emailModalDone.addEventListener('click',  () => { closeModal(emailModal); updateComposeSummary(); });

  function updateComposeSummary() {
    const firstLine = msgBody.value.trim().split('\n')[0];
    composeSummary.textContent = firstLine || 'No message set';
  }

  // ── Message editor (plain text with WhatsApp formatting) ───────────
  document.querySelectorAll('.rich-btn[data-wrap]').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const mark = btn.dataset.wrap;
      const { selectionStart: st, selectionEnd: en, value } = msgBody;
      const sel = value.slice(st, en) || 'text';
      msgBody.value = value.slice(0, st) + mark + sel + mark + value.slice(en);
      msgBody.focus();
      msgBody.setSelectionRange(st + 1, st + 1 + sel.length);
      saveDraft();
    });
  });

  msgBody.addEventListener('input', () => { saveDraft(); updateComposeSummary(); });

  document.getElementById('btnSaveTemplate').addEventListener('click', () => {
    const name = prompt('Template name:');
    if (!name || !name.trim()) return;
    const list = getTemplates();
    list.push({ name: name.trim(), text: msgBody.value });
    setTemplates(list);
    buildTemplateSelect();
    toast(`Template "${name.trim()}" saved`, 'success');
  });

  document.getElementById('templateSelect').addEventListener('change', function() {
    const val = this.value;
    if (!val) return;
    const list = getTemplates();
    if (val.startsWith('del_')) {
      const idx = parseInt(val.replace('del_', ''), 10);
      const tName = list[idx]?.name || 'template';
      if (!confirm(`Delete template "${tName}"?`)) { this.value = ''; return; }
      list.splice(idx, 1);
      setTemplates(list);
      buildTemplateSelect();
      toast('Template deleted');
      this.value = '';
      return;
    }
    const t = list[parseInt(val, 10)];
    if (!t) { this.value = ''; return; }
    msgBody.value = t.text || '';
    updateComposeSummary();
    saveDraft();
    toast(`Template "${t.name}" loaded`, 'success');
    this.value = '';
  });

  // ── WhatsApp connection ────────────────────────────────────────────
  const WA_SETTINGS_KEY = 'certgen_wa';
  let waState = { status: 'offline' };
  let waPollTimer = null;

  function loadWaSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(WA_SETTINGS_KEY) || '{}');
      if (saved.countryCode) waCountryCode.value = saved.countryCode;
    } catch (_) {}
  }

  waCountryCode.addEventListener('input', () => {
    try { localStorage.setItem(WA_SETTINGS_KEY, JSON.stringify({ countryCode: waCountryCode.value.trim() })); } catch (_) {}
  });

  function setWaBadge(text, ok) {
    waStatusBadge.textContent = text;
    waStatusBadge.className   = 'smtp-status-badge ' + (ok ? 'configured' : 'unconfigured');
  }

  function renderWaState() {
    const s = waState;
    btnWaLogout.style.display = s.status === 'ready' ? '' : 'none';
    waSteps.style.display     = s.status === 'qr' ? '' : 'none';
    waQrBox.classList.toggle('connected', s.status === 'ready');

    if (s.status === 'ready') {
      const who = s.me ? `+${s.me.number}${s.me.name ? ' (' + s.me.name + ')' : ''}` : '';
      setWaBadge('Connected', true);
      waQrBox.innerHTML = '✓';
      waConnectText.innerHTML = `WhatsApp connected ${esc(who)}<br><span style="color:var(--text-muted)">You can close this window and send certificates.</span>`;
    } else if (s.status === 'qr' && s.qr) {
      setWaBadge('Scan QR', false);
      waQrBox.innerHTML = `<img src="${s.qr}" alt="WhatsApp QR code" />`;
      waConnectText.textContent = 'Scan this QR code with the WhatsApp app on your phone.';
    } else if (s.status === 'offline') {
      setWaBadge('Server off', false);
      waQrBox.innerHTML = '<div class="wa-spinner"></div>';
      waConnectText.textContent = 'Cannot reach the server. Start it with "npm start" and open http://localhost:3001/index.html';
    } else if (s.status === 'error') {
      setWaBadge('Error', false);
      waQrBox.innerHTML = '<div class="wa-spinner"></div>';
      waConnectText.textContent = 'WhatsApp error: ' + (s.error || 'unknown') + ' — retrying…';
    } else {
      setWaBadge('Starting…', false);
      waQrBox.innerHTML = '<div class="wa-spinner"></div>';
      waConnectText.textContent = 'Starting WhatsApp… this can take up to a minute the first time.';
    }
    updateSendBtn();
  }

  async function pollWaStatus() {
    clearTimeout(waPollTimer);
    try {
      const res = await fetch(`${API_BASE}/api/wa/status`);
      waState = await res.json();
    } catch (_) {
      waState = { status: 'offline' };
    }
    renderWaState();
    // Poll quickly while waiting for a scan, slowly once connected
    const delay = waState.status === 'ready' ? 15000 : 2500;
    waPollTimer = setTimeout(pollWaStatus, delay);
  }

  btnWaLogout.addEventListener('click', async () => {
    if (!confirm('Log out this computer from your WhatsApp?')) return;
    try { await fetch(`${API_BASE}/api/wa/logout`, { method: 'POST' }); } catch (_) {}
    waState = { status: 'starting' };
    renderWaState();
    setTimeout(pollWaStatus, 2000);
  });

  // ── Phone column ───────────────────────────────────────────────────
  function buildPhoneColumnSelect(cols, detected) {
    waPhoneColumn.innerHTML = '<option value="">— choose column —</option>' +
      cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    waPhoneColumn.value = detected || '';
    updateSendBtn();
  }
  waPhoneColumn.addEventListener('change', updateSendBtn);

  // ── Draft & Template persistence ──────────────────────────────────
  const DRAFT_KEY     = 'cert_wa_draft';
  const TEMPLATES_KEY = 'cert_wa_templates';

  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, msgBody.value); } catch (_) {}
  }

  function restoreDraft() {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) msgBody.value = draft;
    } catch (_) {}
    updateComposeSummary();
  }

  function getTemplates() {
    try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]'); } catch (_) { return []; }
  }

  function setTemplates(list) {
    try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list)); } catch (_) {}
  }

  function buildTemplateSelect() {
    const sel = document.getElementById('templateSelect');
    const list = getTemplates();
    sel.innerHTML = '<option value="">Load Template…</option>';
    list.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = t.name;
      sel.appendChild(opt);
    });
    if (list.length) {
      const sep = document.createElement('option');
      sep.disabled = true; sep.textContent = '─────────────';
      sel.appendChild(sep);
      list.forEach((t, i) => {
        const opt = document.createElement('option');
        opt.value = `del_${i}`;
        opt.textContent = `✕ Delete: ${t.name}`;
        sel.appendChild(opt);
      });
    }
  }

  // ── Variables ──────────────────────────────────────────────────────
  function insertVariable(variable) {
    const { selectionStart: st, selectionEnd: en, value } = msgBody;
    msgBody.value = value.slice(0, st) + variable + value.slice(en);
    msgBody.focus();
    msgBody.setSelectionRange(st + variable.length, st + variable.length);
    saveDraft();
    updateComposeSummary();
  }

  function buildVarChips() {
    varChipsEl.innerHTML = '';
    const cols = state.excelColumns;
    if (!cols.length) {
      const hint = document.createElement('span');
      hint.className = 'var-chip-hint';
      hint.textContent = 'Upload an Excel file to see column variables';
      varChipsEl.appendChild(hint);
      return;
    }
    ['firstName', ...cols].forEach(col => {
      const chip = document.createElement('span');
      chip.className = 'var-chip';
      chip.textContent = `{{${col}}}`;
      chip.addEventListener('mousedown', e => e.preventDefault());
      chip.addEventListener('click', () => insertVariable(`{{${col}}}`));
      varChipsEl.appendChild(chip);
    });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function applyVariables(template, rowData) {
    const name = rowData.name || '';
    const enriched = { ...rowData, firstName: name.trim().split(/\s+/)[0] || '', name };
    let result = template;
    for (const [key, val] of Object.entries(enriched)) {
      result = result.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'gi'), String(val || ''));
    }
    return result;
  }

  let sending = false;

  function updateSendBtn() {
    if (sending) return;
    btnSendWa.disabled = state.excelData.length === 0;
  }

  // ── Send on WhatsApp ───────────────────────────────────────────────
  btnSendWa.addEventListener('click', sendAllWhatsApp);
  let stopRequested = false;
  btnStopWa.addEventListener('click', () => {
    stopRequested = true;
    btnStopWa.disabled = true;
    btnStopWa.textContent = 'Stopping after this one…';
  });

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function sendAllWhatsApp() {
    const data = state.excelData;
    if (!data.length) { toast('No Excel data loaded', 'warning'); return; }
    if (!state.image) { toast('Load a certificate template first', 'warning'); return; }

    if (waState.status !== 'ready') {
      toast('Connect WhatsApp first — scan the QR code', 'warning');
      openModal(waModal);
      pollWaStatus();
      return;
    }

    const phoneCol = waPhoneColumn.value;
    if (!phoneCol) { toast('Choose which column has the phone numbers', 'warning'); waPhoneColumn.focus(); return; }

    const countryCode = waCountryCode.value.trim();
    const textTpl = msgBody.value.trim() || 'Hi {{firstName}}, congratulations! 🎉 Here is your certificate.';

    const recipients = data.filter(r => String(r[phoneCol] || '').replace(/\D/g, ''));
    const skipped = data.length - recipients.length;
    if (!recipients.length) { toast(`No phone numbers found in column "${phoneCol}"`, 'warning'); return; }
    if (skipped) toast(`${skipped} row(s) have no phone number — they will be skipped`, 'warning');

    const ok = confirm(
      `Send ${recipients.length} certificate${recipients.length > 1 ? 's' : ''} on WhatsApp` +
      (waState.me ? ` from +${waState.me.number}` : '') + '?\n\n' +
      'There is a short random gap between messages so WhatsApp does not flag your number as spam.'
    );
    if (!ok) return;

    sending = true;
    stopRequested = false;
    btnSendWa.disabled = true;
    btnStopWa.style.display = '';
    btnStopWa.disabled = false;
    btnStopWa.textContent = 'Stop sending';
    waProgressWrap.classList.add('visible');
    waResultLog.style.display = 'block';
    waResultLog.innerHTML = '';

    let successCount = 0;
    let failCount    = 0;

    for (let i = 0; i < recipients.length; i++) {
      if (stopRequested) break;
      const rowData = recipients[i];
      const dataIdx = state.excelData.indexOf(rowData);
      const name    = rowData.name || `Row ${dataIdx + 1}`;
      const phone   = rowData[phoneCol];
      waProgressFill.style.width = `${(i / recipients.length) * 100}%`;
      waProgressLbl.textContent  = `Sending ${i + 1} / ${recipients.length}: ${name}`;

      try {
        const blob   = await generateCertBlob(rowData, dataIdx);
        const base64 = await blobToBase64(blob);
        const res = await fetch(`${API_BASE}/api/wa/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            countryCode,
            caption:          applyVariables(textTpl, rowData),
            attachmentBase64: base64,
            filename:         `${safeName(name)}_certificate.png`,
          }),
        });
        const out = await res.json().catch(() => ({ error: res.statusText }));
        if (!res.ok) throw new Error(out.error || res.statusText);
        successCount++;
        appendLog(name, '+' + out.to, true);
      } catch (err) {
        failCount++;
        appendLog(name, String(phone), false, err.message);
      }

      if (i < recipients.length - 1 && !stopRequested) {
        const wait = 3000 + Math.random() * 4000; // 3–7 s between messages
        waProgressLbl.textContent = `Sent ${i + 1} / ${recipients.length} — waiting ${Math.round(wait / 1000)}s…`;
        await sleep(wait);
      }
    }

    waProgressFill.style.width = '100%';
    waProgressLbl.textContent  = `${stopRequested ? 'Stopped' : 'Done'} — ${successCount} sent, ${failCount} failed`;
    setTimeout(() => {
      waProgressWrap.classList.remove('visible');
      waProgressFill.style.width = '0%';
    }, 4000);

    sending = false;
    btnStopWa.style.display = 'none';
    updateSendBtn();
    toast(`${successCount} sent, ${failCount} failed`, successCount > 0 ? 'success' : 'warning');
  }

  function appendLog(name, phone, ok, errMsg = '') {
    const div = document.createElement('div');
    div.className = 'log-row ' + (ok ? 'ok' : 'fail');
    div.innerHTML = ok
      ? `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="2 8 6 12 14 4"/></svg><span>${esc(name)}</span><small>${esc(phone)}</small>`
      : `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="14" y1="2" x2="2" y2="14"/><line x1="2" y1="2" x2="14" y2="14"/></svg><span>${esc(name)}</span><small>${esc(phone)}</small><small class="err">${esc(errMsg)}</small>`;
    waResultLog.appendChild(div);
    waResultLog.scrollTop = waResultLog.scrollHeight;
  }

  // ── Certificate image upload ───────────────────────────────────────
  function showDropZone() {
    certDropZone.style.display  = '';
    canvasContainer.style.display = 'none';
    canvasHint.style.display    = 'none';
    changeTemplateBtn.classList.remove('visible');
  }

  function hideDropZone() {
    certDropZone.style.display    = 'none';
    canvasContainer.style.display = '';
    canvasHint.style.display      = '';
    changeTemplateBtn.classList.add('visible');
    document.getElementById('sidebar').style.display = '';
  }

  function loadCertificateImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.image    = img;
      state.naturalW = img.naturalWidth;
      state.naturalH = img.naturalHeight;
      autoFitZoom();
      hideDropZone();
      render();
      URL.revokeObjectURL(url);
      toast(`Certificate loaded — ${state.naturalW}×${state.naturalH}px`, 'success');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast('Could not load image file', 'warning');
    };
    img.src = url;
  }

  certDropZone.addEventListener('dragover', e => {
    e.preventDefault();
    certDropZone.classList.add('drag-active');
  });

  certDropZone.addEventListener('dragleave', () => certDropZone.classList.remove('drag-active'));

  certDropZone.addEventListener('drop', e => {
    e.preventDefault();
    certDropZone.classList.remove('drag-active');
    const file = [...e.dataTransfer.files].find(f => f.type.startsWith('image/'));
    if (!file) { toast('Please drop an image file (PNG, JPG, WebP)', 'warning'); return; }
    loadCertificateImage(file);
  });

  certFileInput.addEventListener('change', () => {
    if (certFileInput.files[0]) {
      loadCertificateImage(certFileInput.files[0]);
      certFileInput.value = '';
    }
  });

  changeTemplateBtn.addEventListener('click', () => certFileInput.click());

  // ── Load template ──────────────────────────────────────────────────
  function loadTemplate() {
    const img = new Image();
    img.onload = () => {
      state.image    = img;
      state.naturalW = img.naturalWidth;
      state.naturalH = img.naturalHeight;
      canvas.width   = state.naturalW;
      canvas.height  = state.naturalH;
      applyZoom();
      render();
    };
    img.onerror = () => { toast('Could not load assets/template.png', 'warning'); };
    img.src = 'assets/template.png';
  }

  // ── Init ───────────────────────────────────────────────────────────
  fontTriggerLabel.style.fontFamily = state.committedFont;
  buildVarChips();
  loadWaSettings();
  restoreDraft();
  pollWaStatus();
  buildTemplateSelect();
  updateRowIndicator();
  showDropZone();
})();