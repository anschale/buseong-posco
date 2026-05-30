'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Building2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // 로그인 성공 시 대시보드로 이동
        router.push('/admin');
        router.refresh();
      } else {
        setError(json.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* 백그라운드 디자인 그라데이션 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent opacity-60 pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/60 p-8 sm:p-10 space-y-8 relative z-10">
        
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center mx-auto border border-[#d4af37]/30">
            <Building2 className="w-6 h-6 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">부성동 포스코더샵</h2>
          <p className="text-xs text-slate-400">통합 관리자 시스템 로그인</p>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs font-semibold">
              ⚠ {error}
            </div>
          )}

          {/* 아이디 */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300 font-bold tracking-wider uppercase">관리자 ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디 입력"
                className="w-full bg-slate-950 border border-slate-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 outline-none text-sm transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* 패스워드 */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300 font-bold tracking-wider uppercase">비밀번호</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full bg-slate-950 border border-slate-700 focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 outline-none text-sm transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#d4af37] hover:bg-[#c5a85c] text-[#0b1a30] py-3.5 rounded-lg text-sm font-bold shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0b1a30]"></div>
                  <span>보안 세션 생성 중...</span>
                </>
              ) : (
                <span>관리자 로그인</span>
              )}
            </button>
          </div>
        </form>

        {/* 푸터 */}
        <div className="text-center text-[10px] text-slate-500 border-t border-slate-700/40 pt-5">
          본 페이지는 인가된 관리자만 접근할 수 있습니다.<br />
          부성동 포스코더샵 홍보센터 © {new Date().getFullYear()}
        </div>

      </div>
    </div>
  );
}
