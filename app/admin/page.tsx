'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  LogOut, 
  FileText,
  Clock,
  Compass,
  ArrowLeftRight,
  Filter,
  CheckCircle,
  Building
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone: string;
  birthDate: string;
  address: string;
  interests: string;
  createdAt: string;
}

interface NewsPost {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  views: number;
  createdAt: string;
}

interface StatsSummary {
  todayPV: number;
  todayUV: number;
  monthPV: number;
  monthUV: number;
  totalRegistered: number;
}

interface DailyTrendItem {
  date: string;
  pv: number;
  uv: number;
}

interface KeywordItem {
  keyword: string;
  count: number;
}

interface ReferrerItem {
  name: string;
  count: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'news'>('dashboard');

  // 데이터 상태들
  const [statsSummary, setStatsSummary] = useState<StatsSummary | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<KeywordItem[]>([]);
  const [referrerStats, setReferrerStats] = useState<ReferrerItem[]>([]);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);

  // 검색 및 필터링
  const [customerSearch, setCustomerSearch] = useState('');
  const [interestFilter, setInterestFilter] = useState('ALL');

  // 모달 상태 (새소식 생성/수정용)
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [currentNewsItem, setCurrentNewsItem] = useState<{
    id?: number;
    title: string;
    content: string;
    imageUrl: string;
  }>({
    title: '',
    content: '',
    imageUrl: ''
  });

  // 로딩 및 에러
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. 전체 데이터 로드
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1) 통계
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.status === 401) {
        router.push('/admin/login');
        return;
      }
      const statsJson = await statsRes.json();
      if (statsJson.success && statsJson.data) {
        setStatsSummary(statsJson.data.summary);
        setDailyTrend(statsJson.data.dailyTrend || []);
        setPopularKeywords(statsJson.data.popularKeywords || []);
        setReferrerStats(statsJson.data.referrerStats || []);
      }

      // 2) 고객 리스트
      const custRes = await fetch('/api/admin/customers');
      const custJson = await custRes.json();
      if (custJson.success && custJson.data) {
        setCustomers(custJson.data);
      }

      // 3) 새소식 리스트
      const newsRes = await fetch('/api/admin/news?limit=100');
      const newsJson = await newsRes.json();
      if (newsJson.success && newsJson.data) {
        setNews(newsJson.data);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 2. 로그아웃 핸들러
  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. 관심고객 목록 필터링 적용
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.replace(/-/g, '').includes(customerSearch.replace(/-/g, ''));
    
    const matchesInterest = 
      interestFilter === 'ALL' || 
      c.interests.includes(interestFilter);

    return matchesSearch && matchesInterest;
  });

  // 4. CSV 다운로드 구현 (순수 JS)
  const downloadCustomersCSV = () => {
    if (filteredCustomers.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const headers = ['번호', '이름', '연락처', '생년월일', '거주지(동)', '관심평형', '등록일시'];
    const rows = filteredCustomers.map((c, idx) => [
      idx + 1,
      c.name,
      c.phone,
      c.birthDate,
      c.address,
      c.interests,
      new Date(c.createdAt).toLocaleString('ko-KR')
    ]);

    // 한글 깨짐 방지 BOM 삽입
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `부성동포스코더샵_관심고객리스트_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. 새소식 CRUD - 저장 (생성/수정 공용)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    if (!currentNewsItem.title.trim() || !currentNewsItem.content.trim()) {
      alert('제목과 내용을 모두 작성해주세요.');
      setActionLoading(false);
      return;
    }

    const isEdit = !!currentNewsItem.id;
    const url = '/api/admin/news';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isEdit ? currentNewsItem : {
          title: currentNewsItem.title,
          content: currentNewsItem.content,
          imageUrl: currentNewsItem.imageUrl
        })
      });

      const json = await res.json();
      if (json.success) {
        alert(isEdit ? '수정이 성공적으로 완료되었습니다.' : '새글이 등록되었습니다.');
        setNewsModalOpen(false);
        // 상태 초기화
        setCurrentNewsItem({ title: '', content: '', imageUrl: '' });
        // 데이터 리로드
        loadAllData();
      } else {
        alert(json.error || '오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. 새소식 CRUD - 삭제
  const handleDeleteNews = async (id: number) => {
    if (!confirm('이 게시글을 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        alert('삭제되었습니다.');
        loadAllData();
      } else {
        alert(json.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 통신 오류가 발생했습니다.');
    }
  };

  // 7. 경량화 SVG 방문 트렌드 그래프 계산
  const renderSVGTrend = () => {
    if (dailyTrend.length === 0) return null;
    const width = 600;
    const height = 150;
    const padding = 20;

    const maxVal = Math.max(...dailyTrend.map(d => Math.max(d.pv, d.uv, 5)));
    
    // 점 매핑 계산
    const pointsPV = dailyTrend.map((d, idx) => {
      const x = padding + (idx / (dailyTrend.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.pv / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const pointsUV = dailyTrend.map((d, idx) => {
      const x = padding + (idx / (dailyTrend.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.uv / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-[180px] bg-slate-50 border border-slate-200 rounded-lg p-2 font-sans" viewBox={`0 0 ${width} ${height}`}>
        {/* 가로 그리드 라인 */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />

        {/* PV 라인 (페이지뷰: 블루) */}
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={pointsPV} />
        {/* UV 라인 (순방문자: 골드) */}
        <polyline fill="none" stroke="#d4af37" strokeWidth="3" points={pointsUV} strokeDasharray="4" />

        {/* 라벨 날짜 렌더 */}
        {dailyTrend.map((d, idx) => {
          const x = padding + (idx / (dailyTrend.length - 1)) * (width - padding * 2);
          return (
            <g key={idx}>
              <text x={x} y={height - 4} fill="#64748b" fontSize="8" textAnchor="middle">{d.date}</text>
              <circle cx={x} cy={height - padding - (d.pv / maxVal) * (height - padding * 2)} r="3" fill="#2563eb" />
              <circle cx={x} cy={height - padding - (d.uv / maxVal) * (height - padding * 2)} r="3" fill="#d4af37" />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* 1. 어드민 상단 헤더 */}
      <header className="bg-[#0b1a30] text-white shadow-md border-b border-[#c5a85c]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#d4af37] text-[#0b1a30] p-2 rounded-lg font-bold"> 어드민 </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">부성동 포스코더샵 관리 시스템</h1>
              <p className="text-[10px] text-slate-400">천안 부성2구역 공동주택 분양 대행</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="text-xs border border-slate-600 hover:border-[#d4af37] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              홈페이지 가기
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs bg-red-600/90 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. 대시보드 레이아웃 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 좌측 사이드바 내비게이션 */}
        <aside className="lg:col-span-1 space-y-3">
          {[
            { id: 'dashboard', label: '대시보드 통계', icon: TrendingUp },
            { id: 'customers', label: '관심고객 관리', icon: Users },
            { id: 'news', label: '홍보센터 새소식', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#0b1a30] text-white shadow-premium' 
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#d4af37]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] text-slate-400 font-bold block">VIP CUSTOMERS</span>
            <div className="text-3xl font-extrabold text-[#0b1a30] mt-1 font-serif">
              {statsSummary ? statsSummary.totalRegistered : 0} 명
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">실시간 관심고객 등록총액</span>
          </div>
        </aside>

        {/* 우측 메인 콘텐츠 보드 */}
        <main className="lg:col-span-3 space-y-6">
          
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-premium p-20 flex flex-col justify-center items-center text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0b1a30] mb-4"></div>
              <span>어드민 데이터를 로드하고 있습니다...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: 대시보드 */}
              {activeTab === 'dashboard' && statsSummary && (
                <div className="space-y-6">
                  {/* 통계 요약 카드 그리드 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: '오늘 페이지뷰 (PV)', value: statsSummary.todayPV, icon: Eye, color: 'text-blue-600 bg-blue-50' },
                      { label: '오늘 순방문자 (UV)', value: statsSummary.todayUV, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                      { label: '이번달 누적 PV', value: statsSummary.monthPV, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
                      { label: '이번달 누적 UV', value: statsSummary.monthUV, icon: Compass, color: 'text-[#d4af37] bg-yellow-50/50' }
                    ].map((card, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-tight">{card.label}</span>
                          <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                            <card.icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-800 font-serif">
                          {card.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 방문 트렌드 그래프 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">최근 7일간 방문 추이</h3>
                        <p className="text-[10px] text-slate-400">순방문자수(UV)와 총 페이지조회수(PV) 트렌드</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>페이지뷰(PV)</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#d4af37] rounded-full"></span>순방문(UV)</span>
                      </div>
                    </div>
                    {renderSVGTrend()}
                  </div>

                  {/* 키워드 & 유입 채널 표 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 검색어 순위 */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#d4af37]" />
                        <span>인기 유입 검색어 (Top 10)</span>
                      </h4>
                      {popularKeywords.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">수집된 검색 키워드가 없습니다.</div>
                      ) : (
                        <div className="divide-y divide-slate-100 text-xs">
                          {popularKeywords.map((kw, idx) => (
                            <div key={idx} className="flex justify-between py-2">
                              <span className="text-slate-600 font-medium">{idx + 1}. <span className="text-slate-900 font-bold">{kw.keyword}</span></span>
                              <span className="text-blue-600 font-bold">{kw.count}회 유입</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 유입 채널 */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Compass className="w-4 h-4 text-indigo-500" />
                        <span>유입 경로 통계</span>
                      </h4>
                      {referrerStats.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">수집된 리퍼러가 없습니다.</div>
                      ) : (
                        <div className="divide-y divide-slate-100 text-xs">
                          {referrerStats.map((ref, idx) => (
                            <div key={idx} className="flex justify-between py-2">
                              <span className="text-slate-600 font-medium">{ref.name}</span>
                              <span className="text-slate-800 font-bold">{ref.count}회</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 관심고객 리스트 */}
              {activeTab === 'customers' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">관심고객 등록 리스트</h3>
                      <p className="text-[10px] text-slate-400">청약 대기를 등록한 잠재 관심고객들의 세부 목록입니다.</p>
                    </div>
                    
                    {/* 내보내기 버튼 */}
                    <button 
                      onClick={downloadCustomersCSV}
                      className="bg-[#0b1a30] hover:bg-[#d4af37] text-white hover:text-[#0b1a30] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>엑셀(CSV) 다운로드</span>
                    </button>
                  </div>

                  {/* 검색 필터 */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="이름 또는 연락처 검색 (예: 01012345678)"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="w-full sm:w-48 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                      <select
                        value={interestFilter}
                        onChange={(e) => setInterestFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      >
                        <option value="ALL">전체 평형 보기</option>
                        <option value="84㎡A">84㎡A 타입</option>
                        <option value="102㎡A">102㎡A 타입</option>
                        <option value="118㎡A">118㎡A 타입</option>
                      </select>
                    </div>
                  </div>

                  {/* 고객 표 */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    {filteredCustomers.length === 0 ? (
                      <div className="text-center py-20 text-xs text-slate-400 bg-slate-50">해당하는 관심고객 정보가 없습니다.</div>
                    ) : (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead className="bg-[#0b1a30] text-slate-200 text-[10px] uppercase font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3.5 text-center">번호</th>
                            <th className="px-4 py-3.5">이름</th>
                            <th className="px-4 py-3.5">연락처</th>
                            <th className="px-4 py-3.5">생년월일</th>
                            <th className="px-4 py-3.5">거주지 (동까지)</th>
                            <th className="px-4 py-3.5">관심평형대</th>
                            <th className="px-4 py-3.5 text-center">등록일자</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredCustomers.map((c, idx) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-center text-slate-400 font-semibold">{filteredCustomers.length - idx}</td>
                              <td className="px-4 py-3 font-bold text-[#0b1a30]">{c.name}</td>
                              <td className="px-4 py-3 text-slate-800 font-medium">{c.phone}</td>
                              <td className="px-4 py-3 text-slate-500">{c.birthDate}</td>
                              <td className="px-4 py-3 text-slate-600">{c.address}</td>
                              <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{c.interests}</span></td>
                              <td className="px-4 py-3 text-center text-slate-400">{new Date(c.createdAt).toLocaleDateString('ko-KR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: 홍보센터 새소식 관리 */}
              {activeTab === 'news' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">홍보센터 새소식 관리</h3>
                      <p className="text-[10px] text-slate-400">홈페이지 뉴스 섹션에 표시될 게시글 목록을 생성, 수정, 삭제합니다.</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentNewsItem({ title: '', content: '', imageUrl: '' });
                        setNewsModalOpen(true);
                      }}
                      className="bg-[#d4af37] text-[#0b1a30] hover:bg-[#c5a85c] px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>새 소식 등록</span>
                    </button>
                  </div>

                  {/* 뉴스 목록 테이블 */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    {news.length === 0 ? (
                      <div className="text-center py-20 text-xs text-slate-400 bg-slate-50">등록된 새소식 게시글이 없습니다.</div>
                    ) : (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead className="bg-[#0b1a30] text-slate-200 text-[10px] uppercase font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3.5 text-center">ID</th>
                            <th className="px-4 py-3.5">제목</th>
                            <th className="px-4 py-3.5 text-center">조회수</th>
                            <th className="px-4 py-3.5 text-center">작성일</th>
                            <th className="px-4 py-3.5 text-center">관리 액션</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {news.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-center text-slate-400 font-semibold">{item.id}</td>
                              <td className="px-4 py-3 font-bold text-slate-800 max-w-xs truncate">{item.title}</td>
                              <td className="px-4 py-3 text-center text-slate-500">{item.views || 0}</td>
                              <td className="px-4 py-3 text-center text-slate-400">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</td>
                              <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setCurrentNewsItem({
                                      id: item.id,
                                      title: item.title,
                                      content: item.content,
                                      imageUrl: item.imageUrl || ''
                                    });
                                    setNewsModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded cursor-pointer"
                                  title="수정"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(item.id)}
                                  className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

            </>
          )}

        </main>
      </div>

      {/* 새소식 CRUD 팝업 모달 */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <form onSubmit={handleSaveNews} className="space-y-4">
              {/* 모달 헤더 */}
              <div className="bg-[#0b1a30] text-white p-5 flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {currentNewsItem.id ? '홍보 새소식 수정' : '새 홍보 소식 등록'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setNewsModalOpen(false)}
                  className="text-slate-300 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded"
                >
                  닫기
                </button>
              </div>

              {/* 모달 본문 폼 */}
              <div className="p-6 space-y-4 text-xs sm:text-sm">
                
                {/* 제목 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">소식 제목</label>
                  <input
                    type="text"
                    value={currentNewsItem.title}
                    onChange={(e) => setCurrentNewsItem({ ...currentNewsItem, title: e.target.value })}
                    placeholder="소식 제목을 입력하세요."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                {/* 이미지 URL (Base64 등) */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">이미지 웹 주소 (선택)</label>
                  <input
                    type="text"
                    value={currentNewsItem.imageUrl}
                    onChange={(e) => setCurrentNewsItem({ ...currentNewsItem, imageUrl: e.target.value })}
                    placeholder="예: https://example.com/image.jpg 또는 Base64"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#d4af37]"
                  />
                  <span className="text-[10px] text-slate-400 block">* 이미지가 필요하지 않은 경우 공란으로 비워두시면 텍스트 위주로 렌더링됩니다.</span>
                </div>

                {/* 내용 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">소식 상세 내용</label>
                  <textarea
                    value={currentNewsItem.content}
                    onChange={(e) => setCurrentNewsItem({ ...currentNewsItem, content: e.target.value })}
                    placeholder="새소식 상세 본문을 작성해주세요. 엔터키로 줄바꿈이 지원됩니다."
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#d4af37] resize-none leading-relaxed"
                    required
                  />
                </div>

              </div>

              {/* 모달 푸터 */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#0b1a30] hover:bg-[#d4af37] text-white hover:text-[#0b1a30] px-5 py-2.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                  <span>{currentNewsItem.id ? '수정완료' : '등록저장'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
