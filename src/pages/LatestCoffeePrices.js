import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SOURCE_TABLE_CSS = `
.nhabe-source table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.nhabe-source .gia-ca-phe th,
.nhabe-source .gia-ca-phe td,
.nhabe-source .gia-sau-rieng th,
.nhabe-source .gia-sau-rieng td,
.nhabe-source .bang-gia-nong-san th,
.nhabe-source .bang-gia-nong-san td {
  border: 1px solid #d8d8d8;
  padding: 8px 10px;
  font-size: 14px;
}

.nhabe-source .gia-ca-phe thead th,
.nhabe-source .gia-sau-rieng thead th,
.nhabe-source .bang-gia-nong-san thead th {
  background: #a76c34;
  color: #ffffff;
  font-weight: 700;
}

.nhabe-source .gia-ca-phe tbody tr:nth-child(even),
.nhabe-source .gia-sau-rieng tbody tr:nth-child(even),
.nhabe-source .bang-gia-nong-san tbody tr:nth-child(even) {
  background: #fafafa;
}

.nhabe-source .gia-ca-phe tbody tr td:first-child,
.nhabe-source .gia-sau-rieng tbody tr td:first-child,
.nhabe-source .bang-gia-nong-san tbody tr td:first-child {
  text-align: left;
  font-weight: 600;
}

.nhabe-source .gia-sau-rieng tbody tr td:not(:first-child),
.nhabe-source .gia-sau-rieng thead th:not(:first-child) {
  text-align: center;
}

.nhabe-source .gia-ca-phe .group-title td {
  background: #f4f6f8;
  font-weight: 700;
  border-top: 2px solid #ddd;
}

.nhabe-source .price-up {
  color: #16a34a;
  font-weight: 700;
}

.nhabe-source .price-down {
  color: #dc2626;
  font-weight: 700;
}

.nhabe-source .bang-gia-nong-san th,
.nhabe-source .bang-gia-nong-san td {
  text-align: center;
}

.nhabe-source .bang-gia-nong-san th:nth-child(1),
.nhabe-source .bang-gia-nong-san td:nth-child(1) {
  text-align: left;
}

.nhabe-source .bang-gia-nong-san th:nth-child(2),
.nhabe-source .bang-gia-nong-san td:nth-child(2),
.nhabe-source .bang-gia-nong-san th:nth-child(3),
.nhabe-source .bang-gia-nong-san td:nth-child(3),
.nhabe-source .bang-gia-nong-san th:nth-child(4),
.nhabe-source .bang-gia-nong-san td:nth-child(4),
.nhabe-source .bang-gia-nong-san th:nth-child(5),
.nhabe-source .bang-gia-nong-san td:nth-child(5),
.nhabe-source .bang-gia-nong-san th:nth-child(8),
.nhabe-source .bang-gia-nong-san td:nth-child(8),
.nhabe-source .bang-gia-nong-san th:nth-child(9),
.nhabe-source .bang-gia-nong-san td:nth-child(9) {
  display: none;
}

.nhabe-source .bang-gia-nong-san th:nth-child(6) {
  font-size: 0;
}

.nhabe-source .bang-gia-nong-san th:nth-child(6)::after {
  content: 'GIA (D/KG)';
  font-size: 14px;
  font-weight: 700;
}
`;

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildFallbackTableHtml = (table, index) => {
  const headers = Array.isArray(table?.headers) ? table.headers : [];
  const rows = Array.isArray(table?.rows) ? table.rows : [];

  const className = table?.tableClass || (index === 0 ? 'bang-gia-nong-san' : 'gia-ca-phe');
  const headerHtml = headers.length
    ? `<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>`
    : '';

  const bodyHtml = rows.map((row) => {
    const rowClass = row?._rowClass ? ` class="${escapeHtml(row._rowClass)}"` : '';
    const rowValues = Object.keys(row || {})
      .filter((key) => !key.startsWith('_'))
      .map((key) => row[key]);

    return `<tr${rowClass}>${rowValues.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`;
  }).join('');

  return `<table class="${escapeHtml(className)}">${headerHtml}<tbody>${bodyHtml}</tbody></table>`;
};

const resolveSections = (payload) => {
  const fromSections = Array.isArray(payload?.priceSections) ? payload.priceSections : [];
  if (fromSections.length > 0) {
    return fromSections
      .filter((section) => section?.tableHtml)
      .map((section, index) => ({
        id: section.id || `section_${index + 1}`,
        title: section.title || `Bảng giá #${index + 1}`,
        updatedAt: section.updatedAt || payload?.pageUpdatedAt || payload?.date || '',
        reference: section.reference || null,
        tableHtml: section.tableHtml,
      }));
  }

  const tables = Array.isArray(payload?.allTables) ? payload.allTables : [];
  return tables.map((table, index) => ({
    id: `legacy_${index + 1}`,
    title: table?.title || `Bảng giá #${index + 1}`,
    updatedAt: payload?.pageUpdatedAt || payload?.date || '',
    reference: null,
    tableHtml: table?.tableHtml || buildFallbackTableHtml(table, index),
  }));
};

const LatestCoffeePrices = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const fetchLatest = async () => {
    setLoading(true);
    setError('');

    try {
      const latestRef = doc(db, 'full_prices', 'current');
      const latestSnap = await getDoc(latestRef);
      if (!latestSnap.exists()) {
        throw new Error('Không tìm thấy dữ liệu full_prices/current');
      }
      setPayload(latestSnap.data());
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const sections = useMemo(() => resolveSections(payload), [payload]);
  const pageTitle = payload?.pageTitle || 'Giá nông sản hôm nay';
  const pageUpdatedAt = payload?.pageUpdatedAt || payload?.date || '--';
  const sourceUrl = payload?.url || 'https://nhabeagri.com/gia-nong-san/';

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12">
      <style>{SOURCE_TABLE_CSS}</style>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 rounded-xl border border-[#e2e2e2] bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#262626]">{pageTitle}</h1>
              <p className="mt-1 text-sm text-[#666]">Cập nhật gần nhất: {pageUpdatedAt}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[#a76c34] px-3 py-2 text-sm font-semibold text-[#a76c34] hover:bg-[#fff7f0]"
              >
                Trang nguồn
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={fetchLatest}
                className="inline-flex items-center gap-2 rounded-lg bg-[#38b449] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2c9c3d]"
              >
                <RefreshCw size={14} />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-[#e2e2e2] bg-white p-4 text-sm text-[#666]">
            Đang tải dữ liệu...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">
            {error}
          </div>
        )}

        {!loading && !error && sections.length === 0 && (
          <div className="rounded-xl border border-[#e2e2e2] bg-white p-4 text-sm text-[#666]">
            Chưa có dữ liệu bảng giá.
          </div>
        )}

        {!loading && !error && sections.length > 0 && (
          <div className="space-y-5">
            {sections.map((section) => (
              <section key={section.id} className="rounded-xl border border-[#e2e2e2] bg-white p-4">
                {section.title && (
                  <h2 className="mb-3 text-xl font-bold text-[#262626]">{section.title}</h2>
                )}

                {section.updatedAt && (
                  <p className="mb-3 text-sm text-[#666]">{section.updatedAt}</p>
                )}

                <div
                  className="nhabe-source overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: section.tableHtml }}
                />

                {section.reference?.href && (
                  <a
                    href={section.reference.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#a76c34] hover:underline"
                  >
                    {section.reference.text || 'Xem chi tiết'}
                    <ExternalLink size={14} />
                  </a>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestCoffeePrices;
