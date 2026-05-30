'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Home, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Award,
  BookOpen,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  views: number;
  createdAt: string;
}

export default function LandingPage() {
  // 모바일 메뉴 상태
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 관심고객등록 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    address: '',
    interests: [] as string[],
    privacyConsent: false
  });

  // 로딩 및 성공 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 홍보센터 새소식 상태
  const [newsList, setNewsList] = useState<NewsPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);

  // 1. 페이지 접속 시 방문자 로그 누적 및 새소식 조회
  useEffect(() => {
    // 방문자 로그 API 호출
    const logVisit = async () => {
      try {
        await fetch('/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            referrer: document.referrer || '',
            path: window.location.pathname,
            searchParams: window.location.search
          })
        });
      } catch (err) {
        console.error('Failed to log visit:', err);
      }
    };
    logVisit();

    // 새소식 조회
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/admin/news?limit=6');
        const json = await res.json();
        if (json.success && json.data) {
          setNewsList(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // 2. 평형 선택 핸들러 (중복 선택 가능)
  const handleInterestChange = (size: string) => {
    if (formData.interests.includes(size)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== size)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, size]
      });
    }
  };

  // 3. 관심고객 등록 전송 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    // 유효성 체크
    if (!formData.name.trim()) {
      setSubmitError('이름을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.phone.trim() || !/^\d{2,3}-?\d{3,4}-?\d{4}$/.test(formData.phone)) {
      setSubmitError('올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)');
      setIsSubmitting(false);
      return;
    }
    if (!formData.birthDate.trim() || formData.birthDate.length !== 6 || isNaN(Number(formData.birthDate))) {
      setSubmitError('생년월일 6자리를 입력해주세요. (예: 950101)');
      setIsSubmitting(false);
      return;
    }
    if (!formData.address.trim()) {
      setSubmitError('거주지역을 동까지 상세히 입력해주세요. (예: 천안시 서북구 부성동)');
      setIsSubmitting(false);
      return;
    }
    if (formData.interests.length === 0) {
      setSubmitError('관심평형대를 최소 하나 이상 선택해주세요.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.privacyConsent) {
      setSubmitError('개인정보 수집 및 이용 동의에 체크해주셔야 등록이 가능합니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        setSubmitSuccess(true);
        // 폼 초기화
        setFormData({
          name: '',
          phone: '',
          birthDate: '',
          address: '',
          interests: [],
          privacyConsent: false
        });
      } else {
        setSubmitError(json.error || '등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('서버 통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 부드러운 스크롤 이동 헬퍼
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      
      {/* 1. 상단 내비게이션 바 (투명 헤더 & 절대 배치) */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          {/* 로고 영역 */}
          <div className="flex flex-col cursor-pointer justify-center" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/images/top_logo_wh.png" 
              alt="부성동 포스코더샵 로고" 
              style={{ height: '34px', width: 'auto' }}
              className="object-contain self-start"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = parent.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }
              }}
            />
            <span className="text-[14px] text-slate-200 tracking-wider mt-1.5 font-normal">천안 부성2구역 공동주택</span>
            
            {/* Fallback 텍스트 로고 */}
            <div className="logo-fallback hidden flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[#d4af37] font-bold text-xl sm:text-2xl tracking-wider font-serif">THE SHARP</span>
                <span className="text-xs bg-[#c5a85c] text-[#0b1a30] px-1.5 py-0.5 rounded font-bold">부성</span>
              </div>
              <span className="text-[14px] text-slate-300 tracking-wider mt-1 font-normal">천안 부성2구역 공동주택</span>
            </div>
          </div>

          {/* PC 메뉴 */}
          <nav className="hidden md:flex space-x-10 text-sm sm:text-base font-semibold tracking-wide">
            {['overview', 'complex', 'units', 'news', 'register'].map((menu) => {
              const menuNames: { [key: string]: string } = {
                overview: '사업개요',
                complex: '단지안내',
                units: '세대안내',
                news: '홍보센터',
                register: '관심고객등록'
              };
              return (
                <button
                  key={menu}
                  onClick={() => scrollToSection(menu)}
                  className="hover:text-[#d4af37] transition-all duration-200 cursor-pointer text-slate-100 font-medium hover:scale-105"
                >
                  {menuNames[menu]}
                </button>
              );
            })}
          </nav>

          {/* PC 우측 카카오톡 문의 & 관심고객등록 CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="https://open.kakao.com/o/gw5wPhxi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#fee500] text-[#191919] px-5 py-2.5 rounded-full hover:bg-[#e6cf00] transition-all duration-300 text-xs sm:text-sm font-bold shadow-md hover:scale-105"
            >
              <span>카카오톡 문의</span>
            </a>
            <button 
              onClick={() => scrollToSection('register')}
              className="flex items-center gap-2 border border-[#d4af37] bg-[#0b1a30]/80 text-[#d4af37] px-5 py-2.5 rounded-full hover:bg-[#d4af37] hover:text-[#0b1a30] transition-all duration-300 text-xs sm:text-sm font-bold shadow-md hover:scale-105"
            >
              <span>관심고객 등록</span>
            </button>
          </div>

          {/* 모바일 메뉴 토글 버튼 */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-200 hover:text-[#d4af37] p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 전체 화면 드롭다운 내비게이션 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#071120]/95 backdrop-blur-md border-t border-white/10 py-4 px-6 space-y-4">
            {['overview', 'complex', 'units', 'news', 'register'].map((menu) => {
              const menuNames: { [key: string]: string } = {
                overview: '사업개요',
                complex: '단지안내',
                units: '세대안내',
                news: '홍보센터',
                register: '관심고객등록'
              };
              return (
                <button
                  key={menu}
                  onClick={() => scrollToSection(menu)}
                  className="block w-full text-left text-slate-200 hover:text-[#d4af37] py-2 text-base font-semibold"
                >
                  {menuNames[menu]}
                </button>
              );
            })}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a 
                href="https://open.kakao.com/o/gw5wPhxi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-[#fee500] text-[#191919] py-3 rounded-lg font-bold text-xs shadow-md"
              >
                <span>카카오톡 문의</span>
              </a>
              <button 
                onClick={() => scrollToSection('register')}
                className="flex items-center justify-center gap-1 bg-[#d4af37] text-[#0b1a30] py-3 rounded-lg font-bold text-xs shadow-md"
              >
                <span>관심고객 등록</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. 히어로 (메인 비주얼) 섹션 (100vh 풀 화면) */}
      <section className="relative bg-[#071120] text-white overflow-hidden h-screen flex items-center justify-center">
        {/* 풀사이즈 비디오 백그라운드 */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/og-image.png"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source src="/main.mp4" type="video/mp4" />
        </video>
        {/* 가독성을 높이기 위한 20% 반투명 네이비 오버레이 마스크 */}
        <div className="absolute inset-0 bg-[#071120]/20 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center mt-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#c5a85c]/30 text-[#d4af37] border border-[#c5a85c]/40 backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>2026년 9월 분양예정단지 사전 안내</span>
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-md">
              천안 북부의 뉴 랜드마크<br />
              <span className="gold-gradient-text block mt-3">천안 부성2구역 포스코더샵</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-lg">
              1,290세대 초대형 프리미엄 명품 단지! 성성호수공원의 독보적인 남향 호수조망 특권과 지하철 1호선 부성역(신설예정)의 눈부신 미래가치를 선점하십시오.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => scrollToSection('register')}
                className="w-full sm:w-auto bg-[#d4af37] hover:bg-[#c5a85c] text-[#0b1a30] px-8 py-4 rounded-lg text-base font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 hover-gold-glow"
              >
                <span>관심고객 등록 신청하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection('overview')}
                className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-800/80 text-white border border-white/30 backdrop-blur-sm px-8 py-4 rounded-lg text-base font-bold transition-all duration-300 cursor-pointer"
              >
                단지 세부정보 조회
              </button>
            </div>
          </div>
        </div>

        {/* 하단 중앙 애니메이션 스크롤 다운 마우스 버튼 */}
        <div 
          onClick={() => scrollToSection('overview')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer text-slate-200 hover:text-[#d4af37] transition-colors duration-200"
        >
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-medium uppercase text-slate-300">SCROLL DOWN</span>
          <div className="w-[20px] h-[36px] border-2 border-slate-300 rounded-full flex justify-center p-[4px] hover:border-[#d4af37] transition-colors duration-200">
            <div className="w-[3px] h-[6px] bg-slate-300 rounded-full animate-scroll-bounce"></div>
          </div>
        </div>
      </section>

      {/* 우측 사이드바 고정 플로팅 CTAs (카카오톡, 관심고객등록, TOP 버튼) */}
      <div className="floating-cta-container">
        {/* 1. 카카오톡 문의 (옐로우) */}
        <a 
          href="https://open.kakao.com/o/gw5wPhxi" 
          target="_blank" 
          rel="noopener noreferrer"
          className="floating-cta-btn bg-[#fee500] hover:bg-[#e6cf00] group"
          title="카카오톡 오픈채팅 문의"
        >
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="카톡" className="w-6 h-6 object-contain" />
        </a>

        {/* 2. 관심고객등록 (딥네이비 / 골드 테두리) */}
        <button 
          onClick={() => scrollToSection('register')}
          className="floating-cta-btn bg-[#0b1a30] hover:bg-[#d4af37] border border-[#d4af37] text-white hover:text-[#0b1a30] group flex flex-col items-center justify-center p-1"
          title="관심고객 등록하기"
        >
          <CheckCircle2 className="w-5 h-5 text-[#d4af37] group-hover:text-[#0b1a30]" />
          <span className="text-[7px] font-bold mt-0.5 tracking-tighter">관심등록</span>
        </button>

        {/* 3. TOP 위로가기 버튼 */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="floating-cta-btn bg-slate-800/90 hover:bg-slate-700 text-white"
          title="맨 위로 스크롤"
        >
          <ChevronRight className="w-5 h-5 rotate-270" />
        </button>
      </div>

      {/* 3. 사업개요 섹션 */}
      <section id="overview" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1a30] tracking-tight">사업개요</h2>
            <div className="w-12 h-1 bg-[#d4af37] mx-auto"></div>
            <p className="text-slate-500 text-sm sm:text-base">부성동 포스코더샵(천안 부성2구역 공동주택)의 공식 분양 세부 정보를 안내해 드립니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 개요 텍스트 테이블 */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#0b1a30] flex items-center gap-2 border-b border-[#c5a85c]/20 pb-3">
                <Building2 className="w-5 h-5 text-[#d4af37]" />
                <span>사업 요약 사양</span>
              </h3>
              <div className="divide-y divide-slate-100 text-sm sm:text-base">
                {[
                  { label: '사업명', value: '천안 부성2지구 공동주택 신축공사' },
                  { label: '단지명(예정)', value: '부성동 포스코더샵 (가칭)' },
                  { label: '위치', value: '충청남도 천안시 서북구 부성동 일원 (부성2구역)' },
                  { label: '단지규모', value: '지하 2층 ~ 지상 최고 29층, 대단지 아파트 및 부대복리시설' },
                  { label: '총 세대수', value: '총 1,290세대 (일반분양 약 1,096세대 예정)' },
                  { label: '평형타입', value: '전용면적 84㎡A, 102㎡A, 118㎡A 등 선호도 높은 중대형 구성' },
                  { label: '시공사', value: '포스코이앤씨 (THE SHARP)' },
                  { label: '분양시기', value: '2026년 9월 분양 예정' },
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 py-3.5">
                    <span className="font-semibold text-slate-600 col-span-1">{item.label}</span>
                    <span className="text-slate-900 col-span-2 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 개요 이미지 비주얼 영역 */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37] to-[#0b1a30] rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-[#0b1a30] rounded-2xl aspect-[4/3] flex flex-col justify-between p-8 text-white overflow-hidden shadow-lg border border-[#c5a85c]/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Building2 className="w-48 h-48" />
                </div>
                <div>
                  <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest">Brand Value</span>
                  <h4 className="text-xl sm:text-2xl font-bold mt-2 font-serif">THE SHARP PREMIUM</h4>
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed font-light">
                    포스코이앤씨의 주거 명작 브랜드 '더샵'은 차별화된 조경, 스마트 주거 케어 시스템, 고품격 커뮤니티 공간 설계를 통해 천안 부성지구에서 가치의 차이를 만듭니다.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/60 text-center">
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-[#d4af37] font-serif">1,290</div>
                    <div className="text-[10px] sm:text-xs text-slate-400">총세대수</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-[#d4af37] font-serif">2026.09</div>
                    <div className="text-[10px] sm:text-xs text-slate-400">분양예정</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-[#d4af37] font-serif">4-Bay</div>
                    <div className="text-[10px] sm:text-xs text-slate-400">혁신설계</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 단지안내 섹션 */}
      <section id="complex" className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1a30] tracking-tight">단지특장점</h2>
            <div className="w-12 h-1 bg-[#d4af37] mx-auto"></div>
            <p className="text-slate-500 text-sm sm:text-base">부성지구를 대표하는 최상의 프리미엄 4대 특권을 경험해 보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: '성성호수공원 특급 조망',
                desc: '성성호수공원을 남향으로 정면 조망(일부 세대 제외)할 수 있는 탁 트인 호수 생활권을 선사합니다.'
              },
              {
                icon: Award,
                title: '부성역 초역세권 미래가치',
                desc: '지하철 1호선 부성역(신설 예정) 도보 인접 수혜지로, 천안 북부의 광역 교통망을 가장 가깝게 누립니다.'
              },
              {
                icon: Layers,
                title: '1,290세대 메머드 대단지',
                desc: '대규모 랜드마크 아파트로서 커뮤니티, 조경 면적 및 아파트 자산 가치 형성에 독보적인 우위를 확보합니다.'
              },
              {
                icon: Home,
                title: '전세대 남향위주 4-Bay',
                desc: '채광과 통풍이 뛰어난 남향 위주 단지 배치 및 고선호 4-Bay 판상형 특화 구조 설계를 선보입니다.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-premium border border-slate-200/50 hover:border-[#d4af37] transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-[#0b1a30]/5 flex items-center justify-center mb-5 group-hover:bg-[#0b1a30] transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-[#d4af37]" />
                </div>
                <h4 className="text-lg font-bold text-[#0b1a30] mb-2">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* 단지배치도 플레이스홀더 */}
          <div className="mt-16 bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
            <div className="bg-[#0b1a30] text-[#d4af37] px-6 py-4 font-bold flex items-center justify-between">
              <span>단지 배치 구성도 (임시 안내 이미지)</span>
              <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-normal">추후 공식 배치도 업데이트 예정</span>
            </div>
            <div className="aspect-[21/9] bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/images/complex_placeholder.jpg')" }}></div>
              <div className="relative z-10 space-y-4 max-w-md">
                <Building2 className="w-12 h-12 text-[#d4af37] mx-auto opacity-80" />
                <h5 className="text-xl font-bold">쾌적한 지상에 차가 없는 자연 친화형 조경 설계</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  넓은 동간 거리 확보를 통해 사생활 간섭을 최소화하고, 수변정원, 숲속 놀이터, 시그니처 티하우스 등 다채로운 테마 조경 공간이 구현됩니다.
                </p>
                <div className="text-[11px] text-[#d4af37] border border-[#d4af37]/30 px-3 py-1.5 rounded inline-block bg-[#0b1a30]/60">
                  * 118㎡ 타입의 경우 전 세대에서 우수한 성성호수 조망이 확보될 수 있도록 동배치 특화설계가 추진 중입니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 세대안내 섹션 */}
      <section id="units" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1a30] tracking-tight">평형세대안내</h2>
            <div className="w-12 h-1 bg-[#d4af37] mx-auto"></div>
            <p className="text-slate-500 text-sm sm:text-base">부성동 포스코더샵이 선보이는 주력 3대 프리미엄 주택형 평형 구성을 소개합니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                size: '84㎡A',
                type: '중형 대표 실속 평형',
                features: ['4-Bay 판상형 구조', '맞통풍 혁신 평면', '대형 안방 드레스룸', '주방 팬트리 수납 극대화'],
                bg: 'from-[#0b1a30] to-[#122c52]',
                badgeColor: 'bg-emerald-500/20 text-emerald-600'
              },
              {
                size: '102㎡A',
                type: '여유롭고 품격있는 중대형 평형',
                features: ['쾌적한 광폭 거실 설계', '알파룸 제공(공간 활용도 우수)', '대형 현관 창고 보유', '고급형 드레스룸 강화'],
                bg: 'from-[#122c52] to-[#1a3f75]',
                badgeColor: 'bg-[#d4af37]/20 text-[#d4af37]'
              },
              {
                size: '118㎡A',
                type: '성성호수공원 명품 뷰 특화 평형',
                features: ['전 세대 완벽 호수 영구조망 보장', '초광폭 거실 및 고급 패밀리 다이닝', '최대 4룸 독립 침실 구조', '하이엔드 프리미엄 주방 레이아웃'],
                bg: 'from-[#071120] to-[#0b1a30]',
                badgeColor: 'bg-indigo-500/20 text-indigo-400'
              }
            ].map((unit, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-premium flex flex-col justify-between hover:border-[#c5a85c]/80 transition-all duration-300">
                {/* 카드 헤더 */}
                <div className={`p-6 bg-gradient-to-r ${unit.bg} text-white relative`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Premium Unit</span>
                      <h4 className="text-3xl font-extrabold mt-1 font-serif">{unit.size}</h4>
                    </div>
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-[#d4af37] font-bold border border-white/10">A-Type</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-3 leading-relaxed font-light">{unit.type}</p>
                </div>

                {/* 카드 본문 평면도 플레이스홀더 */}
                <div className="p-6 space-y-6">
                  <div className="aspect-[4/3] bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs relative overflow-hidden">
                    <Home className="w-10 h-10 text-slate-300 mb-2" />
                    <span>추후 공식 확정 평면도(ISO) 업데이트</span>
                    <span className="text-[10px] text-slate-400 mt-1">남향 4-Bay 판상형 구조 설계 반영</span>
                  </div>

                  {/* 특장점 목록 */}
                  <div className="space-y-3.5">
                    <span className="text-xs text-slate-400 font-bold tracking-wide uppercase block">Key Features</span>
                    <ul className="space-y-2">
                      {unit.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 카드 푸터 */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        interests: prev.interests.includes(unit.size) ? prev.interests : [...prev.interests, unit.size]
                      }));
                      scrollToSection('register');
                    }}
                    className="w-full bg-[#0b1a30] hover:bg-[#d4af37] text-white hover:text-[#0b1a30] transition-all duration-300 py-2.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    이 평형으로 관심고객 등록하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 홍보센터 새소식 섹션 */}
      <section id="news" className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1a30] tracking-tight">홍보센터 새소식</h2>
            <div className="w-12 h-1 bg-[#d4af37] mx-auto"></div>
            <p className="text-slate-500 text-sm sm:text-base">천안 부성2구역 포스코더샵 단지의 새로운 소식과 분양 정보를 전해드립니다.</p>
          </div>

          {newsLoading ? (
            <div className="flex justify-center items-center py-20 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b1a30] mr-2"></div>
              <span>소식을 불러오는 중입니다...</span>
            </div>
          ) : newsList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-premium max-w-xl mx-auto space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-lg font-bold text-slate-700">현재 등록된 새소식이 없습니다.</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                분양 일정 공고, 청약 관련 유의사항 등 다채로운 단지 최신 뉴스가 조만간 등록될 예정입니다. 관심고객등록을 해 주시면 실시간으로 분양정보를 받아보실 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsList.map((post) => (
                <article 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-[#d4af37] transition-all duration-300 group cursor-pointer"
                >
                  <div className="p-6 space-y-4">
                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>조회 {post.views || 0}</span>
                      </span>
                    </div>

                    {/* 제목 */}
                    <h4 className="text-lg font-bold text-[#0b1a30] group-hover:text-[#d4af37] line-clamp-1 transition-colors duration-200">
                      {post.title}
                    </h4>

                    {/* 본문 초록 */}
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-light">
                      {post.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>

                  {/* 카드 푸터 */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0b1a30] group-hover:bg-[#0b1a30] group-hover:text-white transition-all duration-300">
                    <span>자세히 보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. 관심고객등록 폼 섹션 */}
      <section id="register" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="text-xs bg-[#d4af37]/20 text-[#0b1a30] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-[#d4af37]/30">
              VIP Customer Service
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1a30] tracking-tight mt-2">관심고객등록 신청</h2>
            <div className="w-12 h-1 bg-[#d4af37] mx-auto"></div>
            <p className="text-slate-500 text-sm sm:text-base">
              관심고객으로 등록해주시면 청약 일정, 특별공급 기준, 당첨 비결 등 유용한 분양 정보를 가장 신속하고 정확하게 전달해 드립니다.
            </p>
          </div>

          <div className="bg-[#0b1a30] text-white rounded-2xl shadow-xl overflow-hidden border border-[#c5a85c]/30">
            {/* 상단 장식바 */}
            <div className="bg-[#d4af37] h-2"></div>
            
            <div className="p-8 sm:p-10">
              
              {submitSuccess ? (
                <div className="text-center py-10 space-y-6">
                  <CheckCircle2 className="w-16 h-16 text-[#d4af37] mx-auto animate-bounce" />
                  <h3 className="text-2xl font-bold tracking-tight">관심고객 등록이 정상적으로 완료되었습니다!</h3>
                  <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-light">
                    귀중한 관심과 성원에 감사드립니다. 등록해주신 정보에 부합하는 최고의 맞춤 청약 가이드 및 일정 상세 문자를 빠른 시일 내에 이메일(<span className="text-[#d4af37] font-semibold">anschale@naver.com</span>)과 SMS로 안내해 드리겠습니다.
                  </p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-[#d4af37] hover:bg-[#c5a85c] text-[#0b1a30] px-6 py-3 rounded-lg text-sm font-bold shadow-md cursor-pointer"
                  >
                    추가 고객 등록하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-sm">
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg text-xs sm:text-sm font-semibold">
                      ⚠ {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* 이름 */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-xs text-slate-300 font-bold uppercase tracking-wider">이름 (실명)</label>
                      <input 
                        type="text" 
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="홍길동"
                        className="w-full bg-[#071120] border border-slate-700 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors duration-200"
                        required
                      />
                    </div>

                    {/* 연락처 */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-xs text-slate-300 font-bold uppercase tracking-wider">연락처</label>
                      <input 
                        type="tel" 
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="010-1234-5678"
                        className="w-full bg-[#071120] border border-slate-700 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* 생년월일 */}
                    <div className="space-y-2">
                      <label htmlFor="birth" className="block text-xs text-slate-300 font-bold uppercase tracking-wider">생년월일 (6자리)</label>
                      <input 
                        type="text" 
                        id="birth"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        placeholder="예: 950101"
                        maxLength={6}
                        className="w-full bg-[#071120] border border-slate-700 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors duration-200"
                        required
                      />
                    </div>

                    {/* 거주지역 */}
                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-xs text-slate-300 font-bold uppercase tracking-wider">거주지역 (동단위 입력)</label>
                      <input 
                        type="text" 
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="예: 천안시 서북구 부성동"
                        className="w-full bg-[#071120] border border-slate-700 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* 관심평형대 (중복선택 가능) */}
                  <div className="space-y-3">
                    <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider">관심 평형대 (중복선택 가능)</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['84㎡A', '102㎡A', '118㎡A'].map((size) => {
                        const isSelected = formData.interests.includes(size);
                        return (
                          <button
                            type="button"
                            key={size}
                            onClick={() => handleInterestChange(size)}
                            className={`py-3 rounded-lg border font-bold text-center transition-all duration-200 cursor-pointer ${
                              isSelected 
                                ? 'bg-[#d4af37] border-[#d4af37] text-[#0b1a30] shadow-md' 
                                : 'bg-[#071120] border-slate-700 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 개인정보 처리동의 안내 */}
                  <div className="space-y-2 border-t border-slate-700/60 pt-5">
                    <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider">개인정보 수집 및 이용 동의 안내</label>
                    <div className="bg-[#071120] rounded-lg p-4 h-32 overflow-y-auto text-[11px] text-slate-400 leading-relaxed border border-slate-800">
                      <p className="font-bold text-slate-300 mb-1">1. 수집하는 개인정보 항목</p>
                      <p className="mb-2">- 이름, 연락처, 생년월일, 거주지역(동), 관심평형대</p>
                      
                      <p className="font-bold text-slate-300 mb-1">2. 수집 및 이용목적</p>
                      <p className="mb-2">- 천안 부성2구역 공동주택(부성동 포스코더샵) 분양 및 청약 일정 안내, 특별공급 기준 안내, 유용한 분양 마케팅 홍보 정보 문자메시지(SMS)/전화/이메일 발송 등</p>
                      
                      <p className="font-bold text-slate-300 mb-1">3. 개인정보의 보유 및 이용기간</p>
                      <p className="mb-2">- 본 아파트 분양 완료 및 관심고객 목적 달성 후 즉시 파기(단, 동의 철회 시 즉시 파기)</p>
                      
                      <p className="font-bold text-slate-300 mb-1">4. 동의 거부권 안내</p>
                      <p>- 귀하는 개인정보 수집 및 동의를 거부할 권리가 있습니다. 단, 거부하실 경우 청약 정보 제공 및 안내 서비스 혜택을 받아보실 수 없습니다.</p>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="agree"
                        checked={formData.privacyConsent}
                        onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                        className="w-4 h-4 accent-[#d4af37] outline-none cursor-pointer"
                        required
                      />
                      <label htmlFor="agree" className="text-xs text-slate-300 font-medium cursor-pointer">
                        위 개인정보 수집 및 마케팅 이용 목적에 동의합니다. (필수)
                      </label>
                    </div>
                  </div>

                  {/* 등록 버튼 */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-[#d4af37] hover:bg-[#c5a85c] text-[#0b1a30] py-4 rounded-lg text-base font-bold shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover-gold-glow ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0b1a30]"></div>
                          <span>고객 정보 등록 처리 중...</span>
                        </>
                      ) : (
                        <>
                          <span>관심고객으로 즉시 등록신청</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. 새소식 팝업 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            {/* 모달 헤더 */}
            <div className="bg-[#0b1a30] text-white p-6 relative">
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-5 right-5 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2 py-0.5 rounded font-bold">
                부성 포스코더샵 뉴스
              </span>
              <h3 className="text-xl font-bold mt-2 pr-8">{selectedPost.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 font-light">
                <span>등록일: {new Date(selectedPost.createdAt).toLocaleDateString('ko-KR')}</span>
                <span>조회수: {selectedPost.views || 0}</span>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-sm sm:text-base leading-relaxed text-slate-600">
              {selectedPost.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src={selectedPost.imageUrl} 
                    alt={selectedPost.title} 
                    className="w-full max-h-[300px] object-contain bg-slate-50"
                  />
                </div>
              )}
              <div 
                className="whitespace-pre-wrap font-light text-slate-700"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            </div>

            {/* 모달 푸터 */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedPost(null)}
                className="bg-[#0b1a30] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#d4af37] hover:text-[#0b1a30] transition-colors duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. 푸터 영역 */}
      <footer className="bg-[#071120] text-slate-400 text-xs sm:text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-800">
            {/* 푸터 로고 */}
            <div className="flex flex-col cursor-pointer justify-center" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img 
                src="/images/top_logo_wh.png" 
                alt="부성동 포스코더샵 로고" 
                style={{ height: '34px', width: 'auto' }}
                className="object-contain self-start"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.footer-logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }
                }}
              />
              <span className="text-[14px] text-slate-500 tracking-wider mt-1.5 font-normal">천안 부성2구역 공동주택 분양홍보관</span>
              
              {/* Fallback 텍스트 로고 */}
              <div className="footer-logo-fallback hidden flex flex-col">
                <div className="flex items-center gap-1.5 text-white font-serif">
                  <span className="font-bold text-lg tracking-wider text-[#d4af37]">THE SHARP</span>
                  <span className="text-[10px] bg-[#c5a85c] text-[#0b1a30] px-1 rounded font-bold">부성</span>
                </div>
                <span className="text-[14px] text-slate-500 tracking-wider mt-1 font-normal">천안 부성2구역 공동주택 분양홍보관</span>
              </div>
            </div>

            {/* 유용한 링크 */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-slate-300">
              <button onClick={() => scrollToSection('overview')} className="hover:text-white transition-colors cursor-pointer">사업개요</button>
              <button onClick={() => scrollToSection('complex')} className="hover:text-white transition-colors cursor-pointer">단지특장점</button>
              <button onClick={() => scrollToSection('units')} className="hover:text-white transition-colors cursor-pointer">평형안내</button>
              <button onClick={() => scrollToSection('news')} className="hover:text-white transition-colors cursor-pointer">새소식</button>
              <button onClick={() => scrollToSection('register')} className="hover:text-white transition-colors cursor-pointer">관심고객등록</button>
            </div>
          </div>

          <div className="space-y-4 font-light text-slate-500 leading-relaxed text-[11px] sm:text-xs">
            <p>
              <span className="font-bold text-slate-400">※ 면책공고 및 분양주의사항:</span> 본 홍보 웹사이트는 천안 부성2구역 공동주택(부성동 포스코더샵)의 정식 분양 개시 전, 관심고객들에게 사전 청약 정보를 제공하기 위해 운영되는 임시 관심고객 모집 랜드 페이지입니다.
            </p>
            <p>
              사이트상에 게시된 사업개요, 이미지, 조감도, 평면도 및 제반 세부 수치 등은 인허가 진행 과정 및 포스코이앤씨 시공 계약 설계 조건 등에 따라 실제 분양 시 다소 변경되거나 정정될 수 있습니다. 최종 분양 가액 및 상세 단지 구성 사양은 청약홈(Apply Home) 또는 정식 더샵 공식 홈페이지에 게재될 입주자 모집 공고문을 최우선 근거로 반드시 대조 및 확인하시기 바랍니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-slate-900 text-slate-600 text-[10px]">
              <span>부성동 포스코더샵 홍보사이트 © {new Date().getFullYear()} All Rights Reserved.</span>
              <a href="/admin/login" className="hover:text-slate-400 underline font-medium">관리자 전용 로그인</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
