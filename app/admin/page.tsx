'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ArrowLeft, MapPin, Image as ImageIcon, ClipboardList, Clock,
  CheckCircle2, Building2, Star, Navigation, ShieldCheck, TrendingUp,
  Search, Trash2, ShieldOff, ChevronLeft, ChevronRight, Users, Map, List,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

declare global { interface Window { naver: any } }

interface CustomerRequest {
  id: string; title: string; description: string
  address: string | null; imageUrl: string | null
  latitude: number | null; longitude: number | null
  status: string; createdAt: string; contractorId: string | null
}

interface Contractor {
  id: string; name: string; phone: string; serviceArea: string
  address: string | null
  latitude: number; longitude: number; rating: number
  trustScore: number; verified: boolean; description: string | null
  completedJobs: number; reviewCount: number
}

interface MatchedContractor extends Contractor {
  distance: number; score: number
}

interface ContractorsResponse {
  data: Contractor[]; total: number; page: number; totalPages: number
}

const STATUS_COLORS = { PENDING: '#f59e0b', MATCHED: '#3b82f6', COMPLETED: '#10b981' }

const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

const SUB_REGIONS: Record<string, string[]> = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '하남시', '오산시', '이천시', '안성시', '의왕시', '여주시', '동두천시', '과천시', '구리시', '포천시', '양주시', '가평군', '연천군', '양평군'],
  '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '인천': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
  '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '광주': ['광산구', '남구', '동구', '북구', '서구'],
  '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
  '울산': ['남구', '동구', '북구', '중구', '울주군'],
  '경남': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '함안군', '창녕군', '고성군', '하동군', '합천군'],
  '경북': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '칠곡군', '성주군'],
  '충남': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '홍성군', '예산군'],
  '충북': ['청주시', '충주시', '제천시', '음성군', '진천군', '증평군', '괴산군', '보은군'],
  '전북': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '고창군', '부안군'],
  '전남': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '화순군', '장성군', '영암군'],
  '강원': ['춘천시', '원주시', '강릉시', '동해시', '속초시', '삼척시', '태백시', '홍천군', '횡성군', '평창군'],
}

const CATEGORIES = [
  { label: '전체', keyword: '' },
  { label: '보일러', keyword: '보일러' },
  { label: '배관/누수', keyword: '배관' },
  { label: '전기', keyword: '전기' },
  { label: '에어컨', keyword: '에어컨' },
  { label: '도배/장판', keyword: '도배' },
  { label: '인테리어', keyword: '인테리어' },
  { label: '타일', keyword: '타일' },
  { label: '방수', keyword: '방수' },
  { label: '소방', keyword: '소방' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<'requests' | 'contractors'>('requests')

  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [matchedContractors, setMatchedContractors] = useState<MatchedContractor[]>([])
  const [loadingMatch, setLoadingMatch] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)

  const [contractors, setContractors] = useState<Contractor[]>([])
  const [contractorTotal, setContractorTotal] = useState(0)
  const [contractorPage, setContractorPage] = useState(1)
  const [contractorTotalPages, setContractorTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'true' | 'false'>('all')
  const [loadingContractors, setLoadingContractors] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [selectedTopRegion, setSelectedTopRegion] = useState('')
  const [selectedSubRegion, setSelectedSubRegion] = useState('')
  const [subSubRegions, setSubSubRegions] = useState<string[]>([])
  const [loadingSubSub, setLoadingSubSub] = useState(false)
  const [spamFilter, setSpamFilter] = useState<'hide' | 'all' | 'only'>('hide')
  const [stats, setStats] = useState({ total: 0, verified: 0, avgTrustScore: 0 })
  const contractorMapRef = useRef<HTMLDivElement>(null)
  const contractorMapInstanceRef = useRef<any>(null)
  const contractorMarkersRef = useRef<any[]>([])
  const [mapContractors, setMapContractors] = useState<Contractor[]>([])
  const [loadingMap, setLoadingMap] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchRequests() }, [])

  useEffect(() => {
    fetch('/api/contractors/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'contractors' && viewMode === 'list') fetchContractors()
  }, [tab, contractorPage, search, verifiedFilter, categoryFilter, regionFilter, viewMode, spamFilter])

  useEffect(() => {
    if (tab === 'contractors' && viewMode === 'map') fetchMapContractors()
  }, [tab, viewMode, search, verifiedFilter, categoryFilter, regionFilter, spamFilter])

  useEffect(() => {
    if (!selectedRequest?.latitude || !selectedRequest?.longitude) return
    fetchMatchedContractors(selectedRequest.latitude, selectedRequest.longitude)
    initMap(selectedRequest.latitude, selectedRequest.longitude)
  }, [selectedRequest])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests')
      if (!res.ok) throw new Error('요청 목록 조회 실패')
      setRequests(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const SPAM_KEYWORDS = ['전자제품판매', '건설자재', '철물점', '전기자재', '중고가전', '조명기기판매', '직업전문교육', '인테리어장식판매', '공사,공단', '청소대행', '냉난방기제조']
  const isSpam = (desc: string | null) => !!desc && SPAM_KEYWORDS.some(kw => desc.includes(kw))

  const fetchContractors = useCallback(async () => {
    setLoadingContractors(true)
    try {
      const params = new URLSearchParams({ page: String(contractorPage), limit: '20' })
      if (search) params.set('search', search)
      if (verifiedFilter !== 'all') params.set('verified', verifiedFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (regionFilter) params.set('region', regionFilter)
      if (spamFilter === 'hide') params.set('minTrustScore', '50')
      if (spamFilter === 'only') params.set('maxTrustScore', '35')
      const res = await fetch(`/api/contractors?${params}`)
      if (!res.ok) throw new Error('업체 조회 실패')
      const json: ContractorsResponse = await res.json()
      setContractors(json.data)
      setContractorTotal(json.total)
      setContractorTotalPages(json.totalPages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingContractors(false)
    }
  }, [contractorPage, search, verifiedFilter, categoryFilter, regionFilter, spamFilter])

  const fetchMapContractors = useCallback(async () => {
    setLoadingMap(true)
    try {
      const params = new URLSearchParams({ page: '1', limit: '300' })
      if (search) params.set('search', search)
      if (verifiedFilter !== 'all') params.set('verified', verifiedFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (regionFilter) params.set('region', regionFilter)
      if (spamFilter === 'hide') params.set('minTrustScore', '50')
      if (spamFilter === 'only') params.set('maxTrustScore', '35')
      const res = await fetch(`/api/contractors?${params}`)
      if (!res.ok) throw new Error()
      const json: ContractorsResponse = await res.json()
      setMapContractors(json.data.filter((c) => c.latitude && c.longitude))
    } catch {
      setMapContractors([])
    } finally {
      setLoadingMap(false)
    }
  }, [search, verifiedFilter, categoryFilter, regionFilter, spamFilter])

  // 업체 지도 마커 렌더링
  useEffect(() => {
    if (viewMode !== 'map' || !contractorMapRef.current) return

    const render = () => {
      if (!contractorMapRef.current || !window.naver) return
      contractorMarkersRef.current.forEach((m) => m.setMap(null))
      contractorMarkersRef.current = []

      if (!contractorMapInstanceRef.current) {
        contractorMapInstanceRef.current = new window.naver.maps.Map(contractorMapRef.current, {
          center: new window.naver.maps.LatLng(36.5, 127.5),
          zoom: 7,
        })
      }
      const mapInst = contractorMapInstanceRef.current

      mapContractors.forEach((c) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(c.latitude, c.longitude),
          map: mapInst,
          icon: {
            content: `<div style="background:${c.verified ? '#2563eb' : '#9ca3af'};color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3);cursor:pointer">${c.name.slice(0, 10)}</div>`,
            anchor: new window.naver.maps.Point(0, 14),
          },
        })
        const iw = new window.naver.maps.InfoWindow({
          content: `<div style="padding:10px;min-width:180px;font-size:13px"><strong>${c.name}</strong><br/><span style="color:#555">${c.phone}</span><br/><span style="color:#555">${c.serviceArea}</span><br/><span>신뢰점수 ${c.trustScore.toFixed(0)}점${c.verified ? ' ✓인증' : ''}</span></div>`,
        })
        window.naver.maps.Event.addListener(marker, 'click', () => iw.open(mapInst, marker))
        contractorMarkersRef.current.push(marker)
      })
    }

    if (window.naver) {
      render()
    } else {
      const t = setInterval(() => { if (window.naver) { clearInterval(t); render() } }, 200)
      return () => clearInterval(t)
    }
  }, [mapContractors, viewMode])

  const fetchMatchedContractors = async (lat: number, lng: number) => {
    setLoadingMatch(true)
    try {
      const res = await fetch(`/api/contractors/match?lat=${lat}&lng=${lng}&radius=10&limit=20`)
      if (!res.ok) throw new Error()
      setMatchedContractors(await res.json())
    } catch {
      setMatchedContractors([])
    } finally {
      setLoadingMatch(false)
    }
  }

  const initMap = (lat: number, lng: number) => {
    if (!window.naver || !mapRef.current) return
    const center = new window.naver.maps.LatLng(lat, lng)
    if (!map) {
      const m = new window.naver.maps.Map(mapRef.current, { center, zoom: 15 })
      new window.naver.maps.Marker({ position: center, map: m, title: '고객 위치' })
      setMap(m)
    } else {
      map.setCenter(center)
    }
  }

  const updateRequestStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('상태 업데이트 실패')
      fetchRequests()
    } catch (err: any) { alert(err.message) }
  }

  const assignContractor = async (requestId: string, contractorId: string, contractorName: string) => {
    if (!confirm(`"${contractorName}" 업체를 배정하시겠습니까?`)) return
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId }),
      })
      if (!res.ok) throw new Error('배정 실패')
      await fetchRequests()
      // 선택된 요청 업데이트
      setSelectedRequest(prev => prev?.id === requestId ? { ...prev, contractorId, status: 'MATCHED' } : prev)
      alert(`${contractorName} 업체가 배정되었습니다.`)
    } catch (err: any) { alert(err.message) }
  }

  const toggleVerified = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/contractors/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !current }),
      })
      if (!res.ok) throw new Error()
      fetchContractors()
    } catch { alert('수정 실패') }
  }

  const deleteContractor = async (id: string, name: string) => {
    if (!confirm(`"${name}" 업체를 삭제하시겠습니까?`)) return
    try {
      const res = await fetch(`/api/contractors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      fetchContractors()
    } catch { alert('삭제 실패') }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setContractorPage(1)
    setSearch(searchInput)
  }

  const getStatusBadge = (status: string) => {
    const m: Record<string, { bg: string; text: string; label: string }> = {
      PENDING:   { bg: 'bg-amber-100 border-amber-200',  text: 'text-amber-800',  label: '대기중' },
      MATCHED:   { bg: 'bg-blue-100 border-blue-200',    text: 'text-blue-800',   label: '매칭완료' },
      COMPLETED: { bg: 'bg-green-100 border-green-200',  text: 'text-green-800',  label: '완료' },
    }
    const b = m[status] || m.PENDING
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    )
  }

  const chartData = [
    { name: '대기중',   value: requests.filter(r => r.status === 'PENDING').length,   color: STATUS_COLORS.PENDING },
    { name: '매칭완료', value: requests.filter(r => r.status === 'MATCHED').length,   color: STATUS_COLORS.MATCHED },
    { name: '완료',     value: requests.filter(r => r.status === 'COMPLETED').length, color: STATUS_COLORS.COMPLETED },
  ].filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />뒤로</Button></Link>
              <h1 className="text-lg font-bold">관리자</h1>
            </div>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex gap-1">
            {[
              { key: 'requests',    label: '고객 요청', icon: ClipboardList },
              { key: 'contractors', label: '업체 관리', icon: Building2 },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                  tab === key ? 'bg-white border border-b-white text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-lg mb-6">{error}</div>}

        {/* ── 고객 요청 탭 ── */}
        {tab === 'requests' && (
          <>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
              {[
                { label: '전체 요청', value: requests.length, color: 'from-primary to-blue-700', icon: ClipboardList },
                { label: '대기중', value: requests.filter(r => r.status === 'PENDING').length, color: 'from-amber-500 to-orange-600', icon: Clock },
                { label: '매칭완료', value: requests.filter(r => r.status === 'MATCHED').length, color: 'from-blue-500 to-blue-700', icon: CheckCircle2 },
                { label: '완료', value: requests.filter(r => r.status === 'COMPLETED').length, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
              ].map(({ label, value, color, icon: Icon }) => (
                <Card key={label} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-base font-medium">{label}</CardDescription>
                      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-4xl font-bold text-primary">{value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {chartData.length > 0 && (
              <Card className="mb-8 border-2">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50/50 border-b">
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />요청 상태 분석</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80}
                          label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} dataKey="value">
                          {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8 border-2">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50/50 border-b">
                <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" />고객 요청 목록</CardTitle>
                <CardDescription>클릭하면 10km 내 업체를 자동 추천합니다</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>수리 종류</TableHead><TableHead>주소</TableHead>
                        <TableHead>상태</TableHead><TableHead>요청일</TableHead><TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-16 text-gray-500">요청이 없습니다.</TableCell></TableRow>
                      ) : requests.map((req) => (
                        <TableRow key={req.id}
                          className={`cursor-pointer hover:bg-primary/5 transition-colors ${selectedRequest?.id === req.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                          onClick={() => setSelectedRequest(req)}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2 flex-wrap">
                              {req.title}
                              {req.imageUrl && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">사진</span>}
                              {req.latitude && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">위치</span>}
                              {req.contractorId && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-semibold">업체배정</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{req.address || '미지정'}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell className="text-gray-600">{new Date(req.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {req.status === 'PENDING' && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                                  onClick={(e) => { e.stopPropagation(); updateRequestStatus(req.id, 'MATCHED') }}>매칭완료</Button>
                              )}
                              {req.status === 'MATCHED' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                  onClick={(e) => { e.stopPropagation(); updateRequestStatus(req.id, 'COMPLETED') }}>완료처리</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {selectedRequest && (
              <>
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50/50 border-b">
                      <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" />요청 상세</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div><p className="text-sm text-gray-500 mb-1">수리 종류</p><p className="font-semibold">{selectedRequest.title}</p></div>
                      <div><p className="text-sm text-gray-500 mb-1">상세 설명</p><p className="text-gray-800 bg-gray-50 p-3 rounded-lg border">{selectedRequest.description}</p></div>
                      <div><p className="text-sm text-gray-500 mb-1">주소</p><p className="text-gray-800">{selectedRequest.address || '미지정'}</p></div>
                      {selectedRequest.imageUrl && (
                        <div><p className="text-sm text-gray-500 mb-2">첨부 사진</p>
                          <img src={selectedRequest.imageUrl} alt="첨부" className="w-full max-h-80 object-cover rounded-xl border-2" /></div>
                      )}
                    </CardContent>
                  </Card>
                  {selectedRequest.latitude && selectedRequest.longitude && (
                    <Card className="border-2">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" />고객 위치</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div ref={mapRef} className="w-full h-[350px] border-2 rounded-xl overflow-hidden" />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedRequest.latitude && selectedRequest.longitude && (
                  <Card className="border-2 mb-8">
                    <CardHeader className="bg-gradient-to-r from-accent/10 to-orange-50 border-b">
                      <CardTitle className="flex items-center gap-2"><Navigation className="w-5 h-5 text-accent" />10km 내 추천 업체 (매칭점수순)</CardTitle>
                      <CardDescription>신뢰점수 50% + 거리 40% + 인증+5점 + 리뷰/완료건수 보너스</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {loadingMatch ? (
                        <div className="text-center py-8 text-gray-500">업체 검색 중...</div>
                      ) : matchedContractors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">10km 내 업체가 없습니다.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead>순위</TableHead><TableHead>업체명</TableHead><TableHead>연락처</TableHead>
                                <TableHead>주소</TableHead><TableHead>특징</TableHead><TableHead>신뢰점수</TableHead><TableHead>거리</TableHead><TableHead>매칭점수</TableHead><TableHead>배정</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {matchedContractors.map((c, i) => {
                                const isAssigned = selectedRequest?.contractorId === c.id
                                return (
                                <TableRow key={c.id} className={`hover:bg-orange-50/50 ${isAssigned ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}>
                                  <TableCell>
                                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                      i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>#{i + 1}</div>
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    <div className="flex items-center gap-2">
                                      <Link href={`/contractors/${c.id}`} className="hover:text-primary hover:underline">{c.name}</Link>
                                      {c.verified && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">인증</span>}
                                      {isAssigned && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">배정됨</span>}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-gray-600 text-sm">{c.phone}</TableCell>
                                  <TableCell className="text-gray-600 text-sm">{c.address || c.serviceArea}</TableCell>
                                  <TableCell className="text-gray-500 text-xs max-w-[160px]">
                                    {c.description ? (
                                      <span title={c.description}>
                                        {c.description.replace(/^대표자:[^\n]+\n?/, '').slice(0, 50) || c.description.split(' > ').slice(-1)[0] || '-'}
                                      </span>
                                    ) : '-'}
                                  </TableCell>
                                  <TableCell><span className="px-2 py-1 bg-green-50 text-green-700 rounded font-semibold text-sm">{c.trustScore.toFixed(0)}점</span></TableCell>
                                  <TableCell><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-semibold text-sm">{c.distance.toFixed(1)}km</span></TableCell>
                                  <TableCell><span className="px-2 py-1 bg-orange-50 text-orange-700 rounded font-bold text-sm">{c.score.toFixed(1)}</span></TableCell>
                                  <TableCell>
                                    {isAssigned ? (
                                      <span className="text-green-600 text-sm font-semibold">✓ 배정완료</span>
                                    ) : (
                                      <Button size="sm" className="bg-primary hover:bg-primary/90 h-7 text-xs px-3"
                                        onClick={() => assignContractor(selectedRequest!.id, c.id, c.name)}>
                                        배정하기
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* ── 업체 관리 탭 ── */}
        {tab === 'contractors' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>전체 업체 (DB)</CardDescription>
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary">{stats.total.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>인증 업체 (KISCON 포함)</CardDescription>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-green-600">{stats.verified.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>평균 신뢰점수</CardDescription>
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-amber-600">{stats.avgTrustScore.toFixed(1)}점</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* 신뢰점수 안내 */}
            <Card className="mb-6 border border-blue-100 bg-blue-50/40">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />신뢰점수 산정 기준
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="font-semibold text-gray-700 mb-2">기본점수 — 카카오 카테고리</p>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between"><span>배관/누수 시공업체</span><span className="font-bold text-green-700">88점</span></div>
                      <div className="flex justify-between"><span>전기·냉난방·방수 시공</span><span className="font-bold text-green-700">85점</span></div>
                      <div className="flex justify-between"><span>시공업체 (일반)</span><span className="font-bold text-blue-700">80점</span></div>
                      <div className="flex justify-between"><span>인테리어 브랜드</span><span className="font-bold text-blue-700">82점</span></div>
                      <div className="flex justify-between"><span>인테리어 (일반)</span><span className="font-bold text-blue-700">78점</span></div>
                      <div className="flex justify-between"><span>유관업종</span><span className="font-bold text-gray-500">55–68점</span></div>
                      <div className="flex justify-between"><span>분류 불가</span><span className="font-bold text-gray-500">70점</span></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="font-semibold text-gray-700 mb-2">가감점</p>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between"><span>전화번호 형식 불량</span><span className="font-bold text-red-600">–10점</span></div>
                      <div className="flex justify-between"><span>KISCON 면허 DB 매칭</span><span className="font-bold text-blue-600">+5점 · 인증</span></div>
                    </div>
                    <p className="font-semibold text-gray-700 mt-3 mb-2">향후 반영 예정</p>
                    <div className="space-y-1 text-gray-500">
                      <div className="flex justify-between"><span>리뷰 평점 (4.5점↑)</span><span>+10점</span></div>
                      <div className="flex justify-between"><span>완료 건수 (50건↑)</span><span>+8점</span></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="font-semibold text-gray-700 mb-2">매칭 배정 점수 (고객 요청 시)</p>
                    <div className="space-y-1.5 text-gray-600">
                      <div className="flex justify-between items-center">
                        <span>신뢰점수</span>
                        <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">× 0.5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>거리 점수</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">× 0.4</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>인증 여부</span>
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">+5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>리뷰/완료 건수</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">+2~+8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>전화번호 불량</span>
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">배정 제외</span>
                      </div>
                      <div className="mt-1 pt-1.5 border-t text-gray-400 text-[10px]">
                        거리점수 = (1 – 실거리/반경) × 100
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 border-2">
              <CardContent className="pt-4 space-y-3">
                {/* 지역 필터 - 1단계: 시/도 */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">지역</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map((r) => {
                      const val = r === '전체' ? '' : r
                      const isActive = r === '전체' ? selectedTopRegion === '' : selectedTopRegion === val
                      return (
                        <button key={r}
                          onClick={() => {
                            setSelectedTopRegion(val)
                            setSelectedSubRegion('')
                            setSubSubRegions([])
                            setRegionFilter(val)
                            setContractorPage(1)
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {r}
                        </button>
                      )
                    })}
                  </div>

                  {/* 2단계: 구/시 */}
                  {selectedTopRegion && SUB_REGIONS[selectedTopRegion] && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-2 border-l-2 border-blue-200">
                      <button
                        onClick={() => {
                          setSelectedSubRegion('')
                          setSubSubRegions([])
                          setRegionFilter(selectedTopRegion)
                          setContractorPage(1)
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedSubRegion === '' && regionFilter === selectedTopRegion
                            ? 'bg-blue-400 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}>
                        전체
                      </button>
                      {SUB_REGIONS[selectedTopRegion].map((sub) => (
                        <button key={sub}
                          onClick={async () => {
                            setSelectedSubRegion(sub)
                            setRegionFilter(sub)
                            setContractorPage(1)
                            setSubSubRegions([])
                            setLoadingSubSub(true)
                            try {
                              const res = await fetch(`/api/contractors/subregions?area=${encodeURIComponent(sub)}`)
                              setSubSubRegions(await res.json())
                            } catch { setSubSubRegions([]) }
                            finally { setLoadingSubSub(false) }
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedSubRegion === sub
                              ? 'bg-blue-400 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}>
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 3단계: 동/읍/면/로 */}
                  {selectedSubRegion && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-4 border-l-2 border-sky-200">
                      {loadingSubSub ? (
                        <span className="text-xs text-gray-400 py-1">불러오는 중...</span>
                      ) : subSubRegions.length === 0 ? (
                        <span className="text-xs text-gray-400 py-1">세부 지역 없음</span>
                      ) : (
                        <>
                          <button
                            onClick={() => { setRegionFilter(selectedSubRegion); setContractorPage(1) }}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              regionFilter === selectedSubRegion
                                ? 'bg-sky-400 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                            }`}>
                            전체
                          </button>
                          {subSubRegions.map((s) => (
                            <button key={s}
                              onClick={() => { setRegionFilter(s); setContractorPage(1) }}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                regionFilter === s
                                  ? 'bg-sky-400 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                              }`}>
                              {s}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {/* 카테고리 필터 */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">카테고리</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(({ label, keyword }) => (
                      <button key={label}
                        onClick={() => { setCategoryFilter(keyword); setContractorPage(1) }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          categoryFilter === keyword
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 검색 + 인증 필터 + 뷰 전환 */}
                <div className="flex flex-col md:flex-row gap-3">
                  <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <Input placeholder="업체명 또는 지역 검색..." value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)} className="flex-1" />
                    <Button type="submit" variant="outline" className="gap-2">
                      <Search className="w-4 h-4" />검색
                    </Button>
                  </form>
                  <div className="flex gap-2 flex-wrap">
                    {([['all', '전체'], ['true', '인증됨'], ['false', '미인증']] as const).map(([key, label]) => (
                      <Button key={key} variant={verifiedFilter === key ? 'default' : 'outline'} size="sm"
                        onClick={() => { setVerifiedFilter(key); setContractorPage(1) }}>{label}</Button>
                    ))}
                    {([
                      ['hide', '광고성 제외', 'bg-slate-600 hover:bg-slate-700', 'border-slate-300 text-slate-600 hover:bg-slate-50'],
                      ['all',  '전체 보기',   'bg-gray-500 hover:bg-gray-600',   'border-gray-300 text-gray-500 hover:bg-gray-50'],
                      ['only', '광고성만 보기','bg-red-600 hover:bg-red-700',     'border-red-300 text-red-600 hover:bg-red-50'],
                    ] as const).map(([val, label, activeClass, inactiveClass]) => (
                      <Button key={val} size="sm"
                        variant={spamFilter === val ? 'default' : 'outline'}
                        onClick={() => { setSpamFilter(val); setContractorPage(1) }}
                        className={spamFilter === val ? activeClass : inactiveClass}>
                        {label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-1 border rounded-lg p-1">
                    <button onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                      <List className="w-4 h-4" />목록
                    </button>
                    <button onClick={() => setViewMode('map')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Map className="w-4 h-4" />지도
                    </button>
                  </div>
                  <Link href="/contractors/join">
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 whitespace-nowrap">
                      <Users className="w-4 h-4" />업체 가입 신청
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 지도 뷰 */}
            {viewMode === 'map' && (
              <Card className="mb-6 border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="w-4 h-4 text-primary" />업체 분포 지도
                    </CardTitle>
                    <span className="text-sm text-gray-500">
                      {loadingMap ? '로딩 중...' : `${mapContractors.length}개 업체 표시`}
                      <span className="ml-3 inline-flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-blue-600 inline-block" />인증</span>
                      <span className="ml-2 inline-flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-gray-400 inline-block" />미인증</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0 relative">
                  {loadingMap && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 h-[600px]">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div ref={contractorMapRef} className="w-full h-[600px]" />
                </CardContent>
              </Card>
            )}

            {viewMode === 'list' && <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-green-600" />업체 목록</CardTitle>
                  <span className="text-sm text-gray-500">총 {contractorTotal.toLocaleString()}개</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingContractors ? (
                  <div className="text-center py-12 text-gray-500">로딩 중...</div>
                ) : contractors.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">검색 결과가 없습니다.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>업체명</TableHead><TableHead>전화번호</TableHead><TableHead>주소</TableHead>
                          <TableHead>카테고리</TableHead><TableHead>특징</TableHead><TableHead>신뢰점수</TableHead><TableHead>인증</TableHead><TableHead>액션</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractors.map((c) => (
                          <TableRow key={c.id} className={`hover:bg-green-50/30 ${isSpam(c.description) ? 'opacity-60 bg-red-50/30' : ''}`}>
                            <TableCell className="font-semibold">
                              <div className="flex items-center gap-1.5">
                                <Link href={`/contractors/${c.id}`} className="hover:text-primary hover:underline">{c.name}</Link>
                                {isSpam(c.description) && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs">광고성</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">{c.phone}</TableCell>
                            <TableCell className="text-gray-600 text-sm">{c.address || c.serviceArea}</TableCell>
                            <TableCell className="text-gray-500 text-xs max-w-[120px] truncate" title={c.description || ''}>
                              {c.description?.split(' > ').slice(-1)[0] || '-'}
                            </TableCell>
                            <TableCell className="text-gray-500 text-xs max-w-[160px]">
                              {c.description ? (
                                <span className="line-clamp-2 leading-relaxed" title={c.description}>
                                  {c.description.replace(/^대표자:[^\n]+\n?/, '').slice(0, 60) || '-'}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                c.trustScore >= 85 ? 'bg-green-100 text-green-700' :
                                c.trustScore >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                              }`}>{c.trustScore.toFixed(0)}점</span>
                            </TableCell>
                            <TableCell>
                              <button onClick={() => toggleVerified(c.id, c.verified)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                                  c.verified ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}>
                                {c.verified ? <><ShieldCheck className="w-3 h-3" />인증</> : <><ShieldOff className="w-3 h-3" />미인증</>}
                              </button>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                onClick={() => deleteContractor(c.id, c.name)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {contractorTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-sm text-gray-500">{contractorPage} / {contractorTotalPages} 페이지</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={contractorPage <= 1} onClick={() => setContractorPage(p => p - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={contractorPage >= contractorTotalPages} onClick={() => setContractorPage(p => p + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>}
          </>
        )}
      </div>
    </div>
  )
}
