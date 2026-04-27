import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Search, BookOpen, Users, TrendingUp, Calendar, Filter } from 'lucide-react';
import papersData from './data.json';
import './index.css';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6'];

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  // Process data for charts
  const { yearData, keywordData, authorData, filteredPapers } = useMemo(() => {
    // 1. Papers search and filter
    const filtered = papersData.filter(paper => {
      const matchSearch = (paper['논문명']?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           paper['저자']?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchKeyword = filterKeyword ? paper['키워드(한국어)']?.includes(filterKeyword) : true;
      return matchSearch && matchKeyword;
    });

    // 2. Year Trend Data (extract year from YYYYMM format)
    const yearCounts = {};
    papersData.forEach(p => {
      if (p['발행년']) {
        const year = String(p['발행년']).substring(0, 4);
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    const yearChart = Object.keys(yearCounts)
      .sort()
      .map(year => ({ year, count: yearCounts[year] }));

    // 3. Keyword Data
    const keywordCounts = {};
    papersData.forEach(p => {
      if (p['키워드(한국어)']) {
        const keywords = p['키워드(한국어)'].split(',').map(k => k.trim());
        keywords.forEach(k => {
          if (k) keywordCounts[k] = (keywordCounts[k] || 0) + 1;
        });
      }
    });
    const keywordChart = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 4. Author Data
    const authorCounts = {};
    papersData.forEach(p => {
      if (p['저자']) {
        authorCounts[p['저자']] = (authorCounts[p['저자']] || 0) + 1;
      }
    });
    const authorChart = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      yearData: yearChart,
      keywordData: keywordChart,
      authorData: authorChart,
      filteredPapers: filtered
    };
  }, [searchTerm, filterKeyword]);

  const uniqueKeywords = useMemo(() => {
    const kw = new Set();
    papersData.forEach(p => {
      if (p['키워드(한국어)']) {
        p['키워드(한국어)'].split(',').map(k => k.trim()).forEach(k => k && kw.add(k));
      }
    });
    return Array.from(kw).sort();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>공자 '인(仁)' 연구 논문 대시보드</h1>
          <p>현대 학술 연구 트렌드 분석 및 탐색 시스템</p>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Key Metrics */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon"><BookOpen size={24} /></div>
            <div className="metric-info">
              <h3>총 논문 수</h3>
              <p>{papersData.length}편</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Users size={24} /></div>
            <div className="metric-info">
              <h3>연구 참여자</h3>
              <p>{Object.keys(authorData).length}+명</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><TrendingUp size={24} /></div>
            <div className="metric-info">
              <h3>가장 활발한 연구년도</h3>
              <p>{yearData.length > 0 ? yearData.reduce((a, b) => a.count > b.count ? a : b).year : '-'}년</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><Calendar size={24} /></div>
            <div className="metric-info">
              <h3>연구 기간</h3>
              <p>{yearData.length > 0 ? `${yearData[0].year} - ${yearData[yearData.length-1].year}` : '-'}</p>
            </div>
          </div>
        </section>

        <div className="charts-grid">
          {/* Chart 1: Year Trend */}
          <div className="chart-card card-span-2">
            <h2>연도별 연구 트렌드</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Top Keywords */}
          <div className="chart-card">
            <h2>핵심 키워드 Top 10</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Researchers */}
          <div className="chart-card">
            <h2>주요 연구자 (Top 5)</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={authorData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {authorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="custom-legend">
                {authorData.map((entry, index) => (
                  <div key={`legend-${index}`} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="legend-text">{entry.name} ({entry.count}편)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Table */}
        <section className="table-section">
          <div className="table-header-controls">
            <h2>논문 상세 검색 및 필터링</h2>
            <div className="controls-group">
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="논문명, 저자 검색..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-dropdown">
                <Filter size={18} className="filter-icon" />
                <select 
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                >
                  <option value="">모든 키워드</option>
                  {uniqueKeywords.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>발행년</th>
                  <th>논문명</th>
                  <th>저자</th>
                  <th>학술지</th>
                  <th>키워드</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.length > 0 ? (
                  filteredPapers.map((paper, idx) => (
                    <tr key={paper.NO || idx}>
                      <td>{paper.NO}</td>
                      <td>{String(paper['발행년']).substring(0,4)}</td>
                      <td className="paper-title" title={paper['논문명']}>{paper['논문명']}</td>
                      <td>{paper['저자']}</td>
                      <td>{paper['학술지 명']}</td>
                      <td className="keywords-cell">
                        <div className="keywords-list">
                          {paper['키워드(한국어)'] ? paper['키워드(한국어)'].split(',').slice(0, 3).map((k, i) => (
                            <span key={i} className="keyword-tag">{k.trim()}</span>
                          )) : '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">검색 결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
