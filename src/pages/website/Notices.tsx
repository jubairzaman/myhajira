import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, Search, ChevronRight, Download, Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWebsiteNotices } from '@/hooks/queries/useWebsiteCMS';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const categories = [
  { value: 'all', label: 'সব' },
  { value: 'general', label: 'সাধারণ' },
  { value: 'exam', label: 'পরীক্ষা' },
  { value: 'holiday', label: 'ছুটি' },
  { value: 'event', label: 'অনুষ্ঠান' },
  { value: 'admission', label: 'ভর্তি' },
];

export default function Notices() {
  const { data: notices, isLoading } = useWebsiteNotices(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotices = notices?.filter(notice => {
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notice.title_bn?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exam': return 'bg-blue-100 text-blue-700';
      case 'holiday': return 'bg-green-100 text-green-700';
      case 'event': return 'bg-purple-100 text-purple-700';
      case 'admission': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">নোটিশ বোর্ড</h1>
          <p className="text-lg opacity-80">Notice Board</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={selectedCategory === cat.value ? 'bg-[#4B0082]' : ''}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="নোটিশ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#4B0082]/30 border-t-[#4B0082] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-bengali">লোড হচ্ছে...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bengali text-lg">কোনো নোটিশ পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices.map((notice) => (
                <Card key={notice.id} className="border-0 shadow-md hover:shadow-xl transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <Calendar className="w-4 h-4" />
                          {notice.publish_date && format(new Date(notice.publish_date), 'dd MMM yyyy', { locale: bn })}
                        </div>
                        {notice.is_pinned && (
                          <Pin className="w-4 h-4 text-[#00D4FF]" />
                        )}
                      </div>
                      <Badge className={getCategoryColor(notice.category)}>
                        {getCategoryLabel(notice.category)}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 font-bengali line-clamp-2 group-hover:text-[#4B0082] transition-colors">
                        {notice.title_bn || notice.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 font-bengali mb-4">
                        {(notice.content_bn || notice.content).replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/website/notices/${notice.id}`}
                          className="inline-flex items-center text-[#4B0082] font-medium text-sm hover:underline"
                        >
                          বিস্তারিত পড়ুন
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                        {notice.attachment_url && (
                          <a
                            href={notice.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-[#4B0082]"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
